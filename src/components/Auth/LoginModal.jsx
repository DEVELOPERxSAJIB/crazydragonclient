import { useState, useEffect } from "react";
import { X, Mail, Lock, Chrome, Facebook } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loginUser } from "../../features/auth/authApiSlice";
import { toast } from "react-hot-toast";
import { setMessageEmpty } from "../../features/auth/authSlice";

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const dispatch = useDispatch();
  const { loader, message, error } = useSelector((state) => state.auth);

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.email || !input.password) {
      toast.error("Please fill in all fields");
      return;
    }

    dispatch(loginUser(input));
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const baseURL =
      import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";
    window.location.href = `${baseURL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    // Redirect to backend Facebook OAuth endpoint
    const baseURL =
      import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";
    window.location.href = `${baseURL}/auth/facebook`;
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(setMessageEmpty());

      // Call success callback and close modal
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Reset form and close modal
      setTimeout(() => {
        setInput({ email: "", password: "" });
        onClose();
      }, 0);
    }

    if (error) {
      toast.error(error);
      dispatch(setMessageEmpty());
    }
  }, [message, error, dispatch, onClose, onLoginSuccess]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Welcome Back!</h2>
          <p className="text-orange-100 mt-1">Login to continue shopping</p>
        </div>

        <div className="p-6">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              <Chrome className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Continue with Google</span>
            </button>

            <button
              onClick={handleFacebookLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 rounded-lg font-semibold text-white hover:bg-blue-700 transition"
            >
              <Facebook className="w-5 h-5" />
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 font-medium">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={input.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={input.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 rounded" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forget-password"
                onClick={onClose}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loader}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              onClick={onClose}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
