import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPasswordRequest } from "../../features/auth/authApiSlice";
import AlertMessage from "../../utils/AlertMessage";
import { setMessageEmpty } from "../../features/auth/authSlice";
import { Info } from "lucide-react";

const ForgetPassword = () => {
  const dispatch = useDispatch();

  const { user, loader, isAuthenticated, message, error } = useSelector(
    (state) => state.auth
  );

  const [input, setInput] = useState({
    email: "",
  });

  const handleInputChange = (e) => {
    setInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(forgotPasswordRequest(input));
  };

  useEffect(() => {
    if (message) {
      AlertMessage({ type: "success", msg: message });
      dispatch(setMessageEmpty());
    }

    if (error) {
      AlertMessage({ type: "error", msg: error });
      dispatch(setMessageEmpty());
    }
  }, [error, isAuthenticated, user, message, dispatch]);

  // Background color matching the reference image's off-white/light beige
  const pageBgColor = "bg-stone-50";

  return (
    <div
      className={`min-h-[calc(100vh-84px)] flex items-center justify-center ${pageBgColor}`}
    >
      <div className="w-full max-w-md mx-4 md:mx-0 bg-white p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        {/* Header Title */}
        <h1 className="text-xl font-bold text-gray-800 text-start mb-6">
          Forget Password
        </h1>

        {/* Email Section */}
        {!message && (
          <div className="flex mb-6 bg-blue-100 rounded-xl p-3">
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
        )}

        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                id="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
                value={input.email}
                onChange={handleInputChange}
              />

              <button
                disabled={loader}
                type="submit"
                className="cursor-pointer w-full py-3 px-4 bg-[#491648] hover:bg-[#6E3B72] text-white font-semibold text-md rounded-xl shadow-md transition duration-150"
              >
                {loader ? "Sending . . ." : "Send Email"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
