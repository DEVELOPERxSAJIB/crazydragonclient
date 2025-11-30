import { useState, useEffect } from "react";
import {
  Store,
  MapPin,
  Clock,
  DollarSign,
  Edit,
  Plus,
  Power,
  Navigation,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import StoreFormModal from "../../components/admin/StoreFormModal";
import { IoWarningOutline } from "react-icons/io5";

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // Fetch all stores
  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get("/stores");

      if (response.data.success) {
        setStores(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Toggle store active status
  const toggleStoreStatus = async (storeId) => {
    try {
      const response = await api.patch(`/stores/${storeId}/toggle-active`);

      if (response.data.success) {
        toast.success(response.data.message);
        fetchStores(); // Refresh list
      } else {
        toast.error(response.data.message || "Failed to toggle store status");
      }
    } catch (error) {
      console.error("Error toggling store:", error);
      toast.error("Failed to update store status");
    }
  };

  const formatTime = (timeString) => {
    return timeString || "Closed";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#491648]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-start flex-col">
          {/* <h1 className="text-3xl font-bold text-gray-900">Store Management</h1> */}
          {stores.length > 0 && (
            <h4 className="text-sm text-[#491648] flex items-center gap-1 text-[14px]">
              <IoWarningOutline size={18} color={"#491648"} /> Single store
              mode: Only one store is allowed. You can only update the existing
              store.
            </h4>
          )}
          <h4 className="">
            {stores.length > 0
              ? "Manage your store location, delivery area, and operating hours"
              : "Set up your store location and delivery settings"}
          </h4>
        </div>
        {stores.length === 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#491648] text-white px-4 py-2 rounded-lg hover:bg-[#5a1d59] transition-colors"
          >
            <Plus size={20} />
            Add Store
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-200">
              <Store className="text-green-700" size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Stores</p>
              <p className="text-3xl font-semibold text-gray-900">
                {stores.length}
              </p>
            </div>
          </div>
        </div>

        {/** ACTIVE STORES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
              <Power className="text-blue-700" size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Stores</p>
              <p className="text-3xl font-semibold text-gray-900">
                {stores.filter((s) => s.isActive).length}
              </p>
            </div>
          </div>
        </div>

        {/** AVG RADIUS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200">
              <Navigation className="text-yellow-700" size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Radius</p>
              <p className="text-3xl font-semibold text-gray-900">
                {stores.length > 0
                  ? Math.round(
                      stores.reduce(
                        (sum, s) => sum + s.deliverySettings.radiusKm,
                        0
                      ) / stores.length
                    )
                  : 0}
                km
              </p>
            </div>
          </div>
        </div>

        {/** AVG DELIVERY FEE */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200">
              <DollarSign className="text-purple-700" size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Del. Fee</p>
              <p className="text-3xl font-semibold text-gray-900">
                €
                {stores.length > 0
                  ? (
                      stores.reduce(
                        (sum, s) => sum + s.deliverySettings.deliveryFee,
                        0
                      ) / stores.length
                    ).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stores List */}
      {stores.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Store size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Stores Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first store location
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#491648] text-white px-6 py-2 rounded-lg hover:bg-[#5a1d59] transition-colors"
          >
            Add Your First Store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div
              key={store._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* Store Header */}
              <div className="bg-gradient-to-r from-[#491648] to-[#5a1d59] p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{store.name}</h3>
                    <p className="text-sm opacity-90">{store.storeId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStoreStatus(store._id)}
                      className={`p-2 rounded-lg ${
                        store.isActive
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      }`}
                      title={store.isActive ? "Active" : "Inactive"}
                    >
                      <Power size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedStore(store)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                      title="Edit Store"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Store Details */}
              <div className="p-4 space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#491648] mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600 text-sm">
                      {store.address.fullAddress}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      [{store.location.coordinates[0]},{" "}
                      {store.location.coordinates[1]}]
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-start gap-3">
                  <Phone className="text-[#491648] mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">Contact</p>
                    <p className="text-gray-600 text-sm">
                      {store.contact.phone}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {store.contact.email}
                    </p>
                  </div>
                </div>

                {/* Delivery Settings */}
                <div className="flex items-start gap-3">
                  <Navigation className="text-[#491648] mt-1" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Delivery Settings
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Radius</p>
                        <p className="font-semibold text-[#491648]">
                          {store.deliverySettings.radiusKm}km
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Fee</p>
                        <p className="font-semibold text-[#491648]">
                          €{store.deliverySettings.deliveryFee}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Min. Order</p>
                        <p className="font-semibold text-[#491648]">
                          €{store.deliverySettings.minimumOrderAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-3">
                  <Clock className="text-[#491648] mt-1" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">
                      Operating Hours
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      {[
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                      ].map((day) => {
                        const hours = store.operatingHours[day];
                        return (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {day.slice(0, 3)}:
                            </span>
                            <span
                              className={
                                hours.isOpen ? "text-gray-900" : "text-gray-400"
                              }
                            >
                              {hours.isOpen
                                ? `${formatTime(hours.open)} - ${formatTime(
                                    hours.close
                                  )}`
                                : "Closed"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Coverage Area */}
                {store.coverageArea.cities.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-1">
                      Coverage Cities
                    </p>
                    <p className="text-sm text-gray-700">
                      {store.coverageArea.cities.join(", ")}
                    </p>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      store.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {store.isActive ? "🟢 Active" : "⚪ Inactive"}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{store.stats.totalOrders} orders</span>
                    {/* <span>{store.stats.rating || "N/A"}</span> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Store Modal */}
      {(showAddModal || selectedStore) && (
        <StoreFormModal
          store={selectedStore}
          onClose={() => {
            setShowAddModal(false);
            setSelectedStore(null);
          }}
          onSuccess={() => {
            fetchStores();
            setShowAddModal(false);
            setSelectedStore(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminStores;
