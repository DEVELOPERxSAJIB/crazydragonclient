import { Chrome, Facebook, Info, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AlertMessage from "../../utils/AlertMessage";
import { setMessageEmpty } from "../../features/auth/authSlice";
import { verifyRegisteredUser } from "../../features/auth/authApiSlice";


const RegisterVerify = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const { user, loader, isAuthenticated, message, error } = useSelector(
    (state) => state.auth
  );

  const [input, setInput] = useState({
    activationCode: "",
  });

  const handleInputChange = (e) => {
    setInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      token: params?.token,
      code: input.activationCode,
    };

    dispatch(verifyRegisteredUser(data));
  };

  useEffect(() => {
    if (message) {
      AlertMessage({ type: "success", msg: message });
      dispatch(setMessageEmpty());
      navigate("/");
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
      className={`min-h-[80vh] flex items-center justify-center ${pageBgColor}`}
    >
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        {/* Header Title */}
        <h1 className="text-xl font-bold text-gray-800 text-start mb-3">
          Verification code
        </h1>

        {/* info desing */}
        <div className="flex mb-3 bg-blue-100 rounded-xl p-3">
          <div className="flex-1">
            <Info
              className="bg-blue-600 p-1 rounded-xl"
              color="#fff"
              size={35}
            />
          </div>
          <div className="flex-11 ml-3 text-sm text-gray-600">
            We sent an email with a verification code to your :{" "}
            <strong className="font-bold"> E-mail</strong>
            <br />
            <br />
            It's valid for 10 minutes. If you can't find it, check your spam
            folder.
          </div>
        </div>

        {/* Email Section */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              id="activationCode"
              name="activationCode"
              placeholder="Enter your verification code"
              className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
              value={input.activationCode}
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="cursor-pointer w-full py-3 px-4 bg-[#491648] hover:bg-[#6E3B72] text-white font-semibold text-md rounded-xl shadow-md transition duration-150"
            >
              {loader ? "Verifying . . ." : "Verify Account"}
            </button>
          </div>
        </form>

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

export default RegisterVerify;
