// Wallet API Slice
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Get wallet balance
export const getWallet = createAsyncThunk(
  "wallet/getWallet",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/wallet`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get wallet transactions
export const getTransactions = createAsyncThunk(
  "wallet/getTransactions",
  async ({ page = 1, limit = 10, type = "" }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/wallet/transactions?page=${page}&limit=${limit}&type=${type}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add funds to wallet
export const addFunds = createAsyncThunk(
  "wallet/addFunds",
  async ({ amount, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/wallet/add-funds`, {
        amount,
        paymentMethod,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Use wallet for payment
export const useWalletForPayment = createAsyncThunk(
  "wallet/useWalletForPayment",
  async ({ orderId, amount }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/wallet/use`, {
        orderId,
        amount,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
