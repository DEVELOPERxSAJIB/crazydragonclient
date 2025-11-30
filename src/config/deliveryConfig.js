/**
 * Delivery Configuration - DYNAMIC BACKEND-DRIVEN SYSTEM
 *
 * ALL DATA NOW COMES FROM BACKEND API:
 * - Stores are managed by admin/super-admin
 * - Coverage areas are dynamic and configurable
 * - No hard-coded locations
 *
 * Admin can:
 * - Add/edit/delete stores
 * - Set delivery radius per store
 * - Configure operating hours
 * - Manage coverage areas
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";

// Cache stores data to reduce API calls
let cachedStores = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all stores from backend
 */
export async function fetchStores(forceRefresh = false) {
  // Return cached data if still valid
  if (
    !forceRefresh &&
    cachedStores &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    return cachedStores;
  }

  try {
    const response = await fetch(
      `${API_URL}/stores?active=true&showOnWebsite=true`
    );
    const data = await response.json();

    if (data.success) {
      cachedStores = data.data;
      cacheTimestamp = Date.now();
      return cachedStores;
    }

    return [];
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
}

// Backward compatibility exports (will be populated from API)
export const STORES = [];
export const RESTAURANT_CONFIG = {
  name: "Crazy Dragon",
  lat: 52.2215,
  lng: 5.4813,
  address: "Loading...",
};

// Delivery settings
export const DELIVERY_CONFIG = {
  // Delivery radius in kilometers
  // Customers within this distance can order
  radiusKm: 15,

  // Minimum order for delivery
  minimumOrderAmount: 10,

  // Delivery fee (can be dynamic based on distance)
  deliveryFee: 2.5,

  // Estimated delivery time
  estimatedMinutes: {
    min: 30,
    max: 45,
  },
};

// Distance-based delivery fee (optional)
// Uncomment and customize if you want different fees for different distances
export const DISTANCE_BASED_FEES = {
  enabled: false,
  tiers: [
    { maxKm: 5, fee: 1.5 }, // 0-5km: €1.50
    { maxKm: 10, fee: 2.5 }, // 5-10km: €2.50
    { maxKm: 15, fee: 3.5 }, // 10-15km: €3.50
  ],
};

// Cities/areas to exclude even if within radius
// NOTE: This is now controlled by store's coverageArea settings in database
// Keep this empty and use store.coverageArea.cities for dynamic control
export const EXCLUDED_AREAS = [];

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Restaurant latitude
 * @param {number} lon1 - Restaurant longitude
 * @param {number} lat2 - Customer latitude
 * @param {number} lon2 - Customer longitude
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(1));
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Find the nearest active store to customer location (FROM BACKEND)
 * @param {number} customerLat - Customer latitude
 * @param {number} customerLng - Customer longitude
 * @returns {Promise<Object|null>} Nearest store with distance, or null if none found
 */
export async function findNearestStore(customerLat, customerLng) {
  try {
    const response = await fetch(`${API_URL}/stores/nearest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: customerLat,
        lng: customerLng,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("Error finding nearest store:", error);
    return null;
  }
}

/**
 * Validate delivery address (FROM BACKEND)
 * @param {number} customerLat - Customer latitude
 * @param {number} customerLng - Customer longitude
 * @param {string} address - Customer address
 * @returns {Promise<Object>} Validation result with store info
 */
export async function validateDeliveryAddress(
  customerLat,
  customerLng,
  address = ""
) {
  try {
    const response = await fetch(`${API_URL}/stores/validate-delivery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: customerLat,
        lng: customerLng,
        address,
      }),
    });

    const data = await response.json();

    return {
      isValid: data.isValid,
      message: data.message,
      nearestStore: data.data?.nearestStore || null,
      delivery: data.data?.delivery || null,
    };
  } catch (error) {
    console.error("Error validating delivery:", error);
    return {
      isValid: false,
      message: "Error validating delivery address",
      nearestStore: null,
      delivery: null,
    };
  }
}

// Backward compatibility
export async function checkDeliveryRange(customerLat, customerLng) {
  const validation = await validateDeliveryAddress(customerLat, customerLng);

  return {
    inRange: validation.isValid,
    distance: validation.nearestStore?.distance || null,
    fee: validation.delivery?.fee || 2.5,
    nearestStore: validation.nearestStore,
    maxRadius: validation.nearestStore?.distance ? 15 : null,
  };
}

/**
 * Check if address is in excluded area
 * @param {string} address - Full address string
 * @returns {boolean} True if address is excluded
 */
export function isExcludedArea(address) {
  if (!address) return false;

  const addressLower = address.toLowerCase();
  return EXCLUDED_AREAS.some((area) =>
    addressLower.includes(area.toLowerCase())
  );
}

/**
 * Get delivery fee based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {number} Delivery fee in euros
 */
export function getDeliveryFee(distance) {
  if (!DISTANCE_BASED_FEES.enabled) {
    return DELIVERY_CONFIG.deliveryFee;
  }

  const tier = DISTANCE_BASED_FEES.tiers.find((t) => distance <= t.maxKm);
  return tier ? tier.fee : DELIVERY_CONFIG.deliveryFee;
}

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

/**
 * Get delivery status message based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {Object} { status: string, message: string, color: string }
 */
export function getDeliveryStatus(distance) {
  const radius = DELIVERY_CONFIG.radiusKm;

  if (distance <= radius * 0.5) {
    return {
      status: "excellent",
      message: "Fast delivery available",
      color: "green",
      icon: "🚀",
    };
  } else if (distance <= radius * 0.75) {
    return {
      status: "good",
      message: "Normal delivery time",
      color: "green",
      icon: "✓",
    };
  } else if (distance <= radius) {
    return {
      status: "acceptable",
      message: "Delivery available",
      color: "yellow",
      icon: "⚠",
    };
  } else {
    return {
      status: "unavailable",
      message: "Outside delivery range",
      color: "red",
      icon: "✗",
    };
  }
}

/**
 * Get all available stores within range of customer (FROM BACKEND)
 * @param {number} customerLat - Customer latitude
 * @param {number} customerLng - Customer longitude
 * @param {number} maxDistance - Maximum distance to search (default: 50km)
 * @returns {Promise<Array>} Array of stores with distances, sorted by nearest first
 */
export async function getStoresInRange(
  customerLat,
  customerLng,
  maxDistance = 50
) {
  try {
    const response = await fetch(`${API_URL}/stores/in-range`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: customerLat,
        lng: customerLng,
        maxDistance,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error("Error getting stores in range:", error);
    return [];
  }
}

export default {
  STORES,
  RESTAURANT_CONFIG,
  DELIVERY_CONFIG,
  DISTANCE_BASED_FEES,
  EXCLUDED_AREAS,
  calculateDistance,
  checkDeliveryRange,
  findNearestStore,
  getStoresInRange,
  isExcludedArea,
  getDeliveryFee,
  formatDistance,
  getDeliveryStatus,
};
