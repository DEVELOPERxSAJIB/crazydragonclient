import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  Eye,
  Printer,
  Search,
  Filter,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useOrderNotifications } from "../../hooks/useOrderNotifications";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get("/orders/all/orders");
      console.log("Orders API Response:", response.data);
      const ordersData =
        response.data.payload?.orders || response.data.payload || [];
      console.log("Orders Data:", ordersData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setLoading(false);
    }
  }, []);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle new orders via Socket.IO
  const handleNewOrder = useCallback((newOrder) => {
    console.log("New order received:", newOrder);
    setOrders((prev) => [newOrder, ...prev]);

    // Browser notification
    if (Notification.permission === "granted") {
      new Notification("New Order Received!", {
        body: `Order #${newOrder.orderNumber} - €${newOrder.totalAmount || 0}`,
        icon: "/logo.png",
      });
    }
  }, []);

  // Handle order status updates via Socket.IO
  const handleOrderUpdated = useCallback((updatedOrder) => {
    console.log("Order status updated:", updatedOrder);
    setOrders((prev) =>
      prev.map((order) =>
        order._id === updatedOrder.orderId
          ? { ...order, status: updatedOrder.status }
          : order
      )
    );
  }, []);

  // Setup real-time order notifications
  useOrderNotifications({
    onNewOrder: handleNewOrder,
    onOrderUpdated: handleOrderUpdated,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      const updatedOrder = response.data.payload.order;

      // Ensure status field exists
      if (!updatedOrder.status) {
        updatedOrder.status = newStatus;
      }

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                ...updatedOrder,
                status: updatedOrder.status || newStatus,
              }
            : order
        )
      );

      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  };

  const deleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);

      // Remove order from local state
      setOrders((prev) => prev.filter((order) => order._id !== orderId));

      toast.success("Order deleted successfully");

      // Close modal if order details is open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  const showPrintConfirmation = async (order) => {
    setOrderToPrint(order);
    setShowPrintModal(true);
    setLoadingPreview(true);

    try {
      const { data } = await api.get(`/orders/${order._id}/receipt-preview`);
      setReceiptPreview(data.payload);
    } catch (error) {
      console.error("Error fetching receipt preview:", error);
      toast.error("Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const printBothReceipts = async () => {
    if (!orderToPrint) return;

    try {
      // Print kitchen receipt
      await api.post(`/orders/${orderToPrint._id}/print-receipt`, {
        type: "kitchen",
      });

      // Print customer receipt
      await api.post(`/orders/${orderToPrint._id}/print-receipt`, {
        type: "customer",
      });

      toast.success("Kitchen and Customer receipts printed successfully!");
      setShowPrintModal(false);
      setOrderToPrint(null);
    } catch (error) {
      console.error("Error printing receipts:", error);
      toast.error("Failed to print receipts");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-cyan-100 text-cyan-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-indigo-100 text-indigo-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!order || !order._id) return false;

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#491648] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/* <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Order Management
          </h1> */}
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Order Management
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 sm:w-auto">
              <Filter size={18} className="text-gray-400 shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.name || "Guest"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        €{order.pricing?.total?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
                          }
                          className={`inline-flex outline-0 items-center text-[12px] px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="accepted">ACCEPTED</option>
                          <option value="preparing">PREPARING</option>
                          <option value="ready">READY</option>
                          <option value="out_for_delivery">
                            OUT FOR DELIVERY
                          </option>
                          <option value="delivered">DELIVERED</option>
                          <option value="cancelled">CANCELLED</option>
                          <option value="rejected">REJECTED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => showPrintConfirmation(order)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Print Receipts"
                          >
                            <Printer size={18} />
                          </button>
                          <button
                            onClick={() => deleteOrder(order._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Order"
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
          {filteredOrders.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredOrders.length)} of{" "}
                {filteredOrders.length} orders
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

        {/* Orders Cards - Mobile */}
        <div className="lg:hidden space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            currentOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-semibold text-gray-900">
                      #{order._id.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-900">
                    {order.user?.name || "Guest"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.user?.email || "N/A"}
                  </p>
                </div>

                {/* Order Details */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-500">Items</p>
                    <p className="font-medium">{order.items?.length || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Total</p>
                    <p className="font-bold text-lg text-gray-900">
                      €{order.pricing?.total?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>

                {/* Status Update - Full Width */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Status</p>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border-2 cursor-pointer focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <option value="pending">⏳ PENDING</option>
                    <option value="confirmed">✔️ CONFIRMED</option>
                    <option value="accepted">✅ ACCEPTED</option>
                    <option value="preparing">👨‍🍳 PREPARING</option>
                    <option value="ready">🎯 READY</option>
                    <option value="out_for_delivery">
                      🚚 OUT FOR DELIVERY
                    </option>
                    <option value="delivered">🎉 DELIVERED</option>
                    <option value="cancelled">❌ CANCELLED</option>
                    <option value="rejected">⛔ REJECTED</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Eye size={18} />
                    View
                  </button>
                  <button
                    onClick={() => showPrintConfirmation(order)}
                    className="bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Mobile Pagination */}
          {filteredOrders.length > 0 && totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-700 text-center mb-3">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2 justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#491648] text-white hover:bg-[#5a1d59]"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#491648] text-white hover:bg-[#5a1d59]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={updateOrderStatus}
            onShowPrintConfirmation={showPrintConfirmation}
            onDeleteOrder={deleteOrder}
          />
        )}

        {/* Print Preview & Confirmation Modal */}
        {showPrintModal && orderToPrint && (
          <PrintPreviewModal
            order={orderToPrint}
            receiptPreview={receiptPreview}
            loadingPreview={loadingPreview}
            onClose={() => {
              setShowPrintModal(false);
              setOrderToPrint(null);
              setReceiptPreview(null);
            }}
            onConfirmPrint={printBothReceipts}
          />
        )}
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({
  order,
  onClose,
  onUpdateStatus,
  onShowPrintConfirmation,
  onDeleteOrder,
}) => {
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: "accepted",
      accepted: "preparing",
      preparing: "ready",
      ready: "out_for_delivery",
      out_for_delivery: "delivered",
    };
    return statusFlow[currentStatus];
  };

  const canProgress =
    order.status !== "delivered" && order.status !== "cancelled";
  const nextStatus = getNextStatus(order.status);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Order Details
              </h2>
              <p className="text-gray-600 mt-1">
                Order ID: #{order._id.slice(-8)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </button>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Customer Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Name:</span>{" "}
                {order.user?.name || "Guest"}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Email:</span>{" "}
                {order.user?.email || "N/A"}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Phone:</span>{" "}
                {order.delivery?.phone || "N/A"}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Address:</span>{" "}
                {order.delivery?.address || "N/A"}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Order Items
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.product?.image?.url ||
                        item.product?.image ||
                        "https://via.placeholder.com/150x150?text=No+Image"
                      }
                      alt={item.product?.name || "Product"}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150x150?text=No+Image";
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product?.name || "Product"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">
                    €{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Pricing Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>€{order.pricing?.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Charge:</span>
                <span>
                  €{order.pricing?.deliveryCharge?.toFixed(2) || "0.00"}
                </span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-€{order.pricing.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>€{order.pricing?.tax?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>€{order.pricing?.total?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {canProgress && nextStatus && (
              <button
                onClick={() => {
                  onUpdateStatus(order._id, nextStatus);
                  onClose();
                }}
                className="flex-1 bg-[#491648] text-white px-4 py-2 rounded-lg hover:bg-[#5a1d59] transition-colors"
              >
                Mark as{" "}
                {nextStatus?.replace("_", " ").toUpperCase() || "NEXT STATUS"}
              </button>
            )}
            <button
              onClick={() => onShowPrintConfirmation(order)}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={18} />
              Print Receipts
            </button>
            <button
              onClick={() => {
                onDeleteOrder(order._id);
                onClose();
              }}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Print Preview Modal Component
const PrintPreviewModal = ({
  order,
  receiptPreview,
  loadingPreview,
  onClose,
  onConfirmPrint,
}) => {
  const [activeTab, setActiveTab] = useState("kitchen");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100">
                <Printer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Receipt Preview
                </h3>
                <p className="text-sm text-gray-500">
                  Order #{order._id.slice(-8)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("kitchen")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "kitchen"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Kitchen Receipt
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "customer"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Customer Receipt
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loadingPreview ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          ) : receiptPreview ? (
            <div className="max-w-2xl mx-auto">
              {/* Receipt Paper Style */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
                <div className="bg-gradient-to-b from-gray-100 to-white p-6">
                  <pre className="font-mono text-xs leading-relaxed whitespace-pre text-gray-800 overflow-x-auto">
                    {activeTab === "kitchen"
                      ? receiptPreview.kitchenReceipt
                      : receiptPreview.customerReceipt}
                  </pre>
                </div>
              </div>

              {/* Receipt Info */}
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>
                  {activeTab === "kitchen"
                    ? "📋 This receipt will be sent to the kitchen"
                    : "🧾 This receipt will be given to the customer"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <Printer className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Failed to load preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Both receipts will be printed simultaneously
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmPrint}
                disabled={loadingPreview}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer size={18} />
                Print Both Receipts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
