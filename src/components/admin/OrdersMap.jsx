import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import api from "../../utils/api";
import { FcInfo } from "react-icons/fc";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const OrdersMap = ({ orders = [] }) => {
  // State for store details
  const [storeData, setStoreData] = useState(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);

  // State for status filters
  const [visibleStatuses, setVisibleStatuses] = useState({
    pending: true,
    confirmed: true,
    accepted: true,
    preparing: true,
    ready: true,
    out_for_delivery: true,
    delivered: true, // Show delivered by default
    cancelled: false, // Hide cancelled by default
    rejected: false, // Hide rejected by default
  });

  // Fetch store details from API (single store only)
  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setIsLoadingStore(true);
        const response = await api.get("/stores?active=true");

        if (response.data.success && response.data.data?.length > 0) {
          // Get the first (and only) store
          const store = response.data.data[0];
          setStoreData(store);
          console.log("Store data loaded:", store);
        } else {
          console.warn("No active stores found, using default location");
          // Set default store if no stores found
          setStoreData({
            name: "Crazy Dragon (Default)",
            location: {
              coordinates: [4.9041, 52.3676], // [lng, lat]
            },
            deliverySettings: {
              radiusKm: 20,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching store details:", error);
        // Fallback to default
        setStoreData({
          name: "Crazy Dragon (Default)",
          location: {
            coordinates: [4.9041, 52.3676],
          },
          deliverySettings: {
            radiusKm: 20,
          },
        });
      } finally {
        setIsLoadingStore(false);
      }
    };

    fetchStoreDetails();
  }, []);

  // Toggle status visibility
  const toggleStatus = (status) => {
    setVisibleStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  // Filter orders with delivery type (exclude collection orders)
  const ordersWithLocation = useMemo(() => {
    console.log("=== OrdersMap Debug ===");
    console.log("Total orders received:", orders.length);
    console.log("First order sample:", orders[0]);

    const filtered = orders.filter((order) => {
      // Check if it's a delivery order (not collection)
      const isDelivery = order.deliveryInfo?.type === "delivery";

      // Has delivery info with address (more lenient check)
      const hasAddress =
        order.deliveryInfo?.address &&
        (order.deliveryInfo.address.street ||
          order.deliveryInfo.address.city ||
          order.deliveryInfo.address.fullAddress ||
          order.deliveryInfo.address.postalCode);

      // Check if status is visible
      const statusKey = order.status?.toLowerCase().replace(/ /g, "_");
      const isVisible = visibleStatuses[statusKey] !== false;

      // Debug individual order
      if (!isDelivery || !hasAddress || !isVisible) {
        console.log(`Order ${order._id?.slice(-6)} filtered:`, {
          isDelivery,
          hasAddress,
          isVisible,
          status: order.status,
          type: order.deliveryInfo?.type,
          address: order.deliveryInfo?.address,
        });
      }

      return isDelivery && hasAddress && isVisible;
    });

    // Debug logging
    console.log("OrdersMap - Total orders:", orders.length);
    console.log("OrdersMap - Delivery orders with location:", filtered.length);

    // Show breakdown of filtered orders
    const collectionOrders = orders.filter(
      (o) => o.deliveryInfo?.type !== "delivery"
    ).length;
    const noAddressOrders = orders.filter(
      (o) =>
        o.deliveryInfo?.type === "delivery" &&
        !o.deliveryInfo?.address?.fullAddress &&
        !o.deliveryInfo?.address?.street &&
        !o.deliveryInfo?.address?.city
    ).length;
    const hiddenByStatus = orders.filter((o) => {
      const statusKey = o.status?.toLowerCase().replace(/ /g, "_");
      return visibleStatuses[statusKey] === false;
    }).length;

    console.log(
      "OrdersMap - Collection/Pickup orders (hidden):",
      collectionOrders
    );
    console.log(
      "OrdersMap - Delivery orders without address:",
      noAddressOrders
    );
    console.log("OrdersMap - Orders hidden by status filter:", hiddenByStatus);

    return filtered;
  }, [orders, visibleStatuses]);

  // Generate coordinates for orders (use actual if available, otherwise generate based on address)
  const getOrderCoordinates = (order) => {
    // Check if order has actual GPS coordinates in deliveryInfo
    if (order.deliveryInfo?.address?.coordinates?.length === 2) {
      return order.deliveryInfo.address.coordinates;
    }

    // Generate random coordinates around Amsterdam for visualization
    // Amsterdam center: 52.3676°N, 4.9041°E
    const baseLatitude = 52.3676;
    const baseLongitude = 4.9041;

    // Spread orders in ~5km radius (using order ID as seed for consistency)
    const seed = order._id ? parseInt(order._id.slice(-6), 16) : Math.random();
    const randomLat = baseLatitude + ((seed % 100) / 100 - 0.5) * 0.08;
    const randomLng = baseLongitude + ((seed % 150) / 100 - 0.5) * 0.12;

    return [randomLng, randomLat];
  };

  // Group orders by location (same coordinates = same location)
  const groupedOrders = useMemo(() => {
    const locationMap = new Map();

    ordersWithLocation.forEach((order) => {
      const [lng, lat] = getOrderCoordinates(order);
      // Create a key with rounded coordinates to group nearby orders (within ~10 meters)
      const locationKey = `${lat.toFixed(5)}_${lng.toFixed(5)}`;

      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, {
          coordinates: [lng, lat],
          orders: [],
        });
      }

      locationMap.get(locationKey).orders.push(order);
    });

    return Array.from(locationMap.values());
  }, [ordersWithLocation]);

  // Store location (from API)
  const storeLocation = useMemo(() => {
    if (!storeData) {
      return [52.3676, 4.9041]; // Default Amsterdam
    }
    // Store coordinates are [lng, lat], but Leaflet expects [lat, lng]
    const [lng, lat] = storeData.location.coordinates;
    return [lat, lng];
  }, [storeData]);

  const deliveryRadius = useMemo(() => {
    if (!storeData) {
      return 20000; // Default 20km in meters
    }
    return (storeData.deliverySettings.radiusKm || 20) * 1000; // Convert km to meters
  }, [storeData]);

  // Calculate map center dynamically based on all orders + store location
  const mapCenter = useMemo(() => {
    if (ordersWithLocation.length === 0) {
      return storeLocation; // Default to store if no orders
    }

    let sumLat = storeLocation[0]; // Include store location
    let sumLng = storeLocation[1];
    let count = 1; // Count store as 1 point

    ordersWithLocation.forEach((order) => {
      const [lng, lat] = getOrderCoordinates(order);
      sumLat += lat;
      sumLng += lng;
      count++;
    });

    return [sumLat / count, sumLng / count];
  }, [ordersWithLocation, storeLocation]);

  // Create custom markers for different statuses (can be single or multiple orders)
  const createCustomIcon = (status, orderCount = 1) => {
    const colors = {
      pending: "#eab308",
      confirmed: "#3b82f6",
      accepted: "#06b6d4",
      preparing: "#8b5cf6",
      ready: "#f59e0b",
      out_for_delivery: "#a855f7",
      "out for delivery": "#a855f7",
      delivered: "#22c55e",
      cancelled: "#ef4444",
      rejected: "#9ca3af",
    };

    const color = colors[status?.toLowerCase()] || "#4E1D4D";
    const size = orderCount > 1 ? 40 : 30; // Larger marker for multiple orders
    const fontSize = orderCount > 1 ? 18 : 16;

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          position: relative;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: ${fontSize}px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          ">${orderCount > 1 ? orderCount : "&#8857;"}</div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  };

  // Create custom store icon
  const createStoreIcon = () => {
    return L.divIcon({
      className: "store-marker",
      html: `
        <div style="
          background-color: #491648;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s ease-in-out infinite;
        ">
          <div style="
            color: white;
            font-size: 20px;
          ">🏪</div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  // Show loading state while fetching store data
  if (isLoadingStore) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#491648] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Delivery Orders Map
        </h2>
        <div className="text-right">
          {orders.length > ordersWithLocation.length && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <FcInfo size={18} /> Collection/pickup orders not shown on map
            </span>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-4 p-4 shadow-sm rounded-lg border border-gray-200 flex items-center gap-3">
        <p className="text-sm font-semibold text-gray-700">Filter by Status:</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStatuses.pending}
              onChange={() => toggleStatus("pending")}
              className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
            />
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              Pending
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStatuses.confirmed}
              onChange={() => toggleStatus("confirmed")}
              className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
            />
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              Confirmed
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStatuses.accepted}
              onChange={() => toggleStatus("accepted")}
              className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
            />
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              Accepted
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStatuses.preparing}
              onChange={() => toggleStatus("preparing")}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              Preparing
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStatuses.ready}
              onChange={() => toggleStatus("ready")}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              Ready
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStatuses.out_for_delivery}
              onChange={() => toggleStatus("out_for_delivery")}
              className="w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500"
            />
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              Out for Delivery
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStatuses.delivered}
              onChange={() => toggleStatus("delivered")}
              className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
            />
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              Delivered
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStatuses.cancelled}
              onChange={() => toggleStatus("cancelled")}
              className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
            />
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              Cancelled
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStatuses.rejected}
              onChange={() => toggleStatus("rejected")}
              className="w-4 h-4 text-gray-500 rounded focus:ring-gray-500"
            />
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              Rejected
            </span>
          </label>
        </div>
      </div>

      {/* Always show map */}
      <div className="rounded-lg overflow-hidden border-2 border-gray-200 h-[500px] relative">
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Delivery Coverage Circle */}
          <Circle
            center={storeLocation}
            radius={deliveryRadius}
            pathOptions={{
              color: "#491648",
              fillColor: "#491648",
              fillOpacity: 0.1,
              weight: 2,
              dashArray: "5, 5",
            }}
          />

          {/* Store Location Marker */}
          <Marker position={storeLocation} icon={createStoreIcon()}>
            <Popup maxWidth={300}>
              <div className="p-2">
                <h3 className="font-bold text-[#491648] text-base mb-2">
                  🏪 {storeData?.name || "Crazy Dragon Restaurant"}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Store Location:
                    </p>
                    <p className="text-gray-600">
                      {storeData?.address?.fullAddress || "Amsterdam Center"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {storeLocation[0].toFixed(4)}°N,{" "}
                      {storeLocation[1].toFixed(4)}°E
                    </p>
                  </div>
                  {storeData?.contact?.phone && (
                    <div>
                      <p className="font-semibold text-gray-800">Contact:</p>
                      <p className="text-gray-600">{storeData.contact.phone}</p>
                      {storeData.contact.email && (
                        <p className="text-xs text-gray-500">
                          {storeData.contact.email}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      Delivery Coverage:
                    </p>
                    <p className="text-gray-600">
                      {(deliveryRadius / 1000).toFixed(1)} km radius
                    </p>
                    {storeData?.deliverySettings?.minimumOrderAmount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Min. order: €
                        {storeData.deliverySettings.minimumOrderAmount}
                      </p>
                    )}
                  </div>
                  {storeData?.stats && (
                    <div className="bg-purple-50 p-2 rounded mt-2">
                      <p className="text-xs text-purple-700">
                        📦 {ordersWithLocation.length} active delivery orders
                      </p>
                      {storeData.stats.totalOrders > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Total orders: {storeData.stats.totalOrders}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Order Markers - Grouped by Location */}
          {groupedOrders.map((location, index) => {
            const [lng, lat] = location.coordinates;
            const orders = location.orders;
            const orderCount = orders.length;
            // Use the most urgent status for the marker color
            const primaryOrder = orders[0];

            return (
              <Marker
                key={`location-${index}`}
                position={[lat, lng]}
                icon={createCustomIcon(primaryOrder.status, orderCount)}
              >
                <Popup maxWidth={350} maxHeight={400}>
                  <div className="p-2">
                    {orderCount > 1 && (
                      <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                        <p className="font-bold text-blue-900 text-sm">
                          {orderCount} Orders at this location
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {orders.map((order) => {
                        const orderType =
                          order.deliveryInfo?.type || "delivery";

                        return (
                          <div
                            key={order._id}
                            className="border-b border-gray-200 pb-3 last:border-0"
                          >
                            <div className="flex gap-3 items-center justify-between mb-2">
                              <h3 className="font-bold text-gray-900 text-sm">
                                #{order.orderNumber || order._id?.slice(-6)}
                              </h3>
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                                  order.status?.toLowerCase() === "pending"
                                    ? "bg-yellow-500"
                                    : order.status?.toLowerCase() ===
                                      "confirmed"
                                    ? "bg-blue-500"
                                    : order.status?.toLowerCase() === "accepted"
                                    ? "bg-cyan-500"
                                    : order.status?.toLowerCase() ===
                                      "preparing"
                                    ? "bg-purple-500"
                                    : order.status?.toLowerCase() === "ready"
                                    ? "bg-orange-500"
                                    : order.status?.toLowerCase() ===
                                        "out_for_delivery" ||
                                      order.status?.toLowerCase() ===
                                        "out for delivery"
                                    ? "bg-purple-600"
                                    : order.status?.toLowerCase() ===
                                      "delivered"
                                    ? "bg-green-500"
                                    : order.status?.toLowerCase() ===
                                      "cancelled"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>

                            <div className="text-sm mt-3 space-y-1">
                              <div className="flex gap-1">
                                <span className="font-semibold m-0 p-0 text-gray-800">
                                  Type :
                                </span>
                                <span className="text-gray-600 capitalize m-0 p-0">
                                  {orderType === "collection"
                                    ? "Collection/Pickup"
                                    : "Home Delivery"}
                                </span>
                              </div>

                              <div className="flex gap-1">
                                <span className="font-semibold m-0 text-gray-800">
                                  Customer:
                                </span>
                                <span className="text-gray-600 m-0">
                                  {order.customerInfo?.firstName}{" "}
                                  {order.customerInfo?.lastName}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <span className="font-semibold text-gray-800">
                                  Customer:
                                </span>
                                <span className="text-gray-600">
                                  {order.customerInfo?.phone}
                                </span>
                              </div>

                              {orderType === "delivery" &&
                                order.deliveryInfo?.address && (
                                  <div className="flex">
                                    <span className="font-semibold text-gray-800">
                                      Delivery Address : 
                                    </span>
                                    
                                    <span className="text-gray-600">
                                      &nbsp;{order.deliveryInfo.address.street ||
                                        "No street"}
                                    </span> {" "}
                                    {/* {(order.deliveryInfo.address.city ||
                                      order.deliveryInfo.address
                                        .postalCode) && (
                                      <>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {order.deliveryInfo.address.city}
                                          {order.deliveryInfo.address
                                            .postalCode &&
                                            `, ${order.deliveryInfo.address.postalCode}`}
                                        </p>
                                      </>
                                    )} */}
                                    {/* {!order.deliveryInfo?.address
                                      ?.coordinates && (
                                      <p className="text-xs text-orange-500 mt-1">
                                        Approximate location
                                      </p>
                                    )} */}
                                  </div>
                                )}

                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-gray-800">
                                  Total:
                                </span>
                                <span className="text-lg m-0 font-bold text-[#491648]">
                                  €
                                  {order.pricing?.total?.toFixed(2) ||
                                    order.total?.toFixed(2) ||
                                    "0.00"}
                                </span>
                              </div>

                              <div className="text-xs text-gray-500">
                                {order.items?.length || 0} item(s)
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Empty state overlay when no orders */}
        {ordersWithLocation.length === 0 && (
          <div
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center pointer-events-none"
            style={{ zIndex: 1000 }}
          >
            <div className="text-center">
              <MapPin size={48} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                No orders with location data yet
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Orders with delivery addresses will appear here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#491648] flex items-center justify-center text-white text-xs">
            🏪
          </div>
          <span className="text-gray-600 font-semibold">Store Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full border-2 border-[#491648]"
            style={{ borderStyle: "dashed" }}
          ></div>
          <span className="text-gray-600">
            Coverage Area ({(deliveryRadius / 1000).toFixed(0)}km)
          </span>
        </div>
        {ordersWithLocation.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-gray-600">Accepted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-600">Preparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-gray-600">Out for Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-gray-600">Rejected</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersMap;
