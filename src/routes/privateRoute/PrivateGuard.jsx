import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateGuard = () => {
  const { user } = useSelector((state) => state.auth);

  return user ? <Outlet /> : <Navigate to={"/signin"} />;

};

export default PrivateGuard;