// Order API Slice
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Create order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData) => {
    try {
      const response = await api.post("/orders", orderData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

// Get my orders
export const getMyOrders = createAsyncThunk(
  "orders/getMyOrders",
  async ({ page = 1, limit = 10, status } = {}) => {
    try {
      let url = `/orders/orders?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, reason }) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
);

// Track order
export const trackOrder = createAsyncThunk(
  "orders/trackOrder",
  async (orderNumber) => {
    try {
      const response = await api.get(`/orders/track/${orderNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to track order");
    }
  }
);

// Reorder
export const reorder = createAsyncThunk("orders/reorder", async (orderId) => {
  try {
    const response = await api.post(`/orders/${orderId}/reorder`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reorder");
  }
});
