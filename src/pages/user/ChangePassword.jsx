import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../features/auth/authApiSlice";
import { setMessageEmpty } from "../../features/auth/authSlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";

const ChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loader, message, error, user } = useSelector((state) => state.auth);

  // Check if user is OAuth user
  const isOAuthUser = user?.googleId || user?.facebookId;

  const [input, setInput] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  // Handle success/error messages
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(setMessageEmpty());
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    }

    if (error) {
      toast.error(error);
      dispatch(setMessageEmpty());
    }
  }, [message, error, dispatch, navigate]);

  const handleInputChange = (e) => {
    setInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Client-side validation
    if (!input.oldPassword || !input.newPassword || !input.confirmNewPassword) {
      toast.error("All fields are required");
      return;
    }

    if (input.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (input.newPassword !== input.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (input.oldPassword === input.newPassword) {
      toast.error("New password must be different from old password");
      return;
    }

    dispatch(changePassword(input));
  };

  return (
    <div className="min-h-[calc(100vh-84px)] flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[#491648] rounded-full">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Change Password
            </h1>
            <p className="text-sm text-gray-500">
              Update your account password
            </p>
          </div>
        </div>

        {/* OAuth User Warning */}
        {isOAuthUser && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">OAuth Account</p>
                <p>
                  You signed up with {user?.googleId ? "Google" : "Facebook"}.
                  Password changes are not available for OAuth accounts. You can
                  continue using your {user?.googleId ? "Google" : "Facebook"}{" "}
                  account to sign in.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="mt-4 w-full py-2 px-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium rounded-lg transition duration-200"
            >
              Back to Profile
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 ${
            isOAuthUser ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {/* Old Password */}
          <div>
            <label
              htmlFor="oldPassword"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.oldPassword ? "text" : "password"}
                id="oldPassword"
                name="oldPassword"
                required
                className="w-full px-4 py-3 pr-12 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
                value={input.oldPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("oldPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.oldPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                required
                className="w-full px-4 py-3 pr-12 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
                value={input.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("newPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.newPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters long
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirmNewPassword ? "text" : "password"}
                id="confirmNewPassword"
                name="confirmNewPassword"
                required
                className="w-full px-4 py-3 pr-12 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
                value={input.confirmNewPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirmNewPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirmNewPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Security Notice</p>
                <p>
                  After changing your password, you will be logged out and need
                  to sign in again with your new password.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loader}
              className="flex-1 py-3 px-6 bg-[#491648] hover:bg-[#6E3B72] text-white font-semibold rounded-lg shadow-md transition duration-200 active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loader ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Changing...
                </span>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
