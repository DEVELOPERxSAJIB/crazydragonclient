import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../features/cart/cartApiSlice";
import { closeCart } from "../features/cart/cartSlice";
import { toast } from "react-hot-toast";
import { MapPin, Plus, Minus, X } from "lucide-react";
import { useLocation } from "../context/LocationContext";
import ConfirmModal from "./ConfirmModal";
import api from "../utils/api";

// --- Cart Item Component ---
const CartItem = ({ item, onUpdateQuantity, onRemove, onUpdateAddons }) => {
  const [showAddons, setShowAddons] = useState(true);

  // Handle case where product is null or deleted
  if (!item || !item.product) {
    return null;
  }
  const handleIncrease = () => {
    onUpdateQuantity(item._id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item._id, item.quantity - 1);
    } else {
      onRemove(item._id);
    }
  };

  // Addon management functions
  const handleAddonQuantityChange = (addonProduct, newQuantity) => {
    const currentAddons = item.selectedRecommendedAddons || [];
    let updatedAddons;

    if (newQuantity <= 0) {
      // Remove addon
      updatedAddons = currentAddons.filter((a) => a.product !== addonProduct);
    } else {
      // Update quantity
      updatedAddons = currentAddons.map((a) =>
        a.product === addonProduct ? { ...a, quantity: newQuantity } : a
      );
    }

    onUpdateAddons(item._id, updatedAddons);
  };

  const handleRemoveAddon = (addonProduct) => {
    const updatedAddons = (item.selectedRecommendedAddons || []).filter(
      (a) => a.product !== addonProduct
    );
    onUpdateAddons(item._id, updatedAddons);
  };

  const handleAddNewAddon = (addon) => {
    const currentAddons = item.selectedRecommendedAddons || [];
    const updatedAddons = [
      ...currentAddons,
      {
        product: addon._id,
        quantity: 1,
        price: addon.price,
        name: addon.name,
      },
    ];
    onUpdateAddons(item._id, updatedAddons);
  };

  const isAddonSelected = (addonId) => {
    return (item.selectedRecommendedAddons || []).some(
      (a) => a.product === addonId
    );
  };

  // Safe access to product properties with defaults
  const productImage =
    item.product.image?.url || item.product.image || "/placeholder-product.jpg";
  const productName = item.product.name || "Product";
  const productPrice = item.product.price || 0;
  const productCategory =
    item.product.category?.name || item.product.category || "";

  // Calculate total price including recommended addons
  const calculateItemTotal = () => {
    let total = productPrice * item.quantity;

    // Add recommended addons price
    if (
      item.selectedRecommendedAddons &&
      item.selectedRecommendedAddons.length > 0
    ) {
      const addonsTotal = item.selectedRecommendedAddons.reduce(
        (sum, addon) => sum + (addon.price || 0) * (addon.quantity || 1),
        0
      );
      total += addonsTotal * item.quantity;
    }

    return total;
  };

  return (
    <div className="py-4 border-b border-gray-100">
      <div className="flex gap-3">
        <img
          src={productImage}
          alt={productName}
          className="w-16 h-16 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = "/placeholder-product.jpg";
          }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{productName}</h3>
          {productCategory && (
            <p className="text-xs text-gray-500 mt-0.5">{productCategory}</p>
          )}
          <p className="text-sm text-gray-600 mt-0.5">
            €{productPrice.toFixed(2)} each
          </p>
        </div>
      </div>

      {/* Notes */}
      {item.notes && (
        <div className="mt-2 pl-1">
          <p className="text-xs text-gray-500 italic">📝 {item.notes}</p>
        </div>
      )}

      {/* Unified Addons Section - Selected and Available */}
      {((item.selectedRecommendedAddons &&
        item.selectedRecommendedAddons.length > 0) ||
        (item.product.recommendedAddons &&
          item.product.recommendedAddons.length > 0)) && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">🎯 Add-ons</p>
            <button
              onClick={() => setShowAddons(!showAddons)}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
            >
              {showAddons ? "Hide" : "Show"}
            </button>
          </div>

          {showAddons && (
            <div className="space-y-3">
              {/* Selected Addons */}
              {item.selectedRecommendedAddons &&
                item.selectedRecommendedAddons.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      ✓ Selected:
                    </p>
                    {item.selectedRecommendedAddons.map((addon, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs text-gray-600 bg-purple-50 rounded px-2 py-1.5"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-purple-600">+</span>
                          <span className="flex-1">{addon.name}</span>

                          <div className="flex items-center gap-1 bg-white rounded-full px-1 py-0.5 border border-purple-200">
                            <button
                              onClick={() =>
                                handleAddonQuantityChange(
                                  addon.product,
                                  (addon.quantity || 1) - 1
                                )
                              }
                              className="text-purple-600 hover:text-purple-800 p-0.5 cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-medium min-w-4 text-center">
                              {addon.quantity || 1}
                            </span>
                            <button
                              onClick={() =>
                                handleAddonQuantityChange(
                                  addon.product,
                                  (addon.quantity || 1) + 1
                                )
                              }
                              className="text-purple-600 hover:text-purple-800 p-0.5 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            €
                            {(
                              (addon.price || 0) * (addon.quantity || 1)
                            ).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemoveAddon(addon.product)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Available Addons to Add */}
              {item.product.recommendedAddons &&
                item.product.recommendedAddons.length > 0 &&
                item.product.recommendedAddons.filter(
                  (addon) => !isAddonSelected(addon._id)
                ).length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      + Available to add:
                    </p>
                    {item.product.recommendedAddons
                      .filter((addon) => !isAddonSelected(addon._id))
                      .map((addon) => (
                        <label
                          key={addon._id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-purple-50 transition"
                        >
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => handleAddNewAddon(addon)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                          />
                          {addon.image?.url && (
                            <img
                              src={addon.image.url}
                              alt={addon.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {addon.name}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-purple-600">
                            +€{addon.price?.toFixed(2)}
                          </span>
                        </label>
                      ))}
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <p className="text-lg font-bold text-gray-900">
          €{calculateItemTotal().toFixed(2)}
        </p>
        <div className="flex items-center space-x-2 border border-gray-300 rounded-full px-1 py-0.5">
          <button
            onClick={handleDecrease}
            className="text-gray-600 hover:text-[#501053] p-1 transition cursor-pointer"
          >
            {item.quantity === 1 ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            )}
          </button>
          <span className="font-medium text-sm min-w-[20px] text-center">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="text-gray-600 cursor-pointer hover:text-[#501053] p-1 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const CartSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    isCartOpen,
    items,
    subtotal = 0,
    discount = 0,
    tax = 0,
    taxRate = 0,
    deliveryFee = 0,
    serviceFee = 0,
    total = 0,
    loading,
    cart,
  } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { selectedLocation, hasLocation, setShowLocationModal } = useLocation();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Calculate totals if not provided by backend
  const calculatedSubtotal = subtotal || cart?.totalPrice || 0;
  const calculatedTax = tax || 0;
  const calculatedDeliveryFee =
    deliveryFee || storeInfo?.deliverySettings?.deliveryFee || 0;
  const calculatedServiceFee =
    serviceFee || storeInfo?.deliverySettings?.serviceFee || 0.5;
  const calculatedDiscount = discount || 0;
  const calculatedTotal =
    total ||
    calculatedSubtotal +
      calculatedTax +
      calculatedDeliveryFee +
      calculatedServiceFee -
      calculatedDiscount;

  // Helper function to check if store is currently open
  const checkStoreStatus = (store) => {
    if (!store || !store.operatingHours) return false;

    const now = new Date();
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDay = days[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    const hours = store.operatingHours[currentDay];

    if (!hours || !hours.isOpen) return false;

    return currentTime >= hours.open && currentTime <= hours.close;
  };

  // Fetch store information when cart opens
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await api.get("/stores?active=true");
        if (response.data.success && response.data.data?.length > 0) {
          const store = response.data.data[0];
          setStoreInfo(store);
          setIsStoreOpen(checkStoreStatus(store));
        }
      } catch (error) {
        console.error("Error fetching store info:", error);
      }
    };

    if (isCartOpen) {
      fetchStoreInfo();
      if (isAuthenticated) {
        dispatch(getCart());
      }
    }
  }, [dispatch, isCartOpen, isAuthenticated]);

  const handleClose = () => {
    dispatch(closeCart());
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
    } catch (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.message || "Failed to update cart";
      toast.error(errorMsg);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
    } catch (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.message || "Failed to remove item";
      toast.error(errorMsg);
    }
  };

  const handleUpdateAddons = async (itemId, updatedAddons) => {
    try {
      // Get the current item to preserve its quantity
      const currentItem = items.find((item) => item._id === itemId);
      if (!currentItem) {
        toast.error("Item not found");
        return;
      }

      // Call the API to update cart item with new addons
      await api.put(`/cart/update/${itemId}`, {
        quantity: currentItem.quantity,
        selectedRecommendedAddons: updatedAddons,
      });

      // Refresh cart
      await dispatch(getCart()).unwrap();
      toast.success("Add-ons updated successfully");
    } catch (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.message || "Failed to update add-ons";
      toast.error(errorMsg);
    }
  };

  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();
      toast.success("Cart cleared successfully");
    } catch (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.message || "Failed to clear cart";
      toast.error(errorMsg);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      localStorage.setItem("redirectAfterLogin", "/checkout");
      handleClose();
      navigate("/signin");
      return;
    }

    // Check minimum order amount
    const minimumOrder = storeInfo?.deliverySettings?.minimumOrderAmount || 10;
    if (calculatedSubtotal < minimumOrder) {
      toast.error(
        `Minimum order amount is €${minimumOrder.toFixed(2)}. Add €${(
          minimumOrder - calculatedSubtotal
        ).toFixed(2)} more to checkout.`,
        { duration: 5000 }
      );
      return;
    }

    handleClose();
    navigate("/checkout");
  };

  // Check if checkout should be disabled
  const minimumOrderAmount =
    storeInfo?.deliverySettings?.minimumOrderAmount || 10;
  const isCheckoutDisabled =
    loading || calculatedSubtotal < minimumOrderAmount || !isStoreOpen;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[99] ${
          isCartOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <p className="text-sm text-gray-500">{items.length} items</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-[#6E3B72] rounded-full hover:bg-purple-50 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Store Status Banner */}
          {storeInfo && (
            <div
              className={`px-5 py-3 border-b ${
                isStoreOpen
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isStoreOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`}
                  ></div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isStoreOpen ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      {storeInfo.name || "Crazy Dragon"}
                    </p>
                    <p
                      className={`text-xs ${
                        isStoreOpen ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {isStoreOpen ? "Open Now" : "Currently Closed"}
                    </p>
                  </div>
                </div>
                {storeInfo.operatingHours && (
                  <div className="text-right">
                    <p
                      className={`text-xs font-medium ${
                        isStoreOpen ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {(() => {
                        const now = new Date();
                        const days = [
                          "sunday",
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                        ];
                        const currentDay = days[now.getDay()];
                        const hours = storeInfo.operatingHours[currentDay];
                        if (hours && hours.isOpen) {
                          return `${hours.open} - ${hours.close}`;
                        }
                        return "Closed today";
                      })()}
                    </p>
                  </div>
                )}
              </div>
              {!isStoreOpen && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                  ⚠️ Store is currently closed. Orders may not be processed
                  immediately.
                </div>
              )}
            </div>
          )}

          {/* Location Section */}
          {hasLocation() && (
            <div className="px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
              <div className="flex items-center gap-2">
                <MapPin
                  size={16}
                  className="text-green-600 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-green-700 font-medium uppercase">
                    Delivering to
                  </p>
                  <p className="text-sm font-semibold text-green-900 truncate">
                    {selectedLocation?.address
                      ?.split(",")
                      .slice(0, 2)
                      .join(",") || "Your Location"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLocationModal(true), handleClose();
                  }}
                  className="text-xs text-green-700 hover:text-green-900 font-medium underline flex-shrink-0"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* No Location Warning */}
          {!hasLocation() && items.length > 0 && (
            <div className="px-5 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
              <div className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="text-[#5010530 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#501053] font-semibold">
                    Please set your delivery location
                  </p>
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="text-xs text-[#501053] hover:text-orange-900 font-medium underline mt-1"
                  >
                    Select Location
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#501053]"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <svg
                  className="w-24 h-24 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <p className="text-lg text-gray-600 mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-500">
                  Add some delicious items to get started
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {items
                    .filter((item) => item && item.product)
                    .map((item) => (
                      <CartItem
                        key={item._id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                        onUpdateAddons={handleUpdateAddons}
                      />
                    ))}
                </div>

                {items.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full mt-4 text-sm text-[#501053] hover:text-[#6E3B72] font-medium"
                  >
                    Clear Cart
                  </button>
                )}
              </>
            )}
          </div>

          {/* Totals & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-white sticky bottom-0 shadow-lg">
              <div className="space-y-2 text-sm text-gray-700 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>€{calculatedSubtotal.toFixed(2)}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-€{calculatedDiscount.toFixed(2)}</span>
                  </div>
                )}
                {calculatedServiceFee > 0 && (
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>€{calculatedServiceFee.toFixed(2)}</span>
                  </div>
                )}
                {calculatedTax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax {taxRate > 0 ? `(${taxRate}%)` : ""}</span>
                    <span>€{calculatedTax.toFixed(2)}</span>
                  </div>
                )}
                {calculatedDeliveryFee > 0 && (
                  <div className="flex justify-between pb-2 border-b border-dashed border-gray-300">
                    <span>Delivery fee</span>
                    <span>€{calculatedDeliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>€{calculatedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Minimum Order Warning */}
              {calculatedSubtotal < minimumOrderAmount && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-orange-800 font-medium">
                    ⚠️ Minimum order: €{minimumOrderAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Add €{(minimumOrderAmount - calculatedSubtotal).toFixed(2)}{" "}
                    more to checkout
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckoutDisabled}
                className="w-full mt-4 flex items-center justify-center px-4 py-3 text-lg font-bold rounded-xl shadow-lg text-white bg-[#501053] hover:bg-[#6E3B72] disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 cursor-pointer"
              >
                {!isStoreOpen
                  ? "Store Closed"
                  : isCheckoutDisabled &&
                    calculatedSubtotal < minimumOrderAmount
                  ? `Minimum €${minimumOrderAmount.toFixed(2)}`
                  : `Checkout (€${calculatedTotal.toFixed(2)})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearCart}
        title="Clear Cart"
        message="Are you sure you want to clear your cart? All items will be removed."
      />
    </>
  );
};

export default CartSidebar;
