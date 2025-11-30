import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage on init
    try {
      const saved = localStorage.getItem("notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(() => {
    // Load unread count from localStorage on init
    try {
      const saved = localStorage.getItem("unreadCount");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const { user } = useSelector((state) => state.auth);

  // Clear notifications when user logs out
  useEffect(() => {
    if (!user) {
      localStorage.removeItem("notifications");
      localStorage.removeItem("unreadCount");
    }
  }, [user]);

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      return;
    }

    // Create socket connection
    // Extract base URL from VITE_API_URL (remove /api/v1)
    const apiUrl =
      import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";
    const baseURL = apiUrl.replace(/\/api\/v\d+$/, "");

    const newSocket = io(baseURL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);

      // Join user-specific room
      if (user?._id) {
        newSocket.emit("join_user_room", user._id);
      }

      // Join admin room if user is admin or super admin
      if (user?.role === "admin" || user?.role === "super_admin") {
        newSocket.emit("join_admin_room");
        console.log("🔐 Joining admin room...");
      }
    });

    newSocket.on("admin_room_joined", (data) => {
      console.log("✅ Admin room joined successfully:", data);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);
    });

    socketRef.current = newSocket;

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      newSocket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  }, [notifications]);

  // Persist unread count to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("unreadCount", unreadCount.toString());
    } catch (error) {
      console.error("Failed to save unread count:", error);
    }
  }, [unreadCount]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => {
        console.log("Could not play notification sound:", err);
      });
    } catch (error) {
      console.log("Notification sound error:", error);
    }
  }, []);

  // Handle incoming notifications
  useEffect(() => {
    if (!socketRef.current) return;

    const handleNewNotification = (data) => {
      console.log("🔔 New notification received:", data);

      // Format notification data consistently
      const notification = {
        _id: data._id || Date.now().toString(),
        message: data.message,
        title: data.title || data.message,
        type: data.type || "general",
        data: data,
        timestamp: data.timestamp || new Date(),
        isRead: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast.success(data.message || "New notification received", {
        icon: "🔔",
        duration: 4000,
      });

      // Play notification sound (optional)
      playNotificationSound();
    };

    const handleNewOrder = (data) => {
      console.log("📦 New order notification:", data);

      // Only show to admins, not regular users
      if (user?.role !== "admin" && user?.role !== "super_admin") {
        console.log("⏭️ Skipping customer notification - not relevant to them");
        return;
      }

      const notification = {
        _id: `order_${data.order?.orderId}_${Date.now()}`,
        message: data.message || "New order",
        type: "new_order",
        data: data,
        timestamp: data.timestamp || new Date(),
        isRead: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      toast.success(data.message || "New order", {
        icon: "📦",
        duration: 4000,
      });

      playNotificationSound();
    };

    const handleOrderStatusUpdate = (data) => {
      console.log("📋 Order status update notification:", data);

      // Only show to customers, not admins (they initiated the change)
      if (user?.role === "admin" || user?.role === "super_admin") {
        console.log(
          "⏭️ Skipping admin notification - admin initiated this change"
        );
        return;
      }

      const notification = {
        _id: `status_${data.order?.orderId}_${Date.now()}`,
        message: data.message,
        type: "order_status_updated",
        data: data,
        timestamp: data.timestamp || new Date(),
        isRead: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      const statusIcons = {
        pending: "⏳",
        accepted: "✅",
        confirmed: "✅",
        preparing: "👨‍🍳",
        ready: "🎯",
        out_for_delivery: "🚚",
        delivered: "🎉",
        cancelled: "❌",
        rejected: "⛔",
      };

      toast.success(data.message || "Order status updated", {
        icon: statusIcons[data.order?.status] || "📋",
        duration: 4000,
      });

      playNotificationSound();
    };

    const handleDeliveryUpdate = (data) => {
      console.log("🚚 Delivery update notification:", data);

      const notification = {
        _id: `delivery_${data.tracking?.orderId}_${Date.now()}`,
        message: data.message || "Delivery update",
        type: "delivery_tracking_update",
        data: data,
        timestamp: data.timestamp || new Date(),
        isRead: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      toast.success(data.message || "Delivery update", {
        icon: "🚚",
        duration: 4000,
      });

      playNotificationSound();
    };

    const handleOrderCancelled = (data) => {
      console.log("❌ Order cancelled notification:", data);

      const notification = {
        _id: `cancelled_${data.order?.orderId}_${Date.now()}`,
        message: data.message || "Order cancelled",
        type: "order_cancelled",
        data: data,
        timestamp: data.timestamp || new Date(),
        isRead: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      toast.error(data.message || "Order cancelled", {
        icon: "❌",
        duration: 4000,
      });

      playNotificationSound();
    };

    const handlePaymentConfirmed = (data) => {
      console.log("💳 Payment confirmed notification:", data);

      const notification = {
        _id: `payment_${data.payment?.orderId}_${Date.now()}`,
        message: data.message || "Payment confirmed",
        type: "payment_confirmed",
        data: data,
        timestamp: data.timestamp || new Date(),
        isRead: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      toast.success(data.message || "Payment confirmed", {
        icon: "💳",
        duration: 4000,
      });

      playNotificationSound();
    };

    // Subscribe to all notification events
    socketRef.current.on("new_notification", handleNewNotification);
    socketRef.current.on("new_order", handleNewOrder);
    socketRef.current.on("order_status_updated", handleOrderStatusUpdate);
    socketRef.current.on("delivery_tracking_update", handleDeliveryUpdate);
    socketRef.current.on("order_cancelled", handleOrderCancelled);
    socketRef.current.on("payment_confirmed", handlePaymentConfirmed);

    return () => {
      socketRef.current?.off("new_notification", handleNewNotification);
      socketRef.current?.off("new_order", handleNewOrder);
      socketRef.current?.off("order_status_updated", handleOrderStatusUpdate);
      socketRef.current?.off("delivery_tracking_update", handleDeliveryUpdate);
      socketRef.current?.off("order_cancelled", handleOrderCancelled);
      socketRef.current?.off("payment_confirmed", handlePaymentConfirmed);
    };
  }, [playNotificationSound, user?.role]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Get socket function to avoid ref access in render
  const getSocket = useCallback(() => socketRef.current, []);

  const value = useMemo(
    () => ({
      getSocket,
      isConnected,
      notifications,
      unreadCount,
      markAsRead,
      clearNotifications,
    }),
    [
      isConnected,
      notifications,
      unreadCount,
      getSocket,
      markAsRead,
      clearNotifications,
    ]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
