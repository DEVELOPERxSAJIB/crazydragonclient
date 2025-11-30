// Product API Slice
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Get all products
export const getAllProducts = createAsyncThunk(
  "products/getAllProducts",
  async ({ page = 1, limit = 12, category, search, sortBy } = {}) => {
    try {
      let url = `/products?page=${page}&limit=${limit}`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

// Get single product
export const getProductById = createAsyncThunk(
  "products/getProductById",
  async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch product");
    }
  }
);

// Get featured products
export const getFeaturedProducts = createAsyncThunk(
  "products/getFeaturedProducts",
  async () => {
    try {
      const response = await api.get("/products?featured=true&limit=8");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch featured products");
    }
  }
);

// Get all categories
export const getAllCategories = createAsyncThunk(
  "products/getAllCategories",
  async () => {
    try {
      const response = await api.get("/categories");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch categories");
    }
  }
);

// Get products by category
export const getProductsByCategory = createAsyncThunk(
  "products/getProductsByCategory",
  async (categoryId) => {
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch products by category");
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async (searchTerm) => {
    try {
      const response = await api.get(`/products/search?q=${searchTerm}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Search failed");
    }
  }
);
