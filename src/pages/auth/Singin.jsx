import { Chrome, Facebook } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, getLoggedInUser } from "../../features/auth/authApiSlice";
import AlertMessage from "../../utils/AlertMessage";
import { setMessageEmpty } from "../../features/auth/authSlice";

const Singin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loader, isAuthenticated, message, error } = useSelector(
    (state) => state.auth
  );

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");
    const authError = params.get("error");

    console.log("🔍 OAuth callback check:", { authStatus, authError });

    if (authStatus === "success") {
      console.log("✅ OAuth success detected, fetching user data...");
      console.log("Current cookies:", document.cookie);

      // OAuth login successful, fetch user data
      dispatch(getLoggedInUser())
        .then((result) => {
          console.log("📦 getLoggedInUser result:", result);
          if (result.type === "auth/getLoggedInUser/fulfilled") {
            console.log("✅ User data loaded successfully:", result.payload);
            AlertMessage({ type: "success", msg: "Login successful!" });
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );

            const redirectPath = localStorage.getItem("redirectAfterLogin");
            if (redirectPath) {
              localStorage.removeItem("redirectAfterLogin");
              navigate(redirectPath);
            } else {
              navigate("/");
            }
          } else {
            console.error("❌ getLoggedInUser failed:", result);
            console.error("Error payload:", result.error);
            AlertMessage({
              type: "error",
              msg: result.error?.message || "Failed to load user data",
            });
          }
        })
        .catch((err) => {
          console.error("❌ Exception in getLoggedInUser:", err);
          AlertMessage({
            type: "error",
            msg: "An error occurred while loading user data",
          });
        });
    } else if (authError) {
      AlertMessage({
        type: "error",
        msg: `Authentication failed: ${authError.replace(/_/g, " ")}`,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate, dispatch]);

  const handleInputChange = (e) => {
    setInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(loginUser(input));
  };

  useEffect(() => {
    if (message) {
      AlertMessage({ type: "success", msg: message });
      dispatch(setMessageEmpty());

      // Check if there's a redirect path saved
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    }

    if (error) {
      AlertMessage({ type: "error", msg: error });
      dispatch(setMessageEmpty());
    }
  }, [error, isAuthenticated, navigate, user, message, dispatch]);

  // Background color matching the reference image's off-white/light beige
  const pageBgColor = "bg-stone-50";

  return (
    <div
      className={`min-h-[calc(100vh-84px)] flex items-center justify-center ${pageBgColor}`}
    >
      <div className="w-full max-w-md mx-4 md:mx-0 bg-white p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        {/* Header Title */}
        <h1 className="text-xl font-bold text-gray-800 text-start mb-6">
          Log in
        </h1>

        {/* Social Login Buttons */}
        <div className="space-y-4">
          <Link
            to="/register"
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl font-semibold transition duration-150 shadow-md"
          >
            Create account
          </Link>
          <button
            onClick={() => {
              const baseURL =
                import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";
              window.location.href = `${baseURL}/auth/google`;
            }}
            type="button"
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl font-semibold transition duration-150 shadow-md bg-[#5184EC] hover:bg-gray-50 text-white"
          >
            <Chrome size={20} />
            <span>Continue with Google</span>
          </button>
          <button
            onClick={() => {
              const baseURL =
                import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";
              window.location.href = `${baseURL}/auth/facebook`;
            }}
            type="button"
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl font-semibold transition duration-150 shadow-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Facebook size={20} />
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Separator "or" */}
        <div className="flex items-center my-6">
          <div className="grow border-t border-gray-300"></div>
          <span className="shrink mx-4 text-gray-500 text-sm font-medium">
            or
          </span>
          <div className="grow border-t border-gray-300"></div>
        </div>

        {/* Email Section */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              Continue with credintials
            </label>
            <input
              id="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
              value={input.email}
              onChange={handleInputChange}
            />
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
              value={input.password}
              onChange={handleInputChange}
            />

            <Link
              to={"/forget-password"}
              className="flex items-center justify-end"
            >
              <p className="font-semibold text-[14px] text-gray-400 hover:text-gray-500 hover:underline hover:cursor-pointer transition-all duration-300 decoration-2">
                Forgot Password?
              </p>
            </Link>

            <button
              disabled={loader}
              type="submit"
              className="cursor-pointer w-full py-3 px-4 bg-[#491648] hover:bg-[#6E3B72] text-white font-semibold text-md rounded-xl shadow-md transition duration-150"
            >
              {loader ? "Singing In . . ." : "Sing In"}
            </button>
          </div>
        </form>

        {/* Account Creation Link */}
        {/* <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-3">Not registered yet?</p>

          <Link
            to="/register"
            className="w-full block text-center py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition duration-150 shadow-sm"
          >
            Create account
          </Link>
        </div> */}

        {/* Legal Text */}
        {/* <p className="text-xs text-gray-500 text-center mt-6 leading-tight">
          By proceeding you agree to our
          <a href="#terms" className="text-orange-600 hover:underline mx-0.5">
            Terms and Conditions
          </a>
          . Please read our
          <a href="#privacy" className="text-orange-600 hover:underline mx-0.5">
            Privacy Statement
          </a>
          and
          <a href="#cookie" className="text-orange-600 hover:underline mx-0.5">
            Cookie Policy
          </a>
          .
        </p> */}
      </div>
    </div>
  );
};

export default Singin;
