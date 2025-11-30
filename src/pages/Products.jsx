// Products Page
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { getFeaturedProducts } from "../features/products/productApiSlice";
import ProductList from "../components/Products/ProductList";
import ProductModal from "../components/ProductModal";
import { addToCart, getCart } from "../features/cart/cartApiSlice";
import { toast } from "react-hot-toast";
import { useLocation } from "../context/LocationContext";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { featuredProducts, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { hasLocation, setShowLocationModal, selectedLocation } = useLocation();
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(getFeaturedProducts());
  }, [dispatch]);

  // Refresh cart when location changes
  useEffect(() => {
    if (isAuthenticated && selectedLocation) {
      dispatch(getCart());
    }
  }, [selectedLocation, isAuthenticated, dispatch]);

  const handleAddToCart = (product) => {
    // Check delivery location first
    if (!hasLocation()) {
      toast.error("Please set your delivery location first", {
        icon: "📍",
        duration: 4000,
      });
      // Ensure product modal is closed before opening location modal
      setShowProductModal(false);
      setSelectedProduct(null);
      setShowLocationModal(true);
      return;
    }

    // Location is set, show product modal
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleProductAddToCart = async (cartItem) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login first to add items to cart");
      return;
    }

    try {
      await dispatch(addToCart(cartItem)).unwrap();
      toast.success("Item added to cart!");
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Failed to add to cart";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-[#501053] to-[#6E3B72] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
          <p className="text-lg">
            Discover delicious dishes delivered to your door
          </p>
        </div>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Featured Dishes
          </h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A1E5A]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex justify-between items-center bg-white/80 backdrop-blur rounded-2xl border border-stone-50 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex flex-col w-[60%]">
                    <Link
                      to={`/product/${product._id}`}
                      className="text-[20px] font-bold text-gray-900 leading-tight hover:text-[#5A1E5A]"
                    >
                      {product.name}
                    </Link>

                    <p className="text-[15px] font-semibold text-[#5A1E5A] mt-1">
                      €{product.price?.toFixed(2)}
                    </p>

                    {product.description && (
                      <p className="text-gray-500 text-[14px] mt-2 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="relative w-[115px] h-[115px]">
                    <img
                      src={
                        product.image?.url ||
                        product.image ||
                        "https://via.placeholder.com/150x150?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl shadow-sm"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150x150?text=No+Image";
                      }}
                    />

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="absolute bottom-2 right-2 bg-[#5A1E5A] text-white rounded-full p-2 shadow-md hover:bg-[#702870] hover:scale-110 transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Products */}
      <ProductList />

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleProductAddToCart}
        />
      )}
    </div>
  );
};

export default ProductsPage;
