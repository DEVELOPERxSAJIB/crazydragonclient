import AdminDashboard from "../../pages/admin/AdminDashboard";
import AdminOrders from "../../pages/admin/AdminOrders";
import AdminProducts from "../../pages/admin/AdminProducts";
import AdminStores from "../../pages/admin/AdminStores";
import AdminUsers from "../../pages/admin/AdminUsers";
import AdminCategories from "../../pages/admin/AdminCategories";
import AdminReviews from "../../pages/admin/AdminReviews";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminGuard from "./AdminGuard";

const AdminRouter = [
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
          {
            path: "/admin/reviews",
            element: <AdminReviews />,
          },
        ],
      },
    ],
  },
];

export default AdminRouter;
