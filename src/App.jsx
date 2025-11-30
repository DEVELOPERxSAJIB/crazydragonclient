import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import routes from "./routes/route";
import { Toaster } from "react-hot-toast";
import { initializeSocket, disconnectSocket } from "./utils/socket";
import { getCart } from "./features/cart/cartApiSlice";
import { getLoggedInUser } from "./features/auth/authApiSlice";

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Check if user is logged in on app initialization
  useEffect(() => {
    const checkAuth = async () => {
      // Only check if user is not already loaded
      if (!user) {
        console.log("🔍 App init: Checking if user is logged in...");
        try {
          await dispatch(getLoggedInUser()).unwrap();
          console.log("✅ App init: User is logged in");
        } catch {
          console.log("ℹ️ App init: User not logged in or session expired");
        }
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  useEffect(() => {
    // Initialize Socket.IO when user is logged in
    if (user && user._id) {
      initializeSocket(user._id);
    }

    // Cleanup socket connection on unmount or logout
    return () => {
      if (!user) {
        disconnectSocket();
      }
    };
  }, [user]);

  // Load cart on app initialization if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#491648",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#ef4444",
            },
          },
        }}
      />
      <RouterProvider router={routes} />
    </>
  );
}

export default App;
