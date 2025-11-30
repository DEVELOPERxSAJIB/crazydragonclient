import { Chrome, Facebook } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AlertMessage from "../../utils/AlertMessage";
import { setMessageEmpty } from "../../features/auth/authSlice";
import { processRegister } from "../../features/auth/authApiSlice";


const SocialButton = ({
  icon: Icon,
  label,
  bgColor,
  hoverBgColor,
  textColor = "text-white",
}) => (
  <button
    className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl font-semibold transition duration-150 shadow-md
            ${bgColor} ${hoverBgColor} ${textColor}`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const Registration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loader, isAuthenticated, verificationToken, message, error } = useSelector((state) => state.auth);

  const [input, setInput] = useState({
    name : "",
    email: "",
    password: "",
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
  }, [error, isAuthenticated, navigate, user, message, dispatch, verificationToken]);

  // Background color matching the reference image's off-white/light beige
  const pageBgColor = "bg-stone-50";

  return (
    <div
      className={`min-h-[calc(100vh-84px)] flex items-center justify-center ${pageBgColor}`}
    >
      <div className="w-full max-w-md mx-4 md:mx-0 bg-white p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        {/* Header Title */}
        <h1 className="text-xl font-bold text-gray-800 text-start mb-6">
          Create account
        </h1>

        {/* Social Login Buttons */}
        <div className="space-y-4">
          <SocialButton
            icon={Chrome}
            label="Continue with Google"
            bgColor="bg-white"
            hoverBgColor="hover:bg-gray-50"
            textColor="text-gray-700"
          />
          <SocialButton
            icon={Facebook}
            label="Continue with Facebook"
            bgColor="bg-blue-600"
            hoverBgColor="hover:bg-blue-700"
          />
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
            <input
              id="name"
              name="name"
              placeholder="Full name"
              className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
              value={input.name}
              onChange={handleInputChange}
            />
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
            <button
              disabled={loader}
              type="submit"
              className="cursor-pointer w-full py-3 px-4 bg-[#491648] hover:bg-[#6E3B72] text-white font-semibold text-md rounded-xl shadow-md transition duration-150"
            >
              {loader ? "Processing . . ." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Account Creation Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-3">Already have an account?</p>

          <Link
            to="/signin"
            className="w-full block text-center py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition duration-150 shadow-sm"
          >
            Sign In
          </Link>
        </div>

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

export default Registration;
