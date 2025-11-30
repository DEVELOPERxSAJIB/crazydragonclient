// Socket.IO Client Setup
import { io } from "socket.io-client";
import { store } from "../app/store";
import {
  addNotification,
  updateNotificationStatus,
} from "../features/notifications/notificationSlice";
import {
  updateOrderStatusRealtime,
  addNewOrderRealtime,
} from "../features/orders/orderSlice";
import {
  updateProductRealtime,
  addProductRealtime,
  removeProductRealtime,
} from "../features/products/productSlice";
import { updateWalletBalanceRealtime } from "../features/wallet/walletSlice";
import { toast } from "react-hot-toast";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api/v1", "") ||
  "http://localhost:5050";

let socket = null;

// Initialize Socket.IO connection
export const initializeSocket = (userId) => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      userId,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Connection events
  socket.on("connect", () => {
    console.log("✅ Socket.IO connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket.IO disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  // Notification events
  socket.on("notification", (notification) => {
    console.log("🔔 New notification:", notification);
    store.dispatch(addNotification(notification));

    // Show toast notification
    toast.info(notification.message, {
      position: "top-right",
      autoClose: 5000,
    });
  });

  socket.on("notificationRead", ({ notificationId }) => {
    console.log("📖 Notification read:", notificationId);
    store.dispatch(updateNotificationStatus({ notificationId, isRead: true }));
  });

  // Order events (for customers)
  socket.on("order_status_updated", (data) => {
    console.log("📦 Order status updated:", data);

    const statusMessages = {
      pending: "Order is pending confirmation",
      accepted: "Order accepted by restaurant!",
      confirmed: "Order confirmed! Preparing your food...",
      preparing: "Your order is being prepared",
      ready: "Your order is ready for delivery!",
      out_for_delivery: "Rider is on the way!",
      delivered: "Order delivered successfully! Enjoy your meal 🎉",
      cancelled: "Order has been cancelled",
    };

    const message =
      statusMessages[data.status] || `Order status: ${data.status}`;

    toast.info(message, {
      position: "top-right",
      autoClose: 7000,
    });

    // Update Redux store
    store.dispatch(
      updateOrderStatusRealtime({
        orderId: data.orderId,
        status: data.status,
        order: data.order,
      })
    );
  });

  // New order event (for admin/kitchen)
  socket.on("new-order", (order) => {
    console.log("🆕 New order received:", order);
    store.dispatch(addNewOrderRealtime(order));
  });

  // Order updated event (for admin)
  socket.on("order-updated", (order) => {
    console.log("🔄 Order updated:", order);
    store.dispatch(
      updateOrderStatusRealtime({
        orderId: order._id,
        status: order.status,
        order: order,
      })
    );
  });

  // Product events (for admin)
  socket.on("product-updated", (product) => {
    console.log("📦 Product updated:", product);
    store.dispatch(updateProductRealtime(product));
  });

  socket.on("product-created", (product) => {
    console.log("🆕 Product created:", product);
    store.dispatch(addProductRealtime(product));
  });

  socket.on("product-deleted", (productId) => {
    console.log("🗑️ Product deleted:", productId);
    store.dispatch(removeProductRealtime(productId));
  });

  socket.on("orderAssigned", (data) => {
    console.log("🛵 Rider assigned:", data);
    toast.success(`Rider ${data.rider.name} has been assigned to your order!`, {
      position: "top-right",
      autoClose: 5000,
    });
  });

  // Payment events
  socket.on("paymentSuccess", (data) => {
    console.log("💳 Payment successful:", data);
    toast.success("Payment successful! Your order is being processed.", {
      position: "top-right",
      autoClose: 5000,
    });
  });

  socket.on("paymentFailed", (data) => {
    console.log("❌ Payment failed:", data);
    toast.error("Payment failed. Please try again.", {
      position: "top-right",
      autoClose: 5000,
    });
  });

  // Wallet events
  socket.on("walletUpdated", (data) => {
    console.log("💰 Wallet updated:", data);
    toast.info(`Wallet updated: €${data.balance.toFixed(2)}`, {
      position: "top-right",
      autoClose: 3000,
    });

    // Update Redux store
    store.dispatch(updateWalletBalanceRealtime(data));
  });

  // Review events
  socket.on("reviewReply", (data) => {
    console.log("💬 Review reply:", data);
    toast.info("Restaurant replied to your review!", {
      position: "top-right",
      autoClose: 5000,
    });
  });

  return socket;
};

// Get socket instance
export const getSocket = () => {
  return socket;
};

// Export socket directly for convenience
export { socket };

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket.IO disconnected");
  }
};

// Emit events
export const emitSocketEvent = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn("Socket not connected. Cannot emit event:", event);
  }
};

// Join room
export const joinRoom = (roomId) => {
  emitSocketEvent("join", { roomId });
};

// Leave room
export const leaveRoom = (roomId) => {
  emitSocketEvent("leave", { roomId });
};

// Track order in real-time
export const subscribeToOrderUpdates = (orderId) => {
  joinRoom(`order_${orderId}`);
};

// Unsubscribe from order updates
export const unsubscribeFromOrderUpdates = (orderId) => {
  leaveRoom(`order_${orderId}`);
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  emitSocketEvent,
  joinRoom,
  leaveRoom,
  subscribeToOrderUpdates,
  unsubscribeFromOrderUpdates,
};
