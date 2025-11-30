// iDEAL Payment Form
import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";

const IdealPaymentForm = ({ amount, onSuccess, onError, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment error:", error);
        toast.error(error.message || "Payment failed");
        onError?.(error);
      } else {
        toast.success("Payment successful!");
        onSuccess?.({ status: "succeeded" });
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment processing failed");
      onError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Pay with iDEAL</h3>
        <p className="text-sm text-gray-600 mb-4">
          Total: €{amount.toFixed(2)}
        </p>
      </div>

      <div className="border border-gray-300 rounded-md p-4">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing
          ? "Processing..."
          : `Pay €${amount.toFixed(2)} with iDEAL`}
      </button>

      <p className="text-xs text-gray-500 text-center mt-2">
        You will be redirected to your bank to complete the payment
      </p>
    </form>
  );
};

export default IdealPaymentForm;
