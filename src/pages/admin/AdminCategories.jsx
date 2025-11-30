import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  Filter,
} from "lucide-react";
import api from "../../utils/api";
import Swal from "sweetalert2";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    isActive: true,
  });

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.payload.categories);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !editingCategory
        ? {
            slug: value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          }
        : {}),
    }));
  };

  // Create category
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/admin/categories", formData);
      if (response.data.success) {
        toast.success("Category created successfully");
        setShowModal(false);
        setFormData({ name: "", description: "", slug: "" });
        fetchCategories();
      } else {
        toast.error(response.data.message || "Failed to create category");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category");
      console.error(error);
    }
  };

  // Update category
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `/admin/categories/${editingCategory._id}`,
        formData
      );
      if (response.data.success) {
        toast.success("Category updated successfully");
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: "", description: "", slug: "" });
        fetchCategories();
      } else {
        toast.error(response.data.message || "Failed to update category");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
      console.error(error);
    }
  };

  // Toggle category status
  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await api.put(`/admin/categories/${categoryId}`, {
        isActive: newStatus,
      });
      if (response.data.success) {
        // Update local state
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === categoryId ? { ...cat, isActive: newStatus } : cat
          )
        );
        toast.success(
          `Category ${newStatus ? "activated" : "deactivated"} successfully!`
        );
      }
    } catch (error) {
      console.error("Error toggling category status:", error);
      toast.error("Failed to update category status");
    }
  };

  // Delete category
  const handleDelete = async (categoryId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This category will delete from our system",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#491648",
      confirmButtonText: "Delete",
      cancelButtonColor: "#999",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await api.delete(`/admin/categories/${categoryId}`);
          if (response.data.success) {
            toast.success("Category deleted successfully");
            fetchCategories();
          } else {
            toast.error(response.data.message || "Failed to delete category");
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to delete category"
          );
          console.error(error);
        }
      }
    });
  };

  // Open modal for editing
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      slug: category.slug,
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setShowModal(true);
  };

  // Open modal for creating
  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", slug: "", isActive: true });
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", slug: "", isActive: true });
  };

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return category.isActive !== false;
    if (filterStatus === "inactive") return category.isActive === false;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* <h1 className="text-3xl font-bold text-gray-900">Categories</h1> */}
          <p className="text-gray-600 mt-1">Manage categories</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#491648] text-white px-4 py-2 rounded-lg hover:bg-[#6E3B72] transition"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#491648]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
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
              {filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No categories found. Create your first category to get
                    started.
                  </td>
                </tr>
              ) : (
                currentCategories?.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {category.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-md truncate">
                        {category.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.productCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            toggleCategoryStatus(
                              category._id,
                              category.isActive !== false
                            )
                          }
                          className={`${
                            category.isActive !== false
                              ? "text-green-600 hover:text-green-900"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          title={
                            category.isActive !== false
                              ? "Deactivate Category"
                              : "Activate Category"
                          }
                        >
                          {category.isActive !== false ? (
                            <ToggleRight size={20} />
                          ) : (
                            <ToggleLeft size={20} />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="text-red-600 hover:text-red-900"
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

          {/* Pagination Controls */}
          {filteredCategories.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredCategories.length)} of{" "}
                {filteredCategories.length} categories
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
      )}

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingCategory ? handleUpdate : handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 outline-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="e.g., Burgers, Pizza, Drinks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full outline-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="e.g., burgers, pizza, drinks"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used in URL. Use lowercase letters, numbers, and hyphens
                    only.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="Brief description of the category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.value === "true",
                      }))
                    }
                    className="w-full outline-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#491648] text-white rounded-lg hover:bg-[#6E3B72] transition"
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
