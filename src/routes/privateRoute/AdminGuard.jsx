import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
  const { user } = useSelector((state) => state.auth);

  // Check if user is authenticated and has admin or super_admin role
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
