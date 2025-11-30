import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Login user
export const loginUser = createAsyncThunk("auth/login", async (data) => {
  try {
    const response = await api.post(`/auth/login`, data);

    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
});

// Logout user
export const logOutUser = createAsyncThunk("auth/logOutUser", async () => {
  try {
    const response = await api.post(`/auth/logout`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
});

// Process user register
export const processRegister = createAsyncThunk(
  "auth/processRegister",
  async (data) => {
    try {
      const response = await api.post(`/auth/process-register`, data, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }
);

// Verify registered user
export const verifyRegisteredUser = createAsyncThunk(
  "user/verifyRegisteredUser",
  async (data) => {
    try {
      const response = await api.post(`/auth/verify-register`, data, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }
);

// Request for recovery Forgot Password
export const forgotPasswordRequest = createAsyncThunk(
  "auth/forgotPasswordRequest",
  async (data) => {
    try {
      const response = await api.post(`/auth/forgot-password`, data, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }
);

// Get logged in user info
export const getLoggedInUser = createAsyncThunk(
  "auth/getLoggedInUser",
  async () => {
    try {
      const response = await api.get(`/auth/me`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user");
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (formData) => {
    try {
      const response = await api.put(`/users/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data) => {
    try {
      const response = await api.put(`/auth/change-password`, data, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }
);
