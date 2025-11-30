// Payment Method Selector
import React, { useState } from "react";
import StripeProvider from "./StripeProvider";
import IdealPaymentForm from "./IdealPaymentForm";
import CardPaymentForm from "./CardPaymentForm";

const PaymentMethodSelector = ({ amount, clientSecret, onSuccess, onError }) => {
  const [selectedMethod, setSelectedMethod] = useState("ideal");

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Select Payment Method</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedMethod("ideal")}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedMethod === "ideal"
                ? "border-red-600 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 mb-2" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="8" fill="#CC0066" />
                <path
                  d="M16 24h32v16H16z"
                  fill="white"
                />
                <text
                  x="32"
                  y="36"
                  fill="#CC0066"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  iDEAL
                </text>
              </svg>
              <span className="font-semibold">iDEAL</span>
              <span className="text-xs text-gray-500">Dutch Banks</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod("card")}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedMethod === "card"
                ? "border-red-600 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 mb-2" viewBox="0 0 64 64" fill="none">
                <rect
                  x="8"
                  y="16"
                  width="48"
                  height="32"
                  rx="4"
                  fill="#1F2937"
                />
                <rect
                  x="8"
                  y="22"
                  width="48"
                  height="6"
                  fill="#4B5563"
                />
                <rect
                  x="12"
                  y="34"
                  width="20"
                  height="4"
                  rx="2"
                  fill="#9CA3AF"
                />
              </svg>
              <span className="font-semibold">Credit/Debit Card</span>
              <span className="text-xs text-gray-500">Visa, Mastercard</span>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {clientSecret ? (
          <StripeProvider clientSecret={clientSecret}>
            {selectedMethod === "ideal" ? (
              <IdealPaymentForm
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
              />
            ) : (
              <CardPaymentForm
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
              />
            )}
          </StripeProvider>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing payment...</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Payments are securely processed by Stripe</p>
        <p className="mt-1">Your card details are encrypted and never stored</p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
