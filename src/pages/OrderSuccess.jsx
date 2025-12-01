import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CheckCircle, MapPin, Clock, Package } from "lucide-react";
import { getOrderById } from "../features/orders/orderApiSlice";
import { toast } from "react-hot-toast";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await dispatch(getOrderById(orderId)).unwrap();
        setOrder(result.payload.order);
      } catch {
        toast.error("Failed to load order");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (orderId && orderId !== "undefined") {
      fetchOrder();
    } else {
      // If no orderId, redirect to home
      setLoading(false);
      toast.error("Order not found");
      navigate("/");
    }
  }, [orderId, dispatch, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-[#4E1D4D] text-white font-bold py-3 px-8 rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  const getEstimatedDeliveryTime = () => {
    if (order.deliveryInfo.type === "collection") {
      return "Ready in 20-30 minutes";
    }
    return "30-45 minutes";
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Success Header */}
      <div className="bg-white rounded-xl shadow-md p-8 text-center mb-6 border border-gray-100">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mb-4">
          Thank you for your order. We've received your order and will start
          preparing it shortly.
        </p>

        <div className="bg-[#4E1D4D]/10 border-2 border-[#4E1D4D] rounded-xl px-6 py-4 inline-block shadow-sm">
          <p className="text-sm text-gray-600">Order Number</p>
          <p className="text-2xl font-bold text-[#4E1D4D] tracking-wide">
            #{order.orderNumber}
          </p>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex gap-1">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#4E1D4D]">
            <Clock className="w-6 h-6 text-[#4E1D4D]" />
            Estimated Time:
          </h2>
          <p className="text-[20px] font-semibold text-gray-800">
            {getEstimatedDeliveryTime()}
          </p>
        </div>

        {order.deliveryInfo.type === "delivery" &&
          order.deliveryInfo.address && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex">
              <p className="flex items-center gap-2 text-gray-700 font-medium">
                <MapPin className="w-5 h-5 text-[#4E1D4D]" />
                Delivery Address:
              </p>
              <p className="ml-1 text-gray-600">
                {order.deliveryInfo.address.street}{" "}
                {order.deliveryInfo.address.city},{" "}
                {order.deliveryInfo.address.postalCode}
              </p>
            </div>
          )}

        {order.deliveryInfo.type === "collection" && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="flex items-center gap-2 text-gray-700 font-medium">
              <Package className="w-5 h-5 text-[#4E1D4D]" />
              Collection From:
            </p>
            <p className="ml-7 text-gray-600 leading-relaxed">
              Crazy Dragon Restaurant
              <br />
              123 Main Street, Amsterdam
            </p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-[#4E1D4D]">
          Order Items
        </h2>

        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0"
            >
              <img
                src={
                  item.image ||
                  "https://via.placeholder.com/150x150?text=No+Image"
                }
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/150x150?text=No+Image";
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>

                {item.selectedMenuOption && (
                  <p className="text-xs text-gray-500 mt-1">
                    Menu: {item.selectedMenuOption.name}
                  </p>
                )}

                {item.selectedAddons?.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Extras: {item.selectedAddons.map((a) => a.name).join(", ")}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-800">
                  €{item.subtotal.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">
              €{order.pricing.subtotal.toFixed(2)}
            </span>
          </div>

          {order.pricing.deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-semibold">
                €{order.pricing.deliveryFee.toFixed(2)}
              </span>
            </div>
          )}

          {order.pricing.serviceFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-semibold">
                €{order.pricing.serviceFee.toFixed(2)}
              </span>
            </div>
          )}

          {order.pricing.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span className="font-semibold">
                -€{order.pricing.discount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
            <span>Total</span>
            <span className="text-[#4E1D4D]">
              €{order.pricing.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-[#4E1D4D]">
          Payment Information
        </h2>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-semibold capitalize">
              {order.payment.method}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Payment Status</span>
            <span
              className={`font-semibold capitalize ${
                order.payment.status === "paid"
                  ? "text-green-600"
                  : order.payment.status === "pending"
                  ? "text-orange-600"
                  : "text-red-600"
              }`}
            >
              {order.payment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-[#4E1D4D]">
          Customer Information
        </h2>

        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-600">Name:</span>{" "}
            <span className="font-semibold">
              {order.customerInfo.firstName} {order.customerInfo.lastName}
            </span>
          </p>

          <p>
            <span className="text-gray-600">Email:</span>{" "}
            <span className="font-semibold">{order.customerInfo.email}</span>
          </p>

          <p>
            <span className="text-gray-600">Phone:</span>{" "}
            <span className="font-semibold">{order.customerInfo.phone}</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/products")}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition shadow-sm"
        >
          Continue Shopping
        </button>

        <button
          onClick={() => navigate("/orders")}
          className="flex-1 bg-[#4E1D4D] hover:bg-[#3A153C] text-white font-semibold py-3 rounded-lg transition shadow-md"
        >
          View My Orders
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
