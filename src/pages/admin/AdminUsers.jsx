import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  Shield,
  Ban,
  CheckCircle,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: "",
    userId: null,
    newRole: null,
    userName: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/all");
      console.log("Users API Response:", response.data);
      const usersData =
        response.data.payload?.users || response.data.payload || [];
      console.log("Users Data:", usersData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const response = await api.get("/users/all");
        console.log("Users API Response:", response.data);
        const usersData =
          response.data.payload?.users || response.data.payload || [];
        console.log("Users Data:", usersData);
        if (isMounted) {
          setUsers(Array.isArray(usersData) ? usersData : []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        if (isMounted) {
          setUsers([]);
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus]);

  const showRoleConfirmation = (userId, newRole, userName) => {
    setConfirmModal({
      show: true,
      type: "role",
      userId,
      newRole,
      userName,
    });
  };

  const updateUserRole = async () => {
    const { userId, newRole } = confirmModal;
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success("User role updated successfully!");
      setConfirmModal({
        show: false,
        type: "",
        userId: null,
        newRole: null,
        userName: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // Backend expects "status" field with values: "active", "banned", or "inactive"
      const newStatus = currentStatus ? "inactive" : "active";

      await api.patch(`/users/${userId}/status`, {
        status: newStatus,
      }); // Update local state - the backend returns isActive in the user object
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, status: newStatus, isActive: newStatus === "active" }
            : user
        )
      );

      toast.success(
        `User ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive !== false
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive !== false) ||
      (filterStatus === "inactive" && user.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#491648] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {/* <h1 className="text-3xl font-bold text-gray-900">User Management</h1> */}
          <p className="text-gray-600 mt-2">
            Manage user, roles and permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {users.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                <Users className="text-blue-700" size={28} />
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Users</p>
                <p className="text-3xl font-semibold text-green-700">
                  {users.filter((u) => u.isActive !== false).length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                <CheckCircle className="text-green-700" size={28} />
              </div>
            </div>
          </div>

          {/* Admins */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Admins</p>
                <p className="text-3xl font-semibold text-purple-700">
                  {
                    users.filter((u) =>
                      ["admin", "super_admin"].includes(u.role)
                    ).length
                  }
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200">
                <Shield className="text-purple-700" size={28} />
              </div>
            </div>
          </div>

          {/* Inactive Users */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Inactive Users</p>
                <p className="text-3xl font-semibold text-red-700">
                  {users.filter((u) => u.isActive === false).length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-100 to-red-200">
                <Ban className="text-red-700" size={28} />
              </div>
            </div>
          </div>
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
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.photo ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.photo}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#491648] flex items-center justify-center text-white font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Mail size={14} className="text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone size={14} className="text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role?.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            user.isActive
                          )}`}
                        >
                          {user.isActive !== false ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {user.role !== "super_admin" && (
                            <button
                              onClick={() =>
                                toggleUserStatus(user._id, user.isActive)
                              }
                              className={`${
                                user.isActive !== false
                                  ? "text-green-600 hover:text-green-900"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                              title={
                                user.isActive !== false
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >
                              {user.isActive !== false ? (
                                <ToggleRight size={20} />
                              ) : (
                                <ToggleLeft size={20} />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={18} />
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
          {filteredUsers.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
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

        {/* User Details Modal */}
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onUpdateRole={showRoleConfirmation}
          />
        )}

        {/* Confirmation Modal */}
        {confirmModal.show && (
          <ConfirmationModal
            userName={confirmModal.userName}
            newRole={confirmModal.newRole}
            onConfirm={updateUserRole}
            onCancel={() =>
              setConfirmModal({
                show: false,
                type: "",
                userId: null,
                newRole: null,
                userName: "",
              })
            }
          />
        )}
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ userName, newRole, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <Shield className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Confirm Role Change
          </h3>
          <p className="text-sm text-gray-600">
            Are you sure you want to change{" "}
            <span className="font-semibold">{userName}'s</span> role to{" "}
            <span className="font-semibold text-blue-600">
              {newRole?.toUpperCase()}
            </span>
            ?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose, onUpdateRole }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              {user.photo ? (
                <img
                  className="h-16 w-16 rounded-full"
                  src={user.photo}
                  alt={user.name}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[#491648] flex items-center justify-center text-white text-2xl font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Mail size={24} />
            </button>
          </div>

          {/* User Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              User Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="font-medium">#{user._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{user.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium">{user.address || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email Verified:</span>
                <span
                  className={`font-medium ${
                    user.emailVerified ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.emailVerified ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Joined:</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Role Management */}
          {user.role !== "super_admin" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Role Management
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Current Role:{" "}
                  <span className="font-semibold">
                    {user.role?.replace("_", " ").toUpperCase()}
                  </span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateRole(user._id, "user", user.name)}
                    disabled={user.role === "user"}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      user.role === "user"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    Set as User
                  </button>
                  <button
                    onClick={() => onUpdateRole(user._id, "admin", user.name)}
                    disabled={user.role === "admin"}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      user.role === "admin"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Set as Admin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Order Statistics
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-3 text-gray-500">
                <ShoppingBag size={24} />
                <p>Order history coming soon...</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
