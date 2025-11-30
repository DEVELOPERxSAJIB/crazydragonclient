import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const stripeRef = useRef(null);
  const elementsRef = useRef(null);

  useEffect(() => {
    const clientSecret = searchParams.get("client_secret");
    const orderId = searchParams.get("order_id");
    const paymentMethod = localStorage.getItem("pendingPaymentMethod") || "card";

    console.log("=== PAYMENT CHECKOUT ===");
    console.log("Client Secret:", clientSecret);
    console.log("Order ID:", orderId);

    if (!clientSecret || !orderId) {
      toast.error("Payment information missing");
      navigate("/orders");
      return;
    }

    const loadStripe = async () => {
      if (!window.Stripe) {
        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/";
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }
    };

    const init = async () => {
      try {
        await loadStripe();
        
        const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        const elements = stripe.elements({ clientSecret });
        const paymentElement = elements.create("payment", { layout: "tabs" });

        stripeRef.current = stripe;
        elementsRef.current = elements;

        setLoading(false);
        
        setTimeout(() => paymentElement.mount("#payment-element"), 100);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    init();
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripeRef.current || !elementsRef.current) {
      toast.error("Payment system not ready");
      return;
    }

    setProcessing(true);

    try {
      const orderId = searchParams.get("order_id");
      const { error } = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?order_id=${orderId}`,
        },
      });

      if (error) {
        toast.error(error.message);
        setProcessing(false);
      }
    } catch (err) {
      toast.error("Payment failed");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Complete Payment
          </h1>

          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => navigate("/orders")}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg"
              >
                Back to Orders
              </button>
            </div>
          ) : (
            <>
              {loading && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading payment form...</p>
                </div>
              )}

              <form 
                id="payment-form" 
                onSubmit={handleSubmit}
                style={{ display: loading ? 'none' : 'block' }}
              >
                <div id="payment-element" className="mb-6"></div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Pay Now"}
                </button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  Your payment is secured by Stripe
                </p>
              </form>
            </>
          )}

          <button
            onClick={() => navigate("/orders")}
            className="w-full mt-4 text-orange-600 hover:text-orange-700 font-medium"
          >
            Cancel Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;
