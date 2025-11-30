// Payment API Slice
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Create payment intent (iDEAL or Card)
export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async ({ orderId, paymentMethod = "ideal" }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payment/create-intent`, {
        orderId,
        paymentMethod,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Confirm payment
export const confirmPayment = createAsyncThunk(
  "payment/confirmPayment",
  async ({ paymentIntentId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payment/confirm`, {
        paymentIntentId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get payment history
export const getPaymentHistory = createAsyncThunk(
  "payment/getPaymentHistory",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/payment/history?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get payment by ID
export const getPaymentById = createAsyncThunk(
  "payment/getPaymentById",
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Request refund
export const requestRefund = createAsyncThunk(
  "payment/requestRefund",
  async ({ paymentIntentId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payment/refund`, {
        paymentIntentId,
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
