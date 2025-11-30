// Notifications Slice
import { createSlice } from "@reduxjs/toolkit";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "./notificationApiSlice";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    totalNotifications: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    // Add new notification (from Socket.IO)
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
      state.totalNotifications += 1;
    },
    // Update notification read status (from Socket.IO)
    updateNotificationStatus: (state, action) => {
      const { notificationId, isRead } = action.payload;
      const notification = state.notifications.find((n) => n._id === notificationId);
      if (notification) {
        notification.isRead = isRead;
        if (isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.payload.notifications;
        state.totalNotifications = action.payload.payload.pagination?.total || 0;
        state.currentPage = action.payload.payload.pagination?.page || 1;
        state.totalPages = action.payload.payload.pagination?.pages || 1;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n._id === action.payload.payload.notification._id
        );
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const { notificationId } = action.payload;
        const notification = state.notifications.find((n) => n._id === notificationId);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          (n) => n._id !== notificationId
        );
        state.totalNotifications = Math.max(0, state.totalNotifications - 1);
      })
      
      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.payload.count;
      });
  },
});

export const {
  clearNotificationError,
  addNotification,
  updateNotificationStatus,
} = notificationSlice.actions;

export default notificationSlice.reducer;
