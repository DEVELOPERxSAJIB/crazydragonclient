import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  // Initialize from localStorage
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const savedAddress = localStorage.getItem("deliveryAddress");
    const savedLat = localStorage.getItem("deliveryLat");
    const savedLng = localStorage.getItem("deliveryLng");

    if (savedAddress && savedLat && savedLng) {
      return {
        address: savedAddress,
        lat: parseFloat(savedLat),
        lng: parseFloat(savedLng),
      };
    }
    return null;
  });

  const [showLocationModal, setShowLocationModal] = useState(false);

  // Check if location exists
  const hasLocation = () => {
    return !!selectedLocation || !!localStorage.getItem("deliveryAddress");
  };

  // Persist location changes to localStorage
  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem("deliveryAddress", selectedLocation.address);
      localStorage.setItem("deliveryLat", selectedLocation.lat.toString());
      localStorage.setItem("deliveryLng", selectedLocation.lng.toString());
    }
  }, [selectedLocation]);

  const value = {
    selectedLocation,
    setSelectedLocation,
    showLocationModal,
    setShowLocationModal,
    hasLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
