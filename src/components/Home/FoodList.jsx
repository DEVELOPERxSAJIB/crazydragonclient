import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProducts,
  getAllCategories,
} from "../../features/products/productApiSlice";
import ProductModal from "../ProductModal";
import { addToCart } from "../../features/cart/cartApiSlice";
import { toast } from "react-hot-toast";
import { useLocation } from "../../context/LocationContext";
import CategoryCarousel from "../CategoryCarousel";

const getPriceValue = (price) => {
  if (!price && price !== 0) return NaN;
  const num = parseFloat(price);
  return Number.isFinite(num) ? num : NaN;
};

const FoodList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    products,
    categories: allCategories,
    loading,
  } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { hasLocation, setShowLocationModal } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getAllCategories());
  }, [dispatch]);

  // Get categories - use fetched categories or extract from products as fallback
  const categories = (() => {
    if (allCategories && allCategories.length > 0) {
      return ["All", ...allCategories.map((cat) => cat.name)];
    }
    // Fallback: extract from products
    if (!products || products.length === 0) return ["All"];
    const uniqueCategories = [
      ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
    ];
    return ["All", ...uniqueCategories];
  })();

  const filterAndSort = useCallback(
    (items) => {
      // Filter by search
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );

      const copied = [...filtered];

      const compareByNameAsc = (a, b) => a.name.localeCompare(b.name);
      const compareByNameDesc = (a, b) => b.name.localeCompare(a.name);

      const compareByPriceLow = (a, b) => {
        const pa = getPriceValue(a.price);
        const pb = getPriceValue(b.price);
        const aIsNaN = Number.isNaN(pa);
        const bIsNaN = Number.isNaN(pb);
        if (aIsNaN && bIsNaN) return 0;
        if (aIsNaN) return 1;
        if (bIsNaN) return -1;
        return pa - pb;
      };

      const compareByPriceHigh = (a, b) => {
        const pa = getPriceValue(a.price);
        const pb = getPriceValue(b.price);
        const aIsNaN = Number.isNaN(pa);
        const bIsNaN = Number.isNaN(pb);
        if (aIsNaN && bIsNaN) return 0;
        if (aIsNaN) return 1;
        if (bIsNaN) return -1;
        return pb - pa;
      };

      switch (sort) {
        case "az":
          return copied.sort(compareByNameAsc);
        case "za":
          return copied.sort(compareByNameDesc);
        case "low":
          return copied.sort(compareByPriceLow);
        case "high":
          return copied.sort(compareByPriceHigh);
        default:
          return copied;
      }
    },
    [search, sort]
  );

  // Group products by category
  const productsByCategory = (() => {
    if (!products) return {};
    return products.reduce((acc, product) => {
      const categoryName = product.category?.name || "Uncategorized";
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {});
  })();

  // Process items based on selected category
  const displayData = (() => {
    if (selectedCategory === "All") {
      return Object.entries(productsByCategory).map(([category, items]) => ({
        category,
        items: filterAndSort(items),
      }));
    } else {
      const items = productsByCategory[selectedCategory] || [];
      return [{ category: selectedCategory, items: filterAndSort(items) }];
    }
  })();

  const handleAddToCart = (product) => {
    // Check delivery location first
    if (!hasLocation()) {
      toast.error("Please set your delivery location first", {
        icon: "",
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
      navigate('/signin')
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5A1E5A]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-12">
      {/* CATEGORY CAROUSEL */}
      <CategoryCarousel
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* SEARCH + SORT */}
      <div className="px-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
              />
            </svg>
          </span>

          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-12 py-3 rounded-full border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A1E5A] focus:border-transparent placeholder-gray-400 transition-all duration-200"
          />
        </div>

        <div className="relative w-full md:w-auto">
          <select
            className="w-full md:w-auto px-5 py-3 rounded-full border border-gray-100 shadow-sm bg-white text-gray-700 focus:outline-none cursor-pointer transition-all duration-200 hover:shadow-md"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Default</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS DISPLAY */}
      <div className="px-4 space-y-12">
        {displayData.map((categoryData, idx) => (
          <div key={idx}>
            {selectedCategory === "All" && (
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {categoryData.category}
              </h2>
            )}

            {categoryData.items && categoryData.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categoryData.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center bg-white/80 backdrop-blur rounded-2xl border border-stone-50 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex flex-col w-[60%]">
                      <Link
                        to={`/product/${item._id}`}
                        className="text-[20px] font-bold text-gray-900 leading-tight hover:text-[#5A1E5A]"
                      >
                        {item.name}
                      </Link>

                      <p className="text-[15px] font-semibold text-[#5A1E5A] mt-1">
                        €{item.price?.toFixed(2)}
                      </p>

                      {item.description && (
                        <p className="text-gray-500 text-[14px] mt-2 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="relative w-[115px] h-[115px]">
                      <img
                        src={
                          item.image?.url ||
                          "https://via.placeholder.com/150x150?text=No+Image"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl shadow-sm"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/150x150?text=No+Image";
                        }}
                      />

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="absolute bottom-2 right-2 bg-[#5A1E5A] text-white rounded-full p-2 shadow-md hover:bg-[#702870] hover:scale-110 transition"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center max-w-md">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-24 w-24 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    No products available in this category at the moment.
                  </p>
                  {selectedCategory !== "All" && (
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="mt-6 px-6 py-2 bg-[#5A1E5A] text-white rounded-full hover:bg-[#702870] transition-colors duration-200"
                    >
                      View All Categories
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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

export default FoodList;
