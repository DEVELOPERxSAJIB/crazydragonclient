import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { confirmPayment } from "../features/payment/paymentApiSlice";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handlePaymentConfirmation = async () => {
      try {
        // Get payment intent ID from URL or localStorage
        const paymentIntentId =
          searchParams.get("payment_intent") ||
          searchParams
            .get("payment_intent_client_secret")
            ?.split("_secret_")[0];

        const orderId = localStorage.getItem("pendingOrderId");

        if (!paymentIntentId) {
          toast.error("Payment information not found");
          setProcessing(false);
          setTimeout(() => navigate("/orders"), 2000);
          return;
        }

        // Confirm payment with backend
        await dispatch(confirmPayment({ paymentIntentId })).unwrap();

        // Clear stored data
        localStorage.removeItem("pendingOrderId");
        localStorage.removeItem("pendingPaymentMethod");
        localStorage.removeItem("pendingPaymentClientSecret");

        setSuccess(true);
        toast.success("Payment successful! Order confirmed.");

        // Redirect to order success page
        setTimeout(() => {
          if (orderId) {
            navigate(`/order-success/${orderId}`);
          } else {
            navigate("/orders");
          }
        }, 2000);
      } catch (error) {
        console.error("Payment confirmation error:", error);
        const errorMessage =
          error?.message ||
          error?.error ||
          error ||
          "Payment confirmation failed";
        toast.error(
          typeof errorMessage === "string"
            ? errorMessage
            : "Payment confirmation failed"
        );
        setSuccess(false);
        setProcessing(false);

        // Redirect to orders page after failure
        setTimeout(() => navigate("/orders"), 3000);
      }
    };

    handlePaymentConfirmation();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {processing ? (
          <>
            <div className="w-16 h-16 mx-auto border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </>
        ) : success ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4">
              <svg
                className="text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">
              Payment Successful!
            </h2>
            <p className="text-gray-600">
              Your order has been confirmed. Redirecting...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4">
              <svg
                className="text-red-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-600">
              Payment Failed
            </h2>
            <p className="text-gray-600">
              There was an issue confirming your payment. Please contact
              support.
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              View Orders
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
