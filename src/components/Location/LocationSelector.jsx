import React, { useState, useEffect } from "react";
import { Bike, Store, MapPin } from "lucide-react";
import LocationModal from "./LocationModal";

const LocationSelector = () => {
  const [showModal, setShowModal] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState("delivery");
  const [address, setAddress] = useState("");

  useEffect(() => {
    // Load saved location from localStorage
    const savedMode = localStorage.getItem("deliveryMode") || "delivery";
    const savedAddress = localStorage.getItem("deliveryAddress") || "";

    setDeliveryMode(savedMode);
    setAddress(savedAddress);

    // Show modal on first visit
    if (!savedAddress) {
      setShowModal(true);
    }
  }, []);

  const handleModeChange = (mode) => {
    setDeliveryMode(mode);
  };

  const getShortAddress = (fullAddress) => {
    if (!fullAddress) return "Set location";
    // Extract street and number (first part before comma)
    return fullAddress.split(",")[0];
  };

  return (
    <>
      {/* Location Selector Button */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-orange-500 transition cursor-pointer">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
          data-location-selector
        >
          {deliveryMode === "delivery" ? (
            <Bike className="w-5 h-5 text-orange-500" />
          ) : (
            <Store className="w-5 h-5 text-orange-500" />
          )}

          <div className="text-left">
            <p className="text-xs text-gray-500">
              {deliveryMode === "delivery" ? "Delivery" : "Collection"}
            </p>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
              {getShortAddress(address)}
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </p>
          </div>
        </button>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedMode={deliveryMode}
        onModeChange={handleModeChange}
      />
    </>
  );
};

export default LocationSelector;
