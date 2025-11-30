// Cart API Slice
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Get cart
export const getCart = createAsyncThunk("cart/getCart", async () => {
  try {
    const response = await api.get("/cart");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch cart");
  }
});

// Add to cart
export const addToCart = createAsyncThunk("cart/addToCart", async (data) => {
  try {
    const response = await api.post("/cart/add", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add to cart");
  }
});

// Update cart item
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }) => {
    try {
      const response = await api.put(`/cart/update/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update cart");
    }
  }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to remove from cart");
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk("cart/clearCart", async () => {
  try {
    const response = await api.delete("/cart/clear");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to clear cart");
  }
});

// Apply voucher
export const applyVoucher = createAsyncThunk(
  "cart/applyVoucher",
  async (voucherCode) => {
    try {
      const response = await api.post("/cart/apply-voucher", { code: voucherCode });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Invalid voucher code");
    }
  }
);
