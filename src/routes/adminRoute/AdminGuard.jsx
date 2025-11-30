import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;