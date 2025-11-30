/**
 * Location Validation Utility
 * Validates if customer location is within delivery coverage area
 */

import {
  RESTAURANT_CONFIG,
  DELIVERY_CONFIG,
  EXCLUDED_AREAS,
  validateDeliveryAddress,
} from "../config/deliveryConfig";

// Use centralized config (for backward compatibility)
const RESTAURANT_LOCATION = {
  lat: RESTAURANT_CONFIG.lat,
  lng: RESTAURANT_CONFIG.lng,
  address: RESTAURANT_CONFIG.address,
};

// Delivery radius from config
const DELIVERY_RADIUS_KM = DELIVERY_CONFIG.radiusKm;

// Distance calculation is now centralized in deliveryConfig.js

/**
 * Validate if location is within delivery coverage (BACKEND VALIDATION)
 * Calls backend API to validate delivery address against all active stores
 * @param {Object} location - Location object with lat, lng, and address
 * @returns {Promise<Object>} Validation result { isValid, reason, distance, nearestStore }
 */
export async function validateDeliveryLocation(location) {
  if (!location || !location.lat || !location.lng) {
    return {
      isValid: false,
      reason: "Location data is missing. Please select a valid address.",
      distance: null,
      nearestStore: null,
    };
  }

  // NOTE: Excluded areas check removed - now using store's coverageArea settings
  // The backend validation will handle all coverage and distance checks

  try {
    // Call backend validation API
    const validation = await validateDeliveryAddress(
      location.lat,
      location.lng,
      location.address || ""
    );

    return {
      isValid: validation.isValid,
      reason: validation.isValid ? null : validation.message,
      distance: validation.nearestStore?.distance?.toFixed(1) || null,
      nearestStore: validation.nearestStore,
      delivery: validation.delivery, // Include delivery info (fee, time, etc.)
    };
  } catch (error) {
    console.error("Location validation error:", error);
    return {
      isValid: false,
      reason: "Unable to validate delivery location. Please try again.",
      distance: null,
      nearestStore: null,
    };
  }
}

/**
 * Get current delivery location from localStorage
 * @returns {Object|null} Location object or null
 */
export function getCurrentDeliveryLocation() {
  const mode = localStorage.getItem("deliveryMode");

  // Collection mode doesn't need location validation
  if (mode === "collection") {
    return {
      mode: "collection",
      isValid: true,
    };
  }

  const address = localStorage.getItem("deliveryAddress");
  const lat = parseFloat(localStorage.getItem("deliveryLat"));
  const lng = parseFloat(localStorage.getItem("deliveryLng"));

  if (!address || !lat || !lng) {
    return null;
  }

  return {
    mode: "delivery",
    address,
    lat,
    lng,
  };
}

/**
 * Check if user has valid delivery setup (ASYNC)
 * @returns {Promise<Object>} { hasLocation, isValid, reason }
 */
export async function checkDeliverySetup() {
  const location = getCurrentDeliveryLocation();

  if (!location) {
    return {
      hasLocation: false,
      isValid: false,
      reason: "Please set your delivery location first.",
    };
  }

  // Collection mode is always valid
  if (location.mode === "collection") {
    return {
      hasLocation: true,
      isValid: true,
      reason: null,
    };
  }

  // Validate delivery location (now async)
  const validation = await validateDeliveryLocation(location);

  return {
    hasLocation: true,
    isValid: validation.isValid,
    reason: validation.reason,
    distance: validation.distance,
    nearestStore: validation.nearestStore,
    delivery: validation.delivery,
  };
}

/**
 * Clear delivery location from localStorage
 */
export function clearDeliveryLocation() {
  localStorage.removeItem("deliveryMode");
  localStorage.removeItem("deliveryAddress");
  localStorage.removeItem("deliveryLat");
  localStorage.removeItem("deliveryLng");
}

export default {
  validateDeliveryLocation,
  getCurrentDeliveryLocation,
  checkDeliverySetup,
  clearDeliveryLocation,
  DELIVERY_RADIUS_KM,
  RESTAURANT_LOCATION,
};
