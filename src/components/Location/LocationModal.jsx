import React, { useState, useEffect } from "react";
import { X, MapPin, Bike, Store, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import { validateDeliveryLocation } from "../../utils/locationValidator";
import {
  RESTAURANT_CONFIG,
  DELIVERY_CONFIG,
  findNearestStore,
} from "../../config/deliveryConfig";
import api from "../../utils/api";
import { useLocation } from "../../context/LocationContext";

const LocationModal = ({ isOpen, onClose, selectedMode }) => {
  const { setSelectedLocation } = useLocation();
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For validation loading
  const [showAllResults, setShowAllResults] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null); // Store information
  const [loadingStore, setLoadingStore] = useState(true);

  // Fetch store information on mount
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoadingStore(true);
        const response = await api.get("/stores?active=true");
        if (response.data.success && response.data.data?.length > 0) {
          setStoreInfo(response.data.data[0]); // Get the first (only) store
        }
      } catch (error) {
        console.error("Error fetching store info:", error);
      } finally {
        setLoadingStore(false);
      }
    };

    if (isOpen) {
      fetchStoreInfo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddressChange = async (value) => {
    setAddress(value);
    setError("");

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    try {
      // OPTION 1: Google Places API (Recommended for production)
      const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (GOOGLE_API_KEY) {
        // Use real Google Places API
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            value
          )}&components=country:nl&key=${GOOGLE_API_KEY}`
        );

        const data = await response.json();

        if (data.predictions && data.predictions.length > 0) {
          // Get place details for each prediction to get coordinates
          const suggestionsWithCoords = await Promise.all(
            data.predictions.slice(0, 8).map(async (prediction) => {
              const detailsResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry&key=${GOOGLE_API_KEY}`
              );
              const details = await detailsResponse.json();

              const lat = details.result?.geometry?.location?.lat || 52.2215;
              const lng = details.result?.geometry?.location?.lng || 5.4813;

              // Calculate distance from nearest store
              const nearestStore = findNearestStore(lat, lng);
              const distance = nearestStore ? nearestStore.distance : 0;

              return {
                address: prediction.description,
                lat,
                lng,
                calculatedDistance: distance.toFixed(1),
              };
            })
          );

          setSuggestions(suggestionsWithCoords);
          setIsSearching(false);
          return;
        }
      }

      // OPTION 2: Fallback to Nominatim (OpenStreetMap) - Free API
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          value
        )}&countrycodes=nl&format=json&limit=10`,
        {
          headers: {
            "User-Agent": "CrazyDragonApp/1.0",
          },
        }
      );

      const nominatimData = await nominatimResponse.json();

      if (nominatimData && nominatimData.length > 0) {
        // Calculate distances for all suggestions (parallel requests)
        const dynamicSuggestions = await Promise.all(
          nominatimData.map(async (place) => {
            const lat = parseFloat(place.lat);
            const lng = parseFloat(place.lon);

            // Calculate distance from nearest store (async call)
            const nearestStore = await findNearestStore(lat, lng);
            const distance = nearestStore ? nearestStore.distance : 999;

            return {
              address: place.display_name,
              lat,
              lng,
              calculatedDistance: distance.toFixed(1),
            };
          })
        );

        setSuggestions(dynamicSuggestions);
        setIsSearching(false);
        return;
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }

    // OPTION 3: Fallback to local search if APIs fail
    setIsSearching(false);
    setSuggestions([]);
  };

  // Helper function to calculate distance
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const handleSelectAddress = async (selectedAddress) => {
    setAddress(selectedAddress.address);
    setIsLoading(true); // Show loading during validation

    // Validate delivery coverage (NOW ASYNC)
    if (selectedMode === "delivery") {
      try {
        const validation = await validateDeliveryLocation({
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
          address: selectedAddress.address,
        });

        if (!validation.isValid) {
          // Don't clear suggestions, keep them visible
          setError(validation.reason);
          setShowAllResults(false); // Reset to allow "Show other results" button again
          setIsLoading(false);
          return;
        }

        // Save delivery info if available
        if (validation.delivery) {
          localStorage.setItem("deliveryFee", validation.delivery.fee);
          localStorage.setItem(
            "minimumOrder",
            validation.delivery.minimumOrder
          );
        }
      } catch (error) {
        console.error("Validation error:", error);
        setError("Unable to validate delivery address. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    // Valid location - clear suggestions and save
    setSuggestions([]);
    setError("");
    setShowAllResults(false);
    setIsLoading(false);

    localStorage.setItem("deliveryMode", selectedMode);
    localStorage.setItem("deliveryAddress", selectedAddress.address);
    localStorage.setItem("deliveryLat", selectedAddress.lat);
    localStorage.setItem("deliveryLng", selectedAddress.lng);

    // Update context state to trigger re-renders
    setSelectedLocation({
      address: selectedAddress.address,
      lat: selectedAddress.lat,
      lng: selectedAddress.lng,
    });

    // Show success message
    toast.success("Delivery location updated!", {
      duration: 2000,
    });

    // Close modal
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleClearAddress = () => {
    setAddress("");
    setSuggestions([]);
    setError("");
  };

  // Helper function to check if address is in coverage area
  const isInCoverageArea = (addressText) => {
    if (!storeInfo || !storeInfo.coverageArea.cities.length) {
      return true; // If no coverage cities specified, allow all
    }

    const addressLower = addressText.toLowerCase();
    return storeInfo.coverageArea.cities.some((city) =>
      addressLower.includes(city.toLowerCase())
    );
  };

  // Helper function to get priority score for sorting suggestions
  const getSuggestionPriority = (suggestion) => {
    const distance = parseFloat(suggestion.calculatedDistance);
    const inCoverage = isInCoverageArea(suggestion.address);
    const withinRadius = storeInfo
      ? distance <= storeInfo.deliverySettings.radiusKm
      : distance <= 15;

    // Priority scoring:
    // 1. In coverage city + within radius = highest priority
    // 2. Within radius but not in coverage city = medium priority
    // 3. Outside radius = lowest priority
    if (inCoverage && withinRadius) return 1;
    if (withinRadius) return 2;
    return 3;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#4E1D4D] to-[#792978] p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#4E1D4D]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Delivery Location?
              </h2>
              <p className="text-sm text-red-100">Where should we deliver?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#4E1D4D] rounded-full transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 space-y-4 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 100px)" }}
        >
          {/* Store Information & Delivery Coverage */}
          {/* {!loadingStore && storeInfo && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Store className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-purple-900">
                      {storeInfo.name}
                    </p>
                    <p className="text-xs text-purple-700 mt-0.5">
                      {storeInfo.address.fullAddress}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {storeInfo.contact.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">
                      Delivery Coverage: {storeInfo.deliverySettings.radiusKm}km
                      Radius
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Within {storeInfo.deliverySettings.radiusKm} kilometers •{" "}
                      {storeInfo.deliverySettings.estimatedDeliveryTime.min}-
                      {storeInfo.deliverySettings.estimatedDeliveryTime.max}{" "}
                      mins • €{storeInfo.deliverySettings.deliveryFee} delivery
                      fee
                    </p>
                    {storeInfo.coverageArea.cities.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-green-800">
                          We deliver to:
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          {storeInfo.coverageArea.cities.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Loading Store Info */}
          {loadingStore && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <p className="text-sm text-gray-600">
                  Loading store information...
                </p>
              </div>
            </div>
          )}

          {/* Detect Location Button */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              // Request geolocation
              if (navigator.geolocation) {
                setIsSearching(true);
                setError("");
                setSuggestions([]);

                navigator.geolocation.getCurrentPosition(
                  async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                      // Get address using reverse geocoding
                      let detectedAddress = `${latitude.toFixed(
                        4
                      )}, ${longitude.toFixed(4)}`;

                      // Try to get readable address from Nominatim
                      try {
                        const reverseGeoResponse = await fetch(
                          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                          {
                            headers: {
                              "User-Agent": "CrazyDragonApp/1.0",
                            },
                          }
                        );
                        const geoData = await reverseGeoResponse.json();
                        if (geoData && geoData.display_name) {
                          detectedAddress = geoData.display_name;
                        }
                      } catch (geoError) {
                        console.log(
                          "Reverse geocoding failed, using coordinates"
                        );
                      }

                      // Calculate distance to nearest store (async call to backend)
                      const nearestStore = await findNearestStore(
                        latitude,
                        longitude
                      );
                      const distance = nearestStore
                        ? nearestStore.distance
                        : 999;

                      // Create a detected location object
                      const detectedLocation = {
                        address: detectedAddress,
                        lat: latitude,
                        lng: longitude,
                        calculatedDistance: distance.toFixed(1),
                      };

                      setIsSearching(false);

                      // Check if within delivery range
                      if (
                        nearestStore &&
                        distance <= DELIVERY_CONFIG.radiusKm
                      ) {
                        // Within range - show success and validate
                        toast.success(
                          `Location detected! ${distance.toFixed(
                            1
                          )}km from nearest store`,
                          {
                            duration: 3000,
                          }
                        );
                        // Automatically validate and save
                        handleSelectAddress(detectedLocation);
                      } else {
                        // Outside range - show as suggestion with nearby locations
                        setSuggestions([detectedLocation]);
                        setAddress(detectedAddress);
                        setError(
                          `Your current location is ${distance.toFixed(
                            1
                          )}km away from our nearest store. Maximum delivery range is ${
                            DELIVERY_CONFIG.radiusKm
                          }km. You can select this location to see other nearby addresses.`
                        );
                        setShowAllResults(true);
                      }
                    } catch (error) {
                      console.error("Location processing error:", error);
                      setIsSearching(false);
                      setError(
                        "Could not process your location. Please try entering your address manually."
                      );
                    }
                  },
                  (error) => {
                    setIsSearching(false);
                    let errorMessage = "Could not detect your location. ";

                    switch (error.code) {
                      case error.PERMISSION_DENIED:
                        errorMessage +=
                          "Please allow location access in your browser settings.";
                        break;
                      case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location information is unavailable.";
                        break;
                      case error.TIMEOUT:
                        errorMessage += "Location request timed out.";
                        break;
                      default:
                        errorMessage += "Please enter your address manually.";
                    }

                    setError(errorMessage);
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                  }
                );
              } else {
                setError("Geolocation is not supported by your browser.");
              }
            }}
            disabled={isSearching}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-[#4E1D4D] text-[#4E1D4D] rounded-xl hover:bg-purple-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4E1D4D]"></div>
                Detecting Location & Checking Coverage...
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                Detect My Location
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">or enter manually</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Address Input */}
          <div className="space-y-3">
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-600">*</span>
              </label> */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4E1D4D]" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="amsterdam"
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:bg-purple-50 transition ${
                    error
                      ? "border-[#4E1D4D] focus:border-[#4E1D4D]"
                      : "border-gray-300 focus:border-[#4E1D4D]"
                  }`}
                />
                {address && (
                  <button
                    onClick={handleClearAddress}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* City and Postal Code */}
            {address && suggestions.length === 0 && !isSearching && !error && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Amsterdam"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="1011 AB"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !showAllResults && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-red-600 text-sm">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>{error}</p>
                </div>

                <button
                  onClick={() => {
                    setShowAllResults(true);
                    setError("");
                    // Show all locations in the area
                    handleAddressChange("nijkerk");
                  }}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
                >
                  Show other results
                </button>
              </div>
            )}

            {/* Delivery Information Box */}
            {address && suggestions.length === 0 && !isSearching && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Delivery Information
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    We deliver within 30-45 minutes to your location.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Address Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {/* {showAllResults && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
                  <p className="text-sm font-medium text-yellow-900">
                    ℹ️ Showing all locations (including outside delivery range)
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Only locations within{" "}
                    {storeInfo?.deliverySettings.radiusKm ||
                      DELIVERY_CONFIG.radiusKm}
                    km can be selected for delivery
                  </p>
                </div>
              )} */}
              <p className="text-xs text-gray-500 px-1">Select an address:</p>
              {suggestions
                .sort((a, b) => {
                  // Sort by priority: coverage + range > range only > outside range
                  const priorityA = getSuggestionPriority(a);
                  const priorityB = getSuggestionPriority(b);
                  if (priorityA !== priorityB) return priorityA - priorityB;
                  // Within same priority, sort by distance
                  return (
                    parseFloat(a.calculatedDistance) -
                    parseFloat(b.calculatedDistance)
                  );
                })
                .map((suggestion, index) => {
                  const distance = parseFloat(suggestion.calculatedDistance);
                  const maxRadius =
                    storeInfo?.deliverySettings.radiusKm ||
                    DELIVERY_CONFIG.radiusKm;
                  const isInRange = distance <= maxRadius;
                  const inCoverage = isInCoverageArea(suggestion.address);
                  const isTooFar =
                    distance > maxRadius && distance < maxRadius * 2;
                  const isVeryFar = distance >= maxRadius * 2;

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAddress(suggestion)}
                      className={`w-full flex items-start gap-3 p-3 border rounded-xl transition text-left ${
                        isInRange && inCoverage
                          ? "hover:bg-green-50 border-green-300 bg-green-50/50"
                          : isInRange
                          ? "hover:bg-green-50 border-green-200 bg-green-50/30"
                          : isTooFar
                          ? "hover:bg-orange-50 border-orange-200 bg-orange-50/30"
                          : "hover:bg-red-50 border-red-200 bg-red-50/30"
                      }`}
                    >
                      <MapPin
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isInRange
                            ? "text-green-600"
                            : isTooFar
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm">
                          {suggestion.address}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-medium ${
                              isInRange
                                ? "text-green-700"
                                : isTooFar
                                ? "text-orange-700"
                                : "text-red-700"
                            }`}
                          >
                            {distance}km away
                          </span>
                          {isInRange && inCoverage && (
                            <span className="text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-full">
                              ✓ In coverage area
                            </span>
                          )}
                          {isInRange && !inCoverage && (
                            <span className="text-xs text-green-700 font-medium">
                              ✓ In delivery range
                            </span>
                          )}
                          {isTooFar && (
                            <span className="text-xs text-orange-700 font-medium">
                              ⚠ Outside range
                            </span>
                          )}
                          {isVeryFar && (
                            <span className="text-xs text-red-700 font-medium">
                              ✗ Not Available
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E1D4D]"></div>
            </div>
          )}

          {/* Google Attribution */}
          {suggestions.length > 0 && (
            <div className="flex justify-center p-2 mt-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c7/GoogleLogoSept12015.png"
                alt="Powered by Google"
                className="h-4"
              />
            </div>
          )}

          {/* Confirm Location Button */}
          {address && suggestions.length === 0 && !isSearching && !error && (
            <button
              onClick={() => {
                // Manually entered address - create a mock location object
                const manualAddress = {
                  address: address,
                  lat: 52.3676, // Default Amsterdam coordinates
                  lng: 4.9041,
                };
                handleSelectAddress(manualAddress);
              }}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
            >
              Confirm Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
