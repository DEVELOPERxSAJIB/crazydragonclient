import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../utils/api";
import OrdersMap from "../../components/admin/OrdersMap";

const StatCard = ({ icon: Icon, title, value, color, trend }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-gray-200 transition-all duration-300">
    <div className="flex items-center justify-between py-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm font-medium text-green-600 flex items-center gap-1">
            <TrendingUp size={16} />
            {trend}
          </p>
        )}
      </div>
      <div
        className={`flex items-center justify-center h-12 w-12 rounded-xl shadow-inner bg-opacity-90 ${color}`}
      >
        <Icon size={26} className="text-white" />
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, title, description, color }) => (
  <Link
    to={to}
    className="
      group
      bg-white 
      rounded-2xl 
      shadow-sm 
      border 
      border-gray-100
      p-6 
      transition-all 
      duration-300 
      hover:shadow-lg 
      hover:-translate-y-0.5
      focus:ring-2 
      focus:ring-offset-2 
      focus:ring-gray-300
      block
    "
  >
    <div className="flex items-start space-x-4">
      <div
        className={`
          p-3 
          rounded-xl 
          flex 
          items-center 
          justify-center 
          shrink-0 
          ${color} 
          shadow-sm
        `}
      >
        <Icon
          size={22}
          className="text-white group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-gray-700 transition">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

  // Process orders data for charts
  const processChartData = useCallback((ordersData) => {
    // Revenue chart - Last 7 days
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dayRevenue = ordersData
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.toDateString() === date.toDateString() &&
            order.status === "delivered"
          );
        })
        .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

      last7Days.push({
        date: dateStr,
        revenue: parseFloat(dayRevenue.toFixed(2)),
        orders: ordersData.filter(
          (order) =>
            new Date(order.createdAt).toDateString() === date.toDateString()
        ).length,
      });
    }
    setRevenueData(last7Days);

    // Order status pie chart
    const statusCounts = {
      pending: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };

    ordersData.forEach((order) => {
      if (Object.prototype.hasOwnProperty.call(statusCounts, order.status)) {
        statusCounts[order.status]++;
      }
    });

    const statusData = [
      { name: "Pending", value: statusCounts.pending, color: "#F59E0B" },
      { name: "Accepted", value: statusCounts.accepted, color: "#3B82F6" },
      { name: "Preparing", value: statusCounts.preparing, color: "#8B5CF6" },
      { name: "Ready", value: statusCounts.ready, color: "#06B6D4" },
      {
        name: "Out for Delivery",
        value: statusCounts.out_for_delivery,
        color: "#10B981",
      },
      { name: "Delivered", value: statusCounts.delivered, color: "#22C55E" },
      { name: "Cancelled", value: statusCounts.cancelled, color: "#EF4444" },
    ].filter((item) => item.value > 0);

    setOrderStatusData(statusData);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/analytics/dashboard-stats");
        if (isMounted && response.data && response.data.payload) {
          setStats(response.data.payload);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error.message);
        // Set default values if API fails
        if (isMounted) {
          setStats({
            totalUsers: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalProducts: 0,
            pendingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/all/orders");

        if (!isMounted) return;

        // The API returns: { payload: { orders: [...], pagination: {...} } }
        const orderData =
          response.data.payload?.orders ||
          response.data.payload ||
          response.data.data ||
          response.data ||
          [];

        const orderArray = Array.isArray(orderData) ? orderData : [];
        setOrders(orderArray);

        // Process data for charts
        processChartData(orderArray);
      } catch (error) {
        console.error("Error fetching orders:", error.message);
        if (isMounted) {
          setOrders([]);
          // Process empty data for charts
          processChartData([]);
        }
      }
    };

    fetchDashboardStats();
    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [processChartData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#491648] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            {/* <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === "super_admin" ? "Super Admin" : "Admin"} Dashboard
            </h1> */}
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`€${stats?.totalRevenue?.toFixed(2) || "0.00"}`}
            color="bg-[#1E3A8A]" // Deep Navy
          />
          <StatCard
            icon={ShoppingBag}
            title="Total Orders"
            value={stats?.totalOrders || 0}
            color="bg-[#1E40AF]" // Steel Blue
          />
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats?.totalUsers || 0}
            color="bg-[#475569]" // Slate Gray
          />
          <StatCard
            icon={Package}
            title="Total Products"
            value={stats?.totalProducts || 0}
            color="bg-[#334155]" // Charcoal
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Clock}
            title="Pending Orders"
            value={stats?.pendingOrders || 0}
            color="bg-[#115E59]" // Forest Green
          />
          <StatCard
            icon={CheckCircle}
            title="Completed Orders"
            value={stats?.completedOrders || 0}
            color="bg-[#B45309]" // Burnt Orange
          />
          <StatCard
            icon={XCircle}
            title="Cancelled Orders"
            value={stats?.cancelledOrders || 0}
            color="bg-[#991B1B]" // Crimson Red
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Revenue (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`€${value}`, "Revenue"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1E40AF"
                  strokeWidth={3}
                  dot={{ fill: "#1E40AF", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue (€)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Orders by Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Daily Orders (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="orders"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
                name="Number of Orders"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Map */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order Locations
          </h2>
          <OrdersMap orders={orders} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              to="/admin/orders"
              icon={ShoppingBag}
              title="Manage Orders"
              description="View and manage customer orders"
              color="bg-blue-500"
            />
            <QuickAction
              to="/admin/products"
              icon={Package}
              title="Manage Products"
              description="Add, edit, or remove products"
              color="bg-orange-500"
            />
            <QuickAction
              to="/admin/users"
              icon={Users}
              title="Manage Users"
              description="View and manage user accounts"
              color="bg-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
