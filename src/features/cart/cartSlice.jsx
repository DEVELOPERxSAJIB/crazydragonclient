// Cart Slice
import { createSlice } from "@reduxjs/toolkit";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyVoucher,
} from "./cartApiSlice";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null,
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    taxRate: 0,
    deliveryFee: 0,
    serviceFee: 0,
    total: 0,
    itemCount: 0,
    loading: false,
    error: null,
    message: null,
    isCartOpen: false,
    appliedVoucher: null,
  },
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    clearCartError: (state) => {
      state.error = null;
    },
    clearCartMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get cart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.payload.cart;
        state.items = action.payload.payload.cart?.items || [];
        state.subtotal = action.payload.payload.cart?.subtotal || 0;
        state.tax = action.payload.payload.cart?.tax || 0;
        state.taxRate = action.payload.payload.cart?.taxRate || 0;
        state.serviceFee = action.payload.payload.cart?.serviceFee || 0.5;
        state.total = action.payload.payload.cart?.total || 0;
        state.itemCount = action.payload.payload.cart?.itemCount || 0;
        state.appliedVoucher =
          action.payload.payload.cart?.appliedVoucher || null;
        state.discount = action.payload.payload.cart?.discount || 0;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.payload.cart;
        state.items = action.payload.payload.cart?.items || [];
        state.subtotal = action.payload.payload.cart?.subtotal || 0;
        state.tax = action.payload.payload.cart?.tax || 0;
        state.taxRate = action.payload.payload.cart?.taxRate || 0;
        state.serviceFee = action.payload.payload.cart?.serviceFee || 0;
        state.total = action.payload.payload.cart?.total || 0;
        state.itemCount = action.payload.payload.cart?.itemCount || 0;
        state.message = action.payload.message;
        state.isCartOpen = true;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.payload.cart;
        state.items = action.payload.payload.cart?.items || [];
        state.subtotal = action.payload.payload.cart?.subtotal || 0;
        state.tax = action.payload.payload.cart?.tax || 0;
        state.taxRate = action.payload.payload.cart?.taxRate || 0;
        state.serviceFee = action.payload.payload.cart?.serviceFee || 0;
        state.total = action.payload.payload.cart?.total || 0;
        state.itemCount = action.payload.payload.cart?.itemCount || 0;
        state.message = action.payload.message;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.payload.cart;
        state.items = action.payload.payload.cart?.items || [];
        state.subtotal = action.payload.payload.cart?.subtotal || 0;
        state.tax = action.payload.payload.cart?.tax || 0;
        state.taxRate = action.payload.payload.cart?.taxRate || 0;
        state.serviceFee = action.payload.payload.cart?.serviceFee || 0;
        state.total = action.payload.payload.cart?.total || 0;
        state.itemCount = action.payload.payload.cart?.itemCount || 0;
        state.message = action.payload.message;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = null;
        state.items = [];
        state.subtotal = 0;
        state.tax = 0;
        state.taxRate = 0;
        state.serviceFee = 0;
        state.total = 0;
        state.itemCount = 0;
        state.appliedVoucher = null;
        state.discount = 0;
        state.message = action.payload.message;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Apply voucher
      .addCase(applyVoucher.pending, (state) => {
        state.loading = true;
      })
      .addCase(applyVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.payload.cart;
        state.discount = action.payload.payload.cart?.discount || 0;
        state.total = action.payload.payload.cart?.total || 0;
        state.appliedVoucher =
          action.payload.payload.cart?.appliedVoucher || null;
        state.message = action.payload.message;
      })
      .addCase(applyVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  toggleCart,
  openCart,
  closeCart,
  clearCartError,
  clearCartMessage,
} = cartSlice.actions;

export default cartSlice.reducer;
