// Product Card Component
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../features/cart/cartApiSlice";
import { toast } from "react-hot-toast";
import ProductModal from "../ProductModal";
import LoginModal from "../Auth/LoginModal";
import { useLocation } from "../../context/LocationContext";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { hasLocation, setShowLocationModal } = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState(null);

  const handleCardClick = () => {
    // Check delivery location first
    if (!hasLocation()) {
      toast.error("Please set your delivery location first", {
        icon: "📍",
        duration: 4000,
      });
      // Ensure product modal is closed before opening location modal
      setShowModal(false);
      setShowLocationModal(true);
      return;
    }

    // Location is set, show product modal
    setShowModal(true);
  };

  const handleAddToCart = async (cartItem) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save the cart item to add after login
      setPendingCartItem(cartItem);
      // Close product modal and open login modal
      setShowModal(false);
      setShowLoginModal(true);
      return;
    }

    try {
      await dispatch(addToCart(cartItem)).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Failed to add to cart";
      toast.error(errorMessage);
    }
  };

  const handleLoginSuccess = async () => {
    // After successful login, add the pending cart item
    if (pendingCartItem) {
      try {
        await dispatch(addToCart(pendingCartItem)).unwrap();
        toast.success(`${product.name} added to cart!`);
        setPendingCartItem(null);
        // Reopen the product modal
        setShowModal(true);
      } catch (error) {
        const errorMessage =
          typeof error === "string"
            ? error
            : error?.message || "Failed to add to cart";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
      >
        <div className="relative overflow-hidden">
          <img
            src={
              product.image?.url ||
              product.image ||
              "https://via.placeholder.com/400x300?text=No+Image"
            }
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
          {product.discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
              -{product.discount}%
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-lg font-bold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs text-gray-500 uppercase">
              {product.category?.name || product.category}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {product.discount > 0 ? (
                <>
                  <span className="text-xl font-bold text-red-600">
                    €{product.discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    €{product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-800">
                  €{product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {product.rating?.toFixed(1) || "0.0"}
              </span>
              <span className="text-xs text-gray-500">
                ({product.reviewCount || 0})
              </span>
            </div>
          </div>

          <button
            onClick={handleCardClick}
            disabled={product.stock === 0}
            className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      <ProductModal
        product={product}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddToCart={handleAddToCart}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default ProductCard;
