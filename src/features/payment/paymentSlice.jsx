// Payment Slice
import { createSlice } from "@reduxjs/toolkit";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
  requestRefund,
} from "./paymentApiSlice";

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    clientSecret: null,
    paymentIntent: null,
    selectedPayment: null,
    paymentHistory: [],
    totalPayments: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    processing: false,
    error: null,
    message: null,
    paymentMethod: "ideal", // ideal or card
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearPaymentMessage: (state) => {
      state.message = null;
    },
    clearClientSecret: (state) => {
      state.clientSecret = null;
      state.paymentIntent = null;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.payload.clientSecret;
        state.paymentIntent = action.payload.payload.paymentIntent;
        state.message = action.payload.message;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Confirm payment
      .addCase(confirmPayment.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.processing = false;
        state.message = action.payload.message;
        state.clientSecret = null;
        state.paymentIntent = null;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })
      
      // Get payment history
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload.payload.payments;
        state.totalPayments = action.payload.payload.pagination?.total || 0;
        state.currentPage = action.payload.payload.pagination?.page || 1;
        state.totalPages = action.payload.payload.pagination?.pages || 1;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get payment by ID
      .addCase(getPaymentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPayment = action.payload.payload.payment;
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Request refund
      .addCase(requestRefund.pending, (state) => {
        state.processing = true;
      })
      .addCase(requestRefund.fulfilled, (state, action) => {
        state.processing = false;
        state.message = action.payload.message;
      })
      .addCase(requestRefund.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPaymentError,
  clearPaymentMessage,
  clearClientSecret,
  setPaymentMethod,
} = paymentSlice.actions;

export default paymentSlice.reducer;
