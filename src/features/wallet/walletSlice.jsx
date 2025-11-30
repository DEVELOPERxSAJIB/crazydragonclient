// Wallet Slice
import { createSlice } from "@reduxjs/toolkit";
import {
  getWallet,
  getTransactions,
  addFunds,
  useWalletForPayment,
} from "./walletApiSlice";

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    wallet: null,
    balance: 0,
    transactions: [],
    totalTransactions: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    processing: false,
    error: null,
    message: null,
  },
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
    clearWalletMessage: (state) => {
      state.message = null;
    },
    // Real-time wallet update
    updateWalletBalanceRealtime: (state, action) => {
      if (state.wallet) {
        state.wallet.balance = action.payload.balance;
        if (action.payload.transactions) {
          state.wallet.transactions = action.payload.transactions;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get wallet
      .addCase(getWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload.payload.wallet;
        state.balance = action.payload.payload.wallet?.balance || 0;
      })
      .addCase(getWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get transactions
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.payload.transactions;
        state.totalTransactions = action.payload.payload.pagination?.total || 0;
        state.currentPage = action.payload.payload.pagination?.page || 1;
        state.totalPages = action.payload.payload.pagination?.pages || 1;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add funds
      .addCase(addFunds.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(addFunds.fulfilled, (state, action) => {
        state.processing = false;
        state.wallet = action.payload.payload.wallet;
        state.balance = action.payload.payload.wallet?.balance || 0;
        state.message = action.payload.message;
      })
      .addCase(addFunds.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })

      // Use wallet for payment
      .addCase(useWalletForPayment.pending, (state) => {
        state.processing = true;
      })
      .addCase(useWalletForPayment.fulfilled, (state, action) => {
        state.processing = false;
        state.wallet = action.payload.payload.wallet;
        state.balance = action.payload.payload.wallet?.balance || 0;
        state.message = action.payload.message;
      })
      .addCase(useWalletForPayment.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearWalletError,
  clearWalletMessage,
  updateWalletBalanceRealtime,
} = walletSlice.actions;

export default walletSlice.reducer;
