import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useSocket } from "../hooks/useSocket.js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";

const NotificationBell = () => {
  const navigate = useNavigate();
  const socketContext = useSocket();
  const { user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);

  const notifications = socketContext?.notifications || [];
  const unreadCount = socketContext?.unreadCount || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("notification-dropdown");
      const button = document.getElementById("notification-button");

      if (
        dropdown &&
        button &&
        !dropdown.contains(event.target) &&
        !button.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (socketContext?.markAsRead) {
      socketContext.markAsRead(notification._id);
    }

    // Navigate based on notification type and user role
    const isAdmin = user?.role === "admin" || user?.role === "super_admin";

    switch (notification.type) {
      case "new_order":
        // Admins: Go to admin orders page
        if (isAdmin) {
          navigate("/admin/orders");
        }
        break;

      case "order_status_updated":
        // Customers: Go to their orders list page
        if (!isAdmin) {
          navigate("/orders");
        }
        break;

      case "delivery_tracking_update":
        // Both: Go to order views
        if (isAdmin) {
          navigate("/admin/orders");
        } else {
          navigate("/orders");
        }
        break;

      case "order_cancelled":
        // Both: Go to their respective order views
        if (isAdmin) {
          navigate("/admin/orders");
        } else {
          navigate("/orders");
        }
        break;

      case "payment_confirmed":
        // Both: Go to order views
        if (isAdmin) {
          navigate("/admin/orders");
        } else {
          navigate("/orders");
        }
        break;

      default:
        // General notifications: navigate based on role
        if (notification.type?.includes("order")) {
          if (isAdmin) {
            navigate("/admin/orders");
          } else {
            navigate("/orders");
          }
        }
        break;
    }

    setShowDropdown(false);
  };

  const formatNotificationTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        id="notification-button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 cursor-pointer mt-1.5 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#4E1D4D] rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Online Indicator */}
        {/* {socketContext?.isConnected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )} */}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id="notification-dropdown"
          className="fixed sm:absolute right-0 sm:right-0 left-0 sm:left-auto top-16 sm:top-auto sm:mt-2 w-full sm:w-80 md:w-96 bg-white rounded-none sm:rounded-lg shadow-lg border-t sm:border border-gray-200 z-50 max-h-[calc(100vh-4rem)] sm:max-h-96 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-500">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 10).map((notification, index) => (
                  <div
                    key={notification._id || index}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-purple-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon based on type */}
                      <div className="shrink-0 mt-1">
                        {notification.type === "new_order" && (
                          <span className="text-xl"></span>
                        )}
                        {notification.type === "order_status_updated" && (
                          <span className="text-xl"></span>
                        )}
                        {notification.type === "delivery_tracking_update" && (
                          <span className="text-xl"></span>
                        )}
                        {notification.type === "order_cancelled" && (
                          <span className="text-xl"></span>
                        )}
                        {notification.type === "payment_confirmed" && (
                          <span className="text-xl"></span>
                        )}
                        {(!notification.type ||
                          notification.type === "general") && (
                          <span className="text-xl"></span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {notification.message || notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatNotificationTime(
                            notification.timestamp || notification.createdAt
                          )}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="shrink-0">
                          <span className="inline-block w-2 h-2 bg-[#4E1D4D] rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  // Clear all notifications
                  if (socketContext?.clearNotifications) {
                    socketContext.clearNotifications();
                  }
                  setShowDropdown(false);
                }}
                className="w-full text-sm text-center text-[#491648] hover:text-[#6E3B72] font-medium transition-colors"
              >
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
