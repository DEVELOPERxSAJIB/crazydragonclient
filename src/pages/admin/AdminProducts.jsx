import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Upload,
  DollarSign,
  EuroIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Swal from "sweetalert2";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // all, available, unavailable
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isAvailable: true,
    image: null,
    recommendedAddons: [], // Array of product IDs
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [addonSearchQuery, setAddonSearchQuery] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      const productsData =
        response.data.payload?.products || response.data.payload || [];
      console.log(productsData);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      const categoriesData = response.data.payload?.categories || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "isAvailable") {
      processedValue = value === "true";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle recommended addon selection
  const toggleRecommendedAddon = (productId) => {
    setFormData((prev) => {
      const isSelected = prev.recommendedAddons.includes(productId);
      return {
        ...prev,
        recommendedAddons: isSelected
          ? prev.recommendedAddons.filter((id) => id !== productId)
          : [...prev.recommendedAddons, productId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", parseFloat(formData.price));
      submitData.append("category", formData.category);
      submitData.append("isAvailable", formData.isAvailable);

      // Add recommended addons as JSON array of product IDs
      if (formData.recommendedAddons.length > 0) {
        submitData.append(
          "recommendedAddons",
          JSON.stringify(formData.recommendedAddons)
        );
      }

      console.log("data", submitData);

      // Add image if selected
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Product updated successfully!");
      } else {
        await api.post("/admin/products", submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Food created successfully!");
      }

      fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || "",
      isAvailable: product.isAvailable,
      image: null,
      recommendedAddons:
        product.recommendedAddons?.map((addon) =>
          typeof addon === "string" ? addon : addon._id
        ) || [],
    });
    setImagePreview(product.image?.url || null);
    setShowModal(true);
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/admin/products/${productId}`, {
        isAvailable: newStatus,
      });

      // Update local state
      setProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, isAvailable: newStatus }
            : product
        )
      );

      toast.success(
        `Product ${newStatus ? "enabled" : "disabled"} successfully!`
      );
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handleDelete = async (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This Food will delete from our system",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#491648",
      confirmButtonText: "Delete",
      cancelButtonColor: "#999",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/products/${productId}`);
          toast.success("Food item deleted successfully!");
          fetchProducts();
        } catch (error) {
          console.error("Error deleting product:", error);
          toast.error("Failed to delete product");
        }
      }
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      isAvailable: true,
      image: null,
      recommendedAddons: [],
    });
    setImagePreview(null);
    setAddonSearchQuery("");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || product.category?._id === filterCategory;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "available" && product.isAvailable) ||
      (filterStatus === "unavailable" && !product.isAvailable);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#491648] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            {/* <h1 className="text-3xl font-bold text-gray-900">
              Product Management
            </h1> */}
            <p className="text-gray-600 mt-2">Manage Food inventory</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#491648] text-white px-4 py-2 rounded-lg hover:bg-[#5a1d59] transition-colors cursor-pointer"
          >
            <Plus size={20} />
            Add Food
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <Package
                        size={48}
                        className="mx-auto text-gray-400 mb-4"
                      />
                      <p className="text-lg">No products found</p>
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                          {product.image?.url ? (
                            <img
                              src={product.image.url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {product.category?.name || "No Category"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        €{product.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isAvailable ? "Available" : "Not Available"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              toggleProductStatus(
                                product._id,
                                product.isAvailable
                              )
                            }
                            className={`${
                              product.isAvailable
                                ? "text-green-600 hover:text-green-900"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                            title={
                              product.isAvailable
                                ? "Disable Product"
                                : "Enable Product"
                            }
                          >
                            {product.isAvailable ? (
                              <ToggleRight size={20} />
                            ) : (
                              <ToggleLeft size={20} />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Product"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredProducts.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
                {filteredProducts.length} products
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === page
                            ? "bg-[#491648] text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? "Edit Food" : "Add New Food"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image
                    </label>
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                        <Upload size={20} />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Product Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full outline-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                      placeholder="Enter product name"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full outline-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (€) *
                      </label>
                      <div className="relative">
                        <EuroIcon
                          size={20}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full outline-0 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full outline-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                        placeholder="0"
                      />
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        name="isAvailable"
                        value={formData.isAvailable}
                        onChange={handleInputChange}
                        className="w-full outline-0 px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value={true}>Available</option>
                        <option value={false}>Unavailable</option>
                      </select>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full outline-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recommended Addons Section (Product References) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <span className="flex items-center gap-2">
                        🎯 Recommended Add-ons
                        <span className="text-xs text-gray-500 font-normal">
                          (Select existing products)
                        </span>
                      </span>
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-xs text-blue-800">
                        ℹ️ These are products that will be suggested to
                        customers (e.g., Fries, Drinks, Sauces)
                      </p>
                    </div>

                    {/* Search Box */}
                    <div className="relative mb-3">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={addonSearchQuery}
                        onChange={(e) => setAddonSearchQuery(e.target.value)}
                        className="w-full outline-0 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                      />
                    </div>

                    {/* Selected Count */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">
                        Selected:{" "}
                        <span className="font-semibold text-[#491648]">
                          {formData.recommendedAddons.length}
                        </span>{" "}
                        products
                      </p>
                      {formData.recommendedAddons.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              recommendedAddons: [],
                            }))
                          }
                          className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Product List with Checkboxes */}
                    <div className="border border-gray-300 rounded-lg max-h-[400px] overflow-y-auto">
                      {products
                        .filter((p) => {
                          // Don't show the product being edited as an addon to itself
                          if (editingProduct && p._id === editingProduct._id) {
                            return false;
                          }
                          // Filter by search query
                          if (addonSearchQuery.trim()) {
                            const query = addonSearchQuery.toLowerCase();
                            return (
                              p.name?.toLowerCase().includes(query) ||
                              p.category?.name?.toLowerCase().includes(query)
                            );
                          }
                          return true;
                        })
                        .sort((a, b) => {
                          // Sort by category name first, then by product name
                          const catCompare = (
                            a.category?.name || ""
                          ).localeCompare(b.category?.name || "");
                          if (catCompare !== 0) return catCompare;
                          return (a.name || "").localeCompare(b.name || "");
                        })
                        .map((product, index, array) => {
                          const isSelected =
                            formData.recommendedAddons.includes(product._id);
                          const showCategoryHeader =
                            index === 0 ||
                            product.category?.name !==
                              array[index - 1]?.category?.name;

                          return (
                            <div key={product._id}>
                              {/* Category Header */}
                              {showCategoryHeader && (
                                <div className="bg-gray-100 px-4 py-2 font-medium text-sm text-gray-700 sticky top-0 z-10">
                                  {product.category?.name || "Uncategorized"}
                                </div>
                              )}
                              {/* Product Checkbox */}
                              <label
                                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                                  isSelected ? "bg-purple-50" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleRecommendedAddon(product._id)
                                  }
                                  className="w-4 h-4 text-[#491648] border-gray-300 rounded focus:ring-[#491648] cursor-pointer"
                                />
                                {product.image?.url && (
                                  <img
                                    src={product.image.url}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    €{product.price?.toFixed(2)}
                                    {!product.isAvailable && (
                                      <span className="ml-2 text-red-500">
                                        (Unavailable)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      {products.filter((p) => {
                        if (editingProduct && p._id === editingProduct._id)
                          return false;
                        if (addonSearchQuery.trim()) {
                          const query = addonSearchQuery.toLowerCase();
                          return (
                            p.name?.toLowerCase().includes(query) ||
                            p.category?.name?.toLowerCase().includes(query)
                          );
                        }
                        return true;
                      }).length === 0 && (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Search className="mx-auto mb-2" size={24} />
                          <p className="text-sm">No products found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                      className="cursor-pointer flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-[#491648] text-white rounded-lg hover:bg-[#5a1d59] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {editingProduct ? "Updating . . ." : "Creating . . ."}
                        </>
                      ) : editingProduct ? (
                        "Update Food"
                      ) : (
                        "Create Food"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
