import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllReviews,
  toggleReviewStatus,
  adminDeleteReview,
  respondToReview,
} from "../../features/reviews/reviewApiSlice";
import {
  clearReviewMessage,
  clearReviewError,
} from "../../features/reviews/reviewSlice";
import { toast } from "react-hot-toast";
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare,
  X,
  CheckCircle,
  XCircle,
  Package,
  User,
} from "lucide-react";

const AdminReviews = () => {
  const dispatch = useDispatch();
  const { allReviews, loading, message, error, currentPage, totalPages } =
    useSelector((state) => state.reviews);

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseComment, setResponseComment] = useState("");

  const loadReviews = React.useCallback(() => {
    const status = filter === "all" ? undefined : filter;
    dispatch(getAllReviews({ page, limit: 20, sort, status }));
  }, [dispatch, page, filter, sort]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearReviewMessage());
      loadReviews();
    }
    if (error) {
      toast.error(error);
      dispatch(clearReviewError());
    }
  }, [message, error, dispatch, loadReviews]);

  const handleToggleStatus = async (reviewId) => {
    try {
      await dispatch(toggleReviewStatus(reviewId)).unwrap();
    } catch (error) {
      toast.error(error || "Failed to update review status");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }
    try {
      await dispatch(adminDeleteReview(reviewId)).unwrap();
    } catch (error) {
      toast.error(error || "Failed to delete review");
    }
  };

  const handleRespond = (review) => {
    setSelectedReview(review);
    setResponseComment(review.response?.comment || "");
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseComment.trim()) {
      toast.error("Please enter a response");
      return;
    }
    try {
      await dispatch(
        respondToReview({
          reviewId: selectedReview._id,
          comment: responseComment,
        })
      ).unwrap();
      setShowResponseModal(false);
      setResponseComment("");
      setSelectedReview(null);
    } catch (error) {
      toast.error(error || "Failed to submit response");
    }
  };

  const getRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review Management
          </h1>
          <p className="text-gray-600">
            Manage customer reviews, respond and moderate content
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#480A4C]"
              >
                <option value="all">All Reviews</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#480A4C]"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-end">
              <div className="w-full p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-[#480A4C]">
                  {allReviews?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#480A4C]"></div>
          </div>
        ) : allReviews && allReviews.length > 0 ? (
          <div className="space-y-4">
            {allReviews.map((review) => (
              <div
                key={review._id}
                className={`bg-white rounded-lg shadow p-6 ${
                  !review.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#480A4C]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {review.user?.email}
                        </p>
                      </div>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                      {!review.isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {review.product?.name || "Product"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <div className="flex">
                        {getRatingStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({review.rating}/5)
                      </span>
                    </div>

                    {/* Review Comment */}
                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {/* Admin Response */}
                    {review.response && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-[#480A4C]">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-[#480A4C]" />
                          <span className="text-sm font-semibold text-[#480A4C]">
                            Admin Response
                          </span>
                          <span className="text-xs text-gray-500">
                            by {review.response.respondedBy?.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {review.response.comment}
                        </p>
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(review._id)}
                      className={`p-2 rounded-lg transition ${
                        review.isActive
                          ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                      title={review.isActive ? "Deactivate" : "Activate"}
                    >
                      {review.isActive ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleRespond(review)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                      title="Respond to review"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Delete review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Reviews Found
            </h3>
            <p className="text-gray-600">
              There are no reviews matching your filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Respond to Review
              </h2>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseComment("");
                  setSelectedReview(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Review Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">{selectedReview?.user?.name}</p>
                  <div className="flex">
                    {getRatingStars(selectedReview?.rating)}
                  </div>
                </div>
                <p className="text-gray-700">{selectedReview?.comment}</p>
              </div>

              {/* Response Form */}
              <form onSubmit={handleSubmitResponse}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseComment}
                  onChange={(e) => setResponseComment(e.target.value)}
                  placeholder="Write your response to this review..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#480A4C] resize-none"
                  rows={5}
                  required
                />

                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#480A4C] text-white rounded-lg hover:bg-[#6E3B72] transition font-semibold"
                  >
                    Submit Response
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResponseModal(false);
                      setResponseComment("");
                      setSelectedReview(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
