import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  Wallet,
  Banknote,
  ShoppingBag,
  ChevronRight,
  CheckCircle,
  TruckIcon,
  Store,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getCart } from "../features/cart/cartApiSlice";
import { createOrder } from "../features/orders/orderApiSlice";
import { createPaymentIntent } from "../features/payment/paymentApiSlice";
import { checkDeliverySetup } from "../utils/locationValidator";
import { useLocation } from "../context/LocationContext";
import LocationModal from "../components/Location/LocationModal";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { showLocationModal, setShowLocationModal, selectedLocation } =
    useLocation();

  // Load saved address from localStorage
  const getSavedDeliveryInfo = () => {
    const mode = localStorage.getItem("deliveryMode");
    const address = localStorage.getItem("deliveryAddress");
    const lat = localStorage.getItem("deliveryLat");
    const lng = localStorage.getItem("deliveryLng");
    const fee = localStorage.getItem("deliveryFee");

    if (mode && address) {
      return {
        mode,
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        fee: fee ? parseFloat(fee) : 2.5,
      };
    }
    return null;
  };

  const savedDelivery = getSavedDeliveryInfo();

  const [deliveryType, setDeliveryType] = useState(
    savedDelivery?.mode || "delivery"
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [street] = useState("");
  const [city] = useState("");
  const [postalCode] = useState("");
  const [notes] = useState("");

  // Use location from context or fallback to saved delivery
  const deliveryAddress =
    selectedLocation?.address || savedDelivery?.address || "";

  // Calculate pricing values from cart - use dynamic values from backend
  const subtotal = cart?.subtotal || 0;
  const tax = cart?.tax || 0;
  const taxRate = cart?.taxRate || 0;
  const serviceFee = cart?.serviceFee || 0.5;
  const discount = cart?.discount || 0;
  const deliveryFee =
    deliveryType === "delivery" ? savedDelivery?.fee || 2.5 : 0;
  const total = subtotal + deliveryFee + serviceFee + tax - discount;

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/signin");
      return;
    }

    dispatch(getCart());
  }, [dispatch, isAuthenticated, navigate]);

  const handlePlaceOrder = async () => {
    if (!firstName || !lastName || !email || !phone) {
      toast.error("Please fill in all customer information");
      return;
    }

    // Validate delivery coverage for delivery orders
    if (deliveryType === "delivery") {
      const deliveryCheck = await checkDeliverySetup();

      if (!deliveryCheck.hasLocation) {
        toast.error("Please set your delivery location first", {
          icon: "📍",
          duration: 4000,
        });
        navigate("/");
        return;
      }

      if (!deliveryCheck.isValid) {
        toast.error(deliveryCheck.reason, {
          icon: "🚫",
          duration: 6000,
        });
        return;
      }

      // Check if delivery address is selected
      if (!deliveryAddress) {
        toast.error("Please select your delivery address from the homepage", {
          icon: "📍",
          duration: 4000,
        });
        return;
      }
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      // Use selectedLocation if available, fallback to savedDelivery
      const locationData = selectedLocation || savedDelivery;

      // Parse address into components if we have a full address
      let addressComponents = {
        street: street || "",
        city: city || "",
        postalCode: postalCode || "",
        country: "Netherlands",
      };

      if (deliveryType === "delivery" && deliveryAddress && !street && !city) {
        // Try to parse the address string into components
        // Address format examples: "123 Main Street, Amsterdam, 1234 AB" or "Main Street 123, 1234AB Amsterdam"
        const addressParts = deliveryAddress
          .split(",")
          .map((part) => part.trim());

        if (addressParts.length >= 2) {
          // Assume first part is street
          addressComponents.street = addressParts[0];

          // Try to find postal code and city from remaining parts
          const lastPart = addressParts[addressParts.length - 1];
          const postalCodeMatch = lastPart.match(/\b\d{4}\s*[A-Z]{2}\b/i);

          if (postalCodeMatch) {
            addressComponents.postalCode = postalCodeMatch[0].trim();
            // Remove postal code from string and use the rest as city
            addressComponents.city = lastPart
              .replace(postalCodeMatch[0], "")
              .trim();
          } else {
            // If no postal code found, use last part as city
            addressComponents.city = lastPart;
          }

          // If there's a middle part and we found postal in last, use it as additional city info
          if (addressParts.length === 3 && addressComponents.city) {
            addressComponents.city =
              addressParts[1] +
              (addressComponents.city ? ", " + addressComponents.city : "");
          }
        } else {
          // If can't parse, use the whole address as street
          addressComponents.street = deliveryAddress;
        }
      }

      const orderData = {
        customerInfo: { firstName, lastName, email, phone },
        deliveryInfo: {
          type: deliveryType,
          address:
            deliveryType === "delivery" && locationData
              ? {
                  street: addressComponents.street,
                  city: addressComponents.city,
                  postalCode: addressComponents.postalCode,
                  country: addressComponents.country,
                  coordinates: [locationData.lng, locationData.lat],
                }
              : undefined,
          asap: true,
        },
        pricing: {
          subtotal,
          deliveryFee,
          serviceFee,
          tax,
          taxRate,
          discount,
          total,
        },
        payment: { method: paymentMethod },
        notes,
      };

      // Handle different payment methods
      if (paymentMethod === "cash") {
        // Cash on Delivery - Create order directly
        const orderResult = await dispatch(createOrder(orderData)).unwrap();
        const createdOrderId = orderResult.payload.order._id;
        toast.success("Order placed successfully!");
        navigate(`/order-success/${createdOrderId}`);
      } else if (paymentMethod === "card" || paymentMethod === "ideal") {
        // Online payment - First create the order
        const orderResult = await dispatch(createOrder(orderData)).unwrap();
        const createdOrderId = orderResult.payload.order._id;

        // Store order ID in localStorage for after payment redirect
        localStorage.setItem("pendingOrderId", createdOrderId);
        localStorage.setItem("pendingPaymentMethod", paymentMethod);

        // Create payment intent
        const paymentResult = await dispatch(
          createPaymentIntent({ orderId: createdOrderId, paymentMethod })
        ).unwrap();

        const { clientSecret } = paymentResult.payload;

        toast.loading("Redirecting to payment gateway...");

        // For now, redirect to payment-success page with client secret
        // In production, you would integrate Stripe Elements properly
        navigate(
          `/payment-checkout?client_secret=${clientSecret}&order_id=${createdOrderId}`
        );
      }
    } catch (error) {
      console.error("Order creation error:", error);
      const errorMessage =
        error?.message || error?.error || error || "Failed to place order";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to place order"
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="container h-screen mx-auto my-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate("/products")}
          className="bg-[#501053] text-white font-bold py-3 px-8 rounded-lg"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#501053] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
            <ShoppingBag className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />
            <span>Checkout</span>
          </div>
          {/* <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete Your Order
          </h1> */}
          <p className="text-gray-600">
            Review your order details and proceed to payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-[#501053] to-[#6E3B72] rounded-xl flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-gray-900">
                    Delivery Method
                  </h2>
                  <p className="text-sm text-gray-500">
                    Choose how you'd like to receive your order
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeliveryType("delivery")}
                  className={`relative p-5 border-2 rounded-xl transition-all duration-200 ${
                    deliveryType === "delivery"
                      ? "border-[#501053] bg-gradient-to-br from-purple-50 to-purple-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {deliveryType === "delivery" && (
                    <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-[#501053]" />
                  )}
                  <TruckIcon
                    className={`w-8 h-8 mb-3 mx-auto ${
                      deliveryType === "delivery"
                        ? "text-[#501053]"
                        : "text-gray-400"
                    }`}
                  />
                  <p className="font-semibold text-gray-900">Home Delivery</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Get it delivered to your door
                  </p>
                </button>
                <button
                  onClick={() => setDeliveryType("collection")}
                  className={`relative p-5 border-2 rounded-xl transition-all duration-200 ${
                    deliveryType === "collection"
                      ? "border-[#501053] bg-gradient-to-br from-purple-50 to-purple-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {deliveryType === "collection" && (
                    <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-[#501053]" />
                  )}
                  <Store
                    className={`w-8 h-8 mb-3 mx-auto ${
                      deliveryType === "collection"
                        ? "text-[#501053]"
                        : "text-gray-400"
                    }`}
                  />
                  <p className="font-semibold text-gray-900">Pick Up</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Collect from our store
                  </p>
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-[#501053] to-[#6E3B72] rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-gray-900">
                    Confirm Information
                  </h2>
                  <p className="text-sm text-gray-500">
                    Enter your contact details
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#501053] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#501053] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="relative mt-4">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#501053] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                />
              </div>
              <div className="relative mt-4">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#501053] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Delivery Address */}
            {deliveryType === "delivery" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#501053] to-[#6E3B72] rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[20px] font-semibold text-gray-900">
                        Delivery Address
                      </h2>
                      <p className="text-sm text-gray-500">
                        Your delivery location
                      </p>
                    </div>
                  </div>
                  {deliveryAddress && (
                    <button
                      onClick={() => setShowLocationModal(true)}
                      className="text-sm text-[#501053] hover:text-[#6E3B72] font-medium flex items-center gap-1"
                    >
                      Change <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {deliveryAddress ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                          Selected Delivery Location
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        </p>
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {deliveryAddress}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="bg-white px-3 py-1.5 rounded-lg text-green-700 font-medium shadow-sm">
                            € {deliveryFee.toFixed(2)} Delivery Fee
                          </span>
                          <span className="text-green-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            30-45 min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-50 border-2 border-[#501053] rounded-xl p-5 text-center">
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-amber-900 font-semibold mb-2">
                        No Delivery Address Selected
                      </p>
                      <p className="text-sm text-gray-700 mb-4">
                        Please select a delivery address from the homepage
                        before proceeding
                      </p>
                      <button
                        onClick={() => navigate("/")}
                        className="bg-[#501053] hover:bg-[#501053] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        Select Address <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-[#501053] to-[#6E3B72] rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-gray-900">
                    Payment Method
                  </h2>
                  <p className="text-sm text-gray-500">
                    Select your preferred payment option
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <label
                  className={`relative flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "cash"
                      ? "border-[#501053] bg-gradient-to-br from-purple-50 to-purple-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {paymentMethod === "cash" && (
                    <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-[#501053]" />
                  )}
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#501053]"
                  />
                  <div className="ml-4 flex items-center gap-3 flex-1">
                    <Banknote
                      className={`w-7 h-7 ${
                        paymentMethod === "cash"
                          ? "text-[#501053s]"
                          : "text-gray-400"
                      }`}
                    />
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        Cash on Delivery
                      </span>
                      <span className="text-xs text-gray-500">
                        Pay when you receive your order
                      </span>
                    </div>
                  </div>
                </label>
                <label
                  className={`relative flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-[#501053] bg-gradient-to-br from-purple-50 to-purple-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {paymentMethod === "card" && (
                    <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-[#501053]" />
                  )}
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#501053]"
                  />
                  <div className="ml-4 flex items-center gap-3 flex-1">
                    <CreditCard
                      className={`w-7 h-7 ${
                        paymentMethod === "card"
                          ? "text-[#501053]"
                          : "text-gray-400"
                      }`}
                    />
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        Credit/Debit Card
                      </span>
                      <span className="text-xs text-gray-500">
                        Secure online payment
                      </span>
                    </div>
                  </div>
                </label>
                <label
                  className={`relative flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "ideal"
                      ? "border-[#501053] bg-gradient-to-br from-purple-50 to-purple-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {paymentMethod === "ideal" && (
                    <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-[#501053]" />
                  )}
                  <input
                    type="radio"
                    name="payment"
                    value="ideal"
                    checked={paymentMethod === "ideal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#501053]"
                  />
                  <div className="ml-4 flex items-center gap-3 flex-1">
                    <Wallet
                      className={`w-7 h-7 ${
                        paymentMethod === "ideal"
                          ? "text-[#501053]"
                          : "text-gray-400"
                      }`}
                    />
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        iDEAL
                      </span>
                      <span className="text-xs text-gray-500">
                        Popular Dutch payment method
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-[#501053] to-[#6E3B72] rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order Summary
                </h2>
              </div>
              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={
                        item.product?.image?.url ||
                        "https://via.placeholder.com/150x150?text=No+Image"
                      }
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150x150?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-[#501053] mt-1">
                        € {item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-200 pt-5 mt-5 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">€ {subtotal.toFixed(2)}</span>
                </div>
                {deliveryType === "delivery" && (
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium flex items-center gap-1">
                      {/* <TruckIcon className="w-4 h-4" /> */}
                      Delivery Fee
                    </span>
                    <span className="font-semibold">
                      € {deliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Service Fee</span>
                  <span className="font-semibold">
                    € {serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t-2 border-gray-300">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-[#501053]">
                    € {total.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-gradient-to-r from-[#501053] to-[#6E3B72] hover:from-[#6E3B72] hover:to-[#501053] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Place Order - € {total.toFixed(2)}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal onClose={() => setShowLocationModal(false)} />
      )}
    </div>
  );
};

export default Checkout;
