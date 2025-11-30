// Orders Page
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders, cancelOrder } from "../features/orders/orderApiSlice";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, totalPages, currentPage, loading } = useSelector(
    (state) => state.orders
  );
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(getMyOrders({ page: 1, status: statusFilter }));
  }, [dispatch, statusFilter]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await dispatch(cancelOrder(orderId)).unwrap();
        toast.success("Order cancelled successfully");
        dispatch(getMyOrders({ page: currentPage, status: statusFilter }));
      } catch (error) {
        toast.error(error || "Failed to cancel order");
      }
    }
  };

  const handlePageChange = (page) => {
    dispatch(getMyOrders({ page, status: statusFilter }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My Orders</h1>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                statusFilter === ""
                  ? "bg-[#501053] text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-[#501053]"
              }`}
            >
              All Orders
            </button>
            {[
              "pending",
              "accepted",
              "confirmed",
              "preparing",
              "ready",
              "out_for_delivery",
              "delivered",
              "cancelled",
              "rejected",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? "bg-[#501053] text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-[#501053]"
                }`}
              >
                {status.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-xl text-gray-600 mb-2">No orders found</p>
            <p className="text-sm text-gray-500 mb-6">
              Start ordering your favorite dishes
            </p>
            <a
              href="/products"
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Browse Menu
            </a>
          </div>
        ) : (
          <>
            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const statusColors = {
                        pending:
                          "bg-yellow-100 text-yellow-800 border border-yellow-200",
                        accepted:
                          "bg-cyan-100 text-cyan-800 border border-cyan-200",
                        confirmed:
                          "bg-blue-100 text-blue-800 border border-blue-200",
                        preparing:
                          "bg-purple-100 text-purple-800 border border-purple-200",
                        ready:
                          "bg-orange-100 text-orange-800 border border-orange-200",
                        out_for_delivery:
                          "bg-indigo-100 text-indigo-800 border border-indigo-200",
                        delivered:
                          "bg-green-100 text-green-800 border border-green-200",
                        cancelled:
                          "bg-red-100 text-red-800 border border-red-200",
                        rejected:
                          "bg-gray-100 text-gray-800 border border-gray-200",
                      };
                      const canCancel = [
                        "pending",
                        "confirmed",
                        "accepted",
                      ].includes(order.status);

                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50 cursor-pointer transition"
                          onClick={() =>
                            dispatch(
                              getMyOrders({
                                page: currentPage,
                                status: statusFilter,
                              })
                            )
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #
                              {order.orderNumber ||
                                order._id.slice(-6).toUpperCase()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(
                                new Date(order.createdAt),
                                "MMM dd, yyyy"
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(order.createdAt), "HH:mm")}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {order.items?.length || 0} item
                              {order.items?.length !== 1 ? "s" : ""}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.items
                                ?.slice(0, 2)
                                .map((item) => item.product?.name || item.name)
                                .join(", ")}
                              {order.items?.length > 2 && "..."}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              €
                              {(
                                order.pricing?.total ||
                                order.total ||
                                order.totalAmount ||
                                0
                              ).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 uppercase">
                              {order.payment?.method ||
                                order.paymentMethod ||
                                "N/A"}
                            </div>
                            <div
                              className={`text-xs ${
                                order.payment?.status === "paid"
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {order.payment?.status || "pending"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                statusColors[order.status] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status.replace(/_/g, " ").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/orders/${order._id}`;
                              }}
                              className="text-red-600 hover:text-red-900 font-medium mr-3"
                            >
                              View
                            </button>
                            {canCancel && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelOrder(order._id);
                                }}
                                className="text-gray-600 hover:text-gray-900 font-medium"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === index + 1
                        ? "bg-red-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
