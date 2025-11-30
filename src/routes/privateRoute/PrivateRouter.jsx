import Layouts from "../../components/Layouts/Layouts";
import ChangePassword from "../../pages/user/ChangePassword";
import EditProfile from "../../pages/user/EditProfile";
import Profile from "../../pages/user/Profile";
import OrdersPage from "../../pages/Orders";
import OrderSuccess from "../../pages/OrderSuccess";
import PaymentSuccess from "../../pages/PaymentSuccess";
import PaymentCheckout from "../../pages/PaymentCheckout";
import Checkout from "../../pages/Checkout";
import AdminDashboard from "../../pages/admin/AdminDashboard";
import AdminOrders from "../../pages/admin/AdminOrders";
import AdminProducts from "../../pages/admin/AdminProducts";
import AdminStores from "../../pages/admin/AdminStores";
import AdminUsers from "../../pages/admin/AdminUsers";
import AdminCategories from "../../pages/admin/AdminCategories";
import AdminLayout from "../../components/admin/AdminLayout";
import PrivateGuard from "./PrivateGuard";
import AdminGuard from "./AdminGuard";

const PrivateRouter = [
  {
    element: <Layouts />,
    children: [
      {
        element: <PrivateGuard />,
        children: [
          {
            path: "/orders",
            element: <OrdersPage />,
          },
          {
            path: "/orders/:orderId",
            element: <OrderSuccess />,
          },
          {
            path: "/payment-checkout",
            element: <PaymentCheckout />,
          },
          {
            path: "/payment-success",
            element: <PaymentSuccess />,
          },
          {
            path: "/checkout",
            element: <Checkout />,
          },
          {
            path: "/profile",
            element: <Profile />,
          },
          {
            path: "/edit-profile",
            element: <EditProfile />,
          },
          {
            path: "/change-password",
            element: <ChangePassword />,
          },
        ],
      },
      {
        element: <AdminGuard />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: "/admin/dashboard",
                element: <AdminDashboard />,
              },
              {
                path: "/admin/orders",
                element: <AdminOrders />,
              },
              {
                path: "/admin/products",
                element: <AdminProducts />,
              },
              {
                path: "/admin/categories",
                element: <AdminCategories />,
              },
              {
                path: "/admin/stores",
                element: <AdminStores />,
              },
              {
                path: "/admin/users",
                element: <AdminUsers />,
              },
            ],
          },
        ],
      },
    ],
  },
];

export default PrivateRouter;
