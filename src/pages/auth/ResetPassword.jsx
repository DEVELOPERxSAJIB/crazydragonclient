import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AlertMessage from "../../utils/AlertMessage";
import { setMessageEmpty } from "../../features/auth/authSlice";
import { processRegister } from "../../features/auth/authApiSlice";



const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, verificationToken, message, error } =
    useSelector((state) => state.auth);

  const [input, setInput] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleInputChange = (e) => {
    setInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(processRegister(input));
  };

  useEffect(() => {
    if (message && verificationToken) {
      AlertMessage({ type: "success", msg: message });
      dispatch(setMessageEmpty());
      navigate(`/register/${verificationToken}`);
    }

    if (error) {
      AlertMessage({ type: "error", msg: error });
      dispatch(setMessageEmpty());
    }
  }, [
    error,
    isAuthenticated,
    navigate,
    user,
    message,
    dispatch,
    verificationToken,
  ]);

  // Background color matching the reference image's off-white/light beige
  const pageBgColor = "bg-stone-50";

  return (
    <div
      className={`min-h-[calc(100vh-84px)] flex items-center justify-center ${pageBgColor}`}
    >
      <div className="w-full max-w-md mx-4 md:mx-0 bg-white p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        {/* Header Title */}
        <h1 className="text-xl font-bold text-gray-800 text-start mb-6">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label
              htmlFor="newPassword"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
              value={input.newPassword}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
              value={input.confirmNewPassword}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-[#491648] hover:bg-[#6E3B72] text-white font-semibold rounded-lg shadow-md transition duration-200 active:scale-[0.99]"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
