import React, { useState } from "react";
import { X, MapPin, Navigation } from "lucide-react";

const LocationModal = ({ isOpen, onClose, onLocationSet }) => {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    setIsDetecting(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // For demo, set some default values
            // In production, you'd call a geocoding API here
            setAddress("Detected Address");
            setCity("Amsterdam");
            setPostalCode("1011 AB");

            setIsDetecting(false);
          } catch (error) {
            console.error("Error getting address:", error);
            setIsDetecting(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not detect your location. Please enter manually.");
          setIsDetecting(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsDetecting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!address || !city || !postalCode) {
      alert("Please fill in all fields");
      return;
    }

    const locationData = {
      address,
      city,
      postalCode,
      fullAddress: `${address}, ${postalCode} ${city}`,
    };

    // Save to localStorage
    localStorage.setItem("deliveryLocation", JSON.stringify(locationData));

    // Call parent callback
    if (onLocationSet) {
      onLocationSet(locationData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4E1D4D] to-[#8e2d8d] p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Delivery Location</h2>
                <p className="text-sm text-red-100">Where should we deliver?</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Detect Location Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isDetecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                Detecting Location...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Detect My Location
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                or enter manually
              </span>
            </div>
          </div>

          {/* Address Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Street Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Damrak 123"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* City and Postal Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Amsterdam"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="1011 AB"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Delivery Information</p>
                <p>We deliver within 30-45 minutes to your location.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-linear-to-r from-red-600 to-red-700 text-white rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Confirm Location
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;
