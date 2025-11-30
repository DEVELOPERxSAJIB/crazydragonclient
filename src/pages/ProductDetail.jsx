import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProductById } from "../features/products/productApiSlice";
import { addToCart } from "../features/cart/cartApiSlice";
import {
  createReview,
  getProductReviews,
  deleteReview,
} from "../features/reviews/reviewApiSlice";
import { toast } from "react-hot-toast";
import { Plus, Star, Trash2 } from "lucide-react";
import { useLocation } from "../context/LocationContext";
import ProductModal from "../components/ProductModal";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasLocation, setShowLocationModal } = useLocation();

  const { selectedProduct: product, loading } = useSelector(
    (state) => state.products
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const { productReviews, loading: reviewLoading } = useSelector(
    (state) => state.reviews
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProductById(id));
    dispatch(getProductReviews({ productId: id, page: 1, limit: 50 }));
  }, [dispatch, id]);

  useEffect(() => {
    console.log("Product Reviews:", productReviews);
    console.log("Review Loading:", reviewLoading);
  }, [productReviews, reviewLoading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Prepare images array (main image + additional images)
  const images = [
    product.image?.url || product.image,
    ...(product.images || []).map((img) => img.url || img),
  ].filter(Boolean);

  const handleAddToCart = async (cartItem) => {
    try {
      await dispatch(addToCart(cartItem)).unwrap();
      toast.success("Added to cart!");
      setShowModal(false);
    } catch (error) {
      toast.error(error || "Failed to add to cart");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      await dispatch(createReview({ productId: id, rating, comment })).unwrap();
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      setShowReviewForm(false);
      // Refresh reviews and product data to update rating
      dispatch(getProductReviews({ productId: id, page: 1, limit: 50 }));
      dispatch(getProductById(id));
    } catch (error) {
      toast.error(error || "Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast.success("Review deleted successfully!");
      // Refresh reviews and product data to update rating
      dispatch(getProductReviews({ productId: id, page: 1, limit: 50 }));
      dispatch(getProductById(id));
    } catch (error) {
      toast.error(error || "Failed to delete review");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={images[currentImageIndex] || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                        currentImageIndex === index
                          ? "border-red-600"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={img || "/placeholder-product.jpg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                  {product.category?.name || product.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                {product.discount > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-red-600">
                      €{product.discountedPrice?.toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-400 line-through">
                      €{product.price?.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-600 text-white rounded-md text-sm font-semibold">
                      -{product.discount}%
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">
                    €{product.price?.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating?.toFixed(1) || "0.0"} (
                  {product.numReviews || 0} reviews)
                </span>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => {
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
                  setShowModal(true);
                }}
                disabled={product.stock === 0}
                className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                <Plus className="w-6 h-6" />
                Add to Cart
              </button>

              {/* Menu Options & Addons Preview */}
              {(product.menuOptions?.length > 0 ||
                product.addons?.length > 0) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {product.menuOptions?.length > 0 && (
                      <span>
                        ✓ {product.menuOptions.length} menu options available
                      </span>
                    )}
                    {product.menuOptions?.length > 0 &&
                      product.addons?.length > 0 &&
                      " • "}
                    {product.addons?.length > 0 && (
                      <span>✓ {product.addons.length} add-ons available</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          {product.menuOptions?.length > 0 && (
            <div className="border-t border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Menu Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.menuOptions.map((option) => (
                  <div
                    key={option._id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {option.name}
                        </p>
                        {option.items?.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Includes: {option.items.join(", ")}
                          </p>
                        )}
                      </div>
                      <span className="text-red-600 font-bold">
                        +€{option.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.addons?.length > 0 && (
            <div className="border-t border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Available Add-ons
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {product.addons.map((addon) => (
                  <div
                    key={addon._id}
                    className="p-4 border border-gray-200 rounded-lg text-center"
                  >
                    <p className="font-semibold text-gray-900">{addon.name}</p>
                    <p className="text-red-600 font-bold mt-1">
                      +€{addon.price.toFixed(2)}
                    </p>
                    {addon.category && (
                      <span className="inline-block mt-2 text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                        {addon.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="border-t border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Customer Reviews ({productReviews?.length || 0})
              </h3>
              {user && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-[#480A4C] text-white rounded-lg hover:bg-[#6E3B72] transition"
                >
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && user && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition ${
                              star <= (hoverRating || rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#480A4C] resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#480A4C] text-white rounded-lg hover:bg-[#6E3B72] transition"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviewLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#480A4C] mx-auto"></div>
                </div>
              ) : productReviews && productReviews.length > 0 ? (
                productReviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-6 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {review.user?.name || "Anonymous"}
                          </p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      {user && review.user?._id === user._id && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete review"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-medium">
                    No reviews yet
                  </p>
                  <p className="text-gray-500 mt-2">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart Modal */}
      <ProductModal
        product={product}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductDetail;
