import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket.js";
import toast from "react-hot-toast";

/**
 * Custom hook for handling real-time order notifications
 * @param {Function} onNewOrder - Callback when new order received (for admin)
 * @param {Function} onOrderUpdated - Callback when order status updated
 * @param {Function} onDeliveryUpdate - Callback for delivery tracking updates
 */
export const useOrderNotifications = ({
  onNewOrder,
  onOrderUpdated,
  onDeliveryUpdate,
} = {}) => {
  const socketContext = useSocket();

  const handleNewOrder = useCallback(
    (data) => {
      console.log("📦 New order received:", data);

      // Show toast notification
      toast.success(data.message || "New order received!", {
        icon: "🔔",
        duration: 5000,
        position: "top-right",
      });

      // Call callback if provided
      if (onNewOrder) {
        onNewOrder(data.order);
      }
    },
    [onNewOrder]
  );

  const handleOrderStatusUpdate = useCallback(
    (data) => {
      console.log("📋 Order status updated:", data);

      const statusIcons = {
        pending: "⏳",
        accepted: "✅",
        confirmed: "👍",
        preparing: "👨‍🍳",
        ready: "🎯",
        out_for_delivery: "🚚",
        delivered: "✅",
        cancelled: "❌",
        rejected: "⛔",
      };

      const icon = statusIcons[data.order?.status] || "📋";

      // Show toast notification
      toast.success(data.message || "Order status updated", {
        icon,
        duration: 4000,
        position: "top-right",
      });

      // Call callback if provided
      if (onOrderUpdated) {
        onOrderUpdated(data.order);
      }
    },
    [onOrderUpdated]
  );

  const handleDeliveryUpdate = useCallback(
    (data) => {
      console.log("🚚 Delivery update:", data);

      // Show toast notification
      toast.success(data.message || "Delivery update", {
        icon: "🚚",
        duration: 4000,
        position: "top-right",
      });

      // Call callback if provided
      if (onDeliveryUpdate) {
        onDeliveryUpdate(data.tracking);
      }
    },
    [onDeliveryUpdate]
  );

  const handleOrderCancelled = useCallback((data) => {
    console.log("❌ Order cancelled:", data);

    toast.error(data.message || "Order has been cancelled", {
      icon: "❌",
      duration: 5000,
      position: "top-right",
    });
  }, []);

  const handlePaymentConfirmed = useCallback((data) => {
    console.log("💳 Payment confirmed:", data);

    toast.success(data.message || "Payment confirmed", {
      icon: "💳",
      duration: 4000,
      position: "top-right",
    });
  }, []);

  useEffect(() => {
    if (!socketContext) return;

    const socket = socketContext.getSocket();
    if (!socket) return;

    // Subscribe to order events
    socket.on("new_order", handleNewOrder);
    socket.on("order_status_updated", handleOrderStatusUpdate);
    socket.on("delivery_tracking_update", handleDeliveryUpdate);
    socket.on("order_cancelled", handleOrderCancelled);
    socket.on("payment_confirmed", handlePaymentConfirmed);

    // Cleanup
    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_status_updated", handleOrderStatusUpdate);
      socket.off("delivery_tracking_update", handleDeliveryUpdate);
      socket.off("order_cancelled", handleOrderCancelled);
      socket.off("payment_confirmed", handlePaymentConfirmed);
    };
  }, [
    socketContext,
    handleNewOrder,
    handleOrderStatusUpdate,
    handleDeliveryUpdate,
    handleOrderCancelled,
    handlePaymentConfirmed,
  ]);

  return {
    isConnected: socketContext?.isConnected || false,
  };
};
