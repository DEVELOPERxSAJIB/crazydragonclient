// Reviews Slice
import { createSlice } from "@reduxjs/toolkit";
import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getReviewStats,
  getAllReviews,
  toggleReviewStatus,
  adminDeleteReview,
  respondToReview,
} from "./reviewApiSlice";

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    productReviews: [],
    myReviews: [],
    allReviews: [],
    reviewStats: null,
    totalReviews: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    clearReviewMessage: (state) => {
      state.message = null;
    },
    clearProductReviews: (state) => {
      state.productReviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        // Add to myReviews if it exists
        state.myReviews.unshift(action.payload.payload.review);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get product reviews
      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = action.payload.payload.reviews;
        state.totalReviews = action.payload.payload.pagination?.total || 0;
        state.currentPage = action.payload.payload.pagination?.page || 1;
        state.totalPages = action.payload.payload.pagination?.pages || 1;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get my reviews
      .addCase(getMyReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.myReviews = action.payload.payload.reviews;
        state.totalReviews = action.payload.payload.pagination?.total || 0;
        state.currentPage = action.payload.payload.pagination?.page || 1;
        state.totalPages = action.payload.payload.pagination?.pages || 1;
      })
      .addCase(getMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        // Update in productReviews
        const productIndex = state.productReviews.findIndex(
          (r) => r._id === action.payload.payload.review._id
        );
        if (productIndex !== -1) {
          state.productReviews[productIndex] = action.payload.payload.review;
        }
        // Update in myReviews
        const myIndex = state.myReviews.findIndex(
          (r) => r._id === action.payload.payload.review._id
        );
        if (myIndex !== -1) {
          state.myReviews[myIndex] = action.payload.payload.review;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        const { reviewId } = action.payload;
        state.productReviews = state.productReviews.filter(
          (r) => r._id !== reviewId
        );
        state.myReviews = state.myReviews.filter((r) => r._id !== reviewId);
        state.message = action.payload.data.message;
        state.totalReviews = Math.max(0, state.totalReviews - 1);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Get review stats
      .addCase(getReviewStats.fulfilled, (state, action) => {
        state.reviewStats = action.payload.payload.stats;
      })

      // Admin: Get all reviews
      .addCase(getAllReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.allReviews = action.payload.payload.reviews;
        state.totalReviews = action.payload.payload.pagination?.total || 0;
        state.currentPage = action.payload.payload.pagination?.page || 1;
        state.totalPages = action.payload.payload.pagination?.pages || 1;
      })
      .addCase(getAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: Toggle review status
      .addCase(toggleReviewStatus.fulfilled, (state, action) => {
        const updatedReview = action.payload.payload.review;
        const index = state.allReviews.findIndex(
          (r) => r._id === updatedReview._id
        );
        if (index !== -1) {
          state.allReviews[index] = updatedReview;
        }
        state.message = action.payload.message;
      })
      .addCase(toggleReviewStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Admin: Delete review
      .addCase(adminDeleteReview.fulfilled, (state, action) => {
        const { reviewId } = action.payload;
        state.allReviews = state.allReviews.filter((r) => r._id !== reviewId);
        state.message = action.payload.data.message;
        state.totalReviews = Math.max(0, state.totalReviews - 1);
      })
      .addCase(adminDeleteReview.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Admin: Respond to review
      .addCase(respondToReview.fulfilled, (state, action) => {
        const updatedReview = action.payload.payload.review;
        const allIndex = state.allReviews.findIndex(
          (r) => r._id === updatedReview._id
        );
        if (allIndex !== -1) {
          state.allReviews[allIndex] = updatedReview;
        }
        const productIndex = state.productReviews.findIndex(
          (r) => r._id === updatedReview._id
        );
        if (productIndex !== -1) {
          state.productReviews[productIndex] = updatedReview;
        }
        state.message = action.payload.message;
      })
      .addCase(respondToReview.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearReviewError, clearReviewMessage, clearProductReviews } =
  reviewSlice.actions;

export default reviewSlice.reducer;
