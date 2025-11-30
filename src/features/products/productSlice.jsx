// Product Slice
import { createSlice } from "@reduxjs/toolkit";
import {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getAllCategories,
  getProductsByCategory,
  searchProducts,
} from "./productApiSlice";

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    featuredProducts: [],
    categories: [],
    selectedProduct: null,
    totalProducts: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    searchResults: [],
    searchLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    // Real-time updates
    updateProductRealtime: (state, action) => {
      const updatedProduct = action.payload;

      // Update in products list
      const index = state.products.findIndex(
        (p) => p._id === updatedProduct._id
      );
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }

      // Update in featured products
      const featuredIndex = state.featuredProducts.findIndex(
        (p) => p._id === updatedProduct._id
      );
      if (featuredIndex !== -1) {
        state.featuredProducts[featuredIndex] = updatedProduct;
      }

      // Update selected product if it matches
      if (state.selectedProduct?._id === updatedProduct._id) {
        state.selectedProduct = updatedProduct;
      }
    },
    addProductRealtime: (state, action) => {
      state.products.unshift(action.payload);
      state.totalProducts += 1;
    },
    removeProductRealtime: (state, action) => {
      const productId = action.payload;
      state.products = state.products.filter((p) => p._id !== productId);
      state.featuredProducts = state.featuredProducts.filter(
        (p) => p._id !== productId
      );
      state.totalProducts -= 1;

      if (state.selectedProduct?._id === productId) {
        state.selectedProduct = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all products
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.payload.products;
        state.totalProducts = action.payload.payload.pagination?.total || 0;
        state.currentPage = action.payload.payload.pagination?.page || 1;
        state.totalPages = action.payload.payload.pagination?.pages || 1;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Get single product
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload.payload.product;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Get featured products
      .addCase(getFeaturedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload.payload.products;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Get all categories
      .addCase(getAllCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.payload.categories;
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Get products by category
      .addCase(getProductsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.payload.products;
      })
      .addCase(getProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.payload.products;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  clearError,
  clearSelectedProduct,
  clearSearchResults,
  updateProductRealtime,
  addProductRealtime,
  removeProductRealtime,
} = productSlice.actions;
export default productSlice.reducer;
