// Reviews API Slice
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Create review
export const createReview = createAsyncThunk(
  "reviews/createReview",
  async ({ productId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews`, {
        product: productId,
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get product reviews
export const getProductReviews = createAsyncThunk(
  "reviews/getProductReviews",
  async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/reviews/product/${productId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get my reviews
export const getMyReviews = createAsyncThunk(
  "reviews/getMyReviews",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/reviews/my-reviews?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update review
export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async ({ reviewId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, {
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete review
export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return { data: response.data, reviewId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get review statistics for a product
export const getReviewStats = createAsyncThunk(
  "reviews/getReviewStats",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}/stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin: Get all reviews
export const getAllReviews = createAsyncThunk(
  "reviews/getAllReviews",
  async (
    { page = 1, limit = 20, sort = "recent", status },
    { rejectWithValue }
  ) => {
    try {
      let url = `/reviews/admin/all?page=${page}&limit=${limit}&sort=${sort}`;
      if (status) url += `&status=${status}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin: Toggle review status
export const toggleReviewStatus = createAsyncThunk(
  "reviews/toggleReviewStatus",
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/reviews/${reviewId}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin: Delete review
export const adminDeleteReview = createAsyncThunk(
  "reviews/adminDeleteReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/reviews/admin/${reviewId}`);
      return { data: response.data, reviewId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin: Respond to review
export const respondToReview = createAsyncThunk(
  "reviews/respondToReview",
  async ({ reviewId, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/respond`, {
        comment,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
