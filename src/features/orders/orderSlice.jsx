// Order Slice
import { createSlice } from "@reduxjs/toolkit";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
  reorder,
} from "./orderApiSlice";

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    selectedOrder: null,
    trackingInfo: null,
    totalOrders: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    message: null,
    orderCreated: false,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearOrderMessage: (state) => {
      state.message = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    resetOrderCreated: (state) => {
      state.orderCreated = false;
    },
    // Real-time updates
    updateOrderStatusRealtime: (state, action) => {
      const { orderId, status, order: updatedOrder } = action.payload;

      // Update in orders list
      const index = state.orders.findIndex((order) => order._id === orderId);
      if (index !== -1) {
        if (updatedOrder) {
          state.orders[index] = updatedOrder;
        } else {
          state.orders[index].status = status;
        }
      }

      // Update selected order if it matches
      if (state.selectedOrder?._id === orderId) {
        if (updatedOrder) {
          state.selectedOrder = updatedOrder;
        } else {
          state.selectedOrder.status = status;
        }
      }
    },
    addNewOrderRealtime: (state, action) => {
      // Add new order to beginning of list
      state.orders.unshift(action.payload);
      state.totalOrders += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orderCreated = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.payload.order;
        state.message = action.payload.message;
        state.orderCreated = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.orderCreated = false;
      })

      // Get my orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.payload.orders;
        state.totalOrders = action.payload.payload.pagination?.total || 0;
        state.currentPage = action.payload.payload.pagination?.page || 1;
        state.totalPages = action.payload.payload.pagination?.pages || 1;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Get order by ID
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.payload.order;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.payload.order;
        state.message = action.payload.message;
        // Update order in list
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.payload.order._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.payload.order;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Track order
      .addCase(trackOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.trackingInfo = action.payload.payload.tracking;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Reorder
      .addCase(reorder.pending, (state) => {
        state.loading = true;
      })
      .addCase(reorder.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(reorder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  clearOrderError,
  clearOrderMessage,
  clearSelectedOrder,
  resetOrderCreated,
  updateOrderStatusRealtime,
  addNewOrderRealtime,
} = orderSlice.actions;

export default orderSlice.reducer;
