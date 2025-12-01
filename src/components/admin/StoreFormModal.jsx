import { useState, useEffect } from "react";
import { X, MapPin, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

const StoreFormModal = ({ store, onClose, onSuccess }) => {
  const isEdit = !!store;

  const [formData, setFormData] = useState({
    name: "",
    storeId: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
      country: "Netherlands",
    },
    location: {
      coordinates: ["", ""], // [lng, lat]
    },
    contact: {
      phone: "",
      email: "",
    },
    deliverySettings: {
      radiusKm: 15,
      deliveryFee: 2.5,
      minimumOrderAmount: 10,
      serviceFee: 0.5,
      taxRate: 0,
    },
    operatingHours: {
      monday: { open: "10:00", close: "22:00", isOpen: true },
      tuesday: { open: "10:00", close: "22:00", isOpen: true },
      wednesday: { open: "10:00", close: "22:00", isOpen: true },
      thursday: { open: "10:00", close: "22:00", isOpen: true },
      friday: { open: "10:00", close: "23:00", isOpen: true },
      saturday: { open: "11:00", close: "23:00", isOpen: true },
      sunday: { open: "12:00", close: "21:00", isOpen: true },
    },
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        storeId: store.storeId || "",
        address: {
          street: store.address?.street || "",
          city: store.address?.city || "",
          postalCode: store.address?.postalCode || "",
          country: store.address?.country || "Netherlands",
        },
        location: {
          coordinates: store.location?.coordinates || ["", ""],
        },
        contact: {
          phone: store.contact?.phone || "",
          email: store.contact?.email || "",
        },
        deliverySettings: {
          radiusKm: store.deliverySettings?.radiusKm || 15,
          deliveryFee: store.deliverySettings?.deliveryFee || 2.5,
          minimumOrderAmount: store.deliverySettings?.minimumOrderAmount || 10,
          serviceFee: store.deliverySettings?.serviceFee || 0.5,
          taxRate: store.deliverySettings?.taxRate || 0,
        },
        operatingHours: store.operatingHours || {
          monday: { open: "10:00", close: "22:00", isOpen: true },
          tuesday: { open: "10:00", close: "22:00", isOpen: true },
          wednesday: { open: "10:00", close: "22:00", isOpen: true },
          thursday: { open: "10:00", close: "22:00", isOpen: true },
          friday: { open: "10:00", close: "23:00", isOpen: true },
          saturday: { open: "11:00", close: "23:00", isOpen: true },
          sunday: { open: "12:00", close: "21:00", isOpen: true },
        },
        isActive: store.isActive ?? true,
      });
    }
  }, [store]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data
      const submitData = {
        ...formData,
        location: {
          type: "Point",
          coordinates: [
            parseFloat(formData.location.coordinates[0]),
            parseFloat(formData.location.coordinates[1]),
          ],
        },
        address: {
          ...formData.address,
          fullAddress: `${formData.address.street}, ${formData.address.postalCode} ${formData.address.city}, ${formData.address.country}`,
        },
      };

      let response;
      if (isEdit) {
        response = await api.put(`/stores/${store._id}`, submitData);
      } else {
        response = await api.post("/stores", submitData);
      }

      if (response.data.success) {
        toast.success(
          isEdit ? "Store updated successfully!" : "Store created successfully!"
        );
        onSuccess();
      } else {
        toast.error(response.data.message || "Failed to save store");
      }
    } catch (error) {
      console.error("Error saving store:", error);
      toast.error("Failed to save store");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    if (section === "root") {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else if (section === "coordinates") {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: [
            field === 0 ? value : prev.location.coordinates[0],
            field === 1 ? value : prev.location.coordinates[1],
          ],
        },
      }));
    } else if (section === "hours") {
      setFormData((prev) => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-lg max-w-4xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Store" : "Add New Store"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      handleChange("root", "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="Crazy Dragon Utrecht"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.storeId}
                    onChange={(e) =>
                      handleChange("root", "storeId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="utrecht-001"
                    disabled={isEdit}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin size={20} /> Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address.street}
                    onChange={(e) =>
                      handleChange("address", "street", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="Oudegracht 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address.city}
                    onChange={(e) =>
                      handleChange("address", "city", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="Utrecht"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address.postalCode}
                    onChange={(e) =>
                      handleChange("address", "postalCode", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="3511 AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) =>
                      handleChange("address", "country", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="Netherlands"
                  />
                </div>
              </div>
            </div>

            {/* Coordinates */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">GPS Coordinates *</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get coordinates from{" "}
                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Google Maps
                </a>{" "}
                (right-click location → copy coordinates)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude * (first number)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.location.coordinates[0]}
                    onChange={(e) =>
                      handleChange("coordinates", 0, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="5.1214"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude * (second number)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.location.coordinates[1]}
                    onChange={(e) =>
                      handleChange("coordinates", 1, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="52.0907"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contact.phone}
                    onChange={(e) =>
                      handleChange("contact", "phone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="+31 30 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contact.email}
                    onChange={(e) =>
                      handleChange("contact", "email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="utrecht@crazydragon.nl"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Settings */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Delivery Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Radius (km) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.deliverySettings.radiusKm}
                    onChange={(e) =>
                      handleChange(
                        "deliverySettings",
                        "radiusKm",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Fee (€) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.deliverySettings.deliveryFee}
                    onChange={(e) =>
                      handleChange(
                        "deliverySettings",
                        "deliveryFee",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order (€) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.deliverySettings.minimumOrderAmount}
                    onChange={(e) =>
                      handleChange(
                        "deliverySettings",
                        "minimumOrderAmount",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Fees & Taxes */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Fees & Taxes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Fee (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.deliverySettings.serviceFee}
                    onChange={(e) =>
                      handleChange(
                        "deliverySettings",
                        "serviceFee",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="0.50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Fixed service fee added to all orders
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={formData.deliverySettings.taxRate}
                    onChange={(e) =>
                      handleChange(
                        "deliverySettings",
                        "taxRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tax percentage applied to subtotal (e.g., 9 for 9% VAT)
                  </p>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Operating Hours</h3>
              <div className="space-y-3">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((day) => (
                  <div
                    key={day}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-3">
                      <span className="text-sm font-medium capitalize">
                        {day}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.operatingHours[day].isOpen}
                          onChange={(e) =>
                            handleChange("hours", day, {
                              ...formData.operatingHours[day],
                              isOpen: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-[#491648] rounded"
                        />
                        <span className="text-sm">Open</span>
                      </label>
                    </div>
                    {formData.operatingHours[day].isOpen && (
                      <>
                        <div className="col-span-3">
                          <input
                            type="time"
                            value={formData.operatingHours[day].open}
                            onChange={(e) =>
                              handleChange("hours", day, {
                                ...formData.operatingHours[day],
                                open: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                          />
                        </div>
                        <div className="col-span-1 text-center text-sm">to</div>
                        <div className="col-span-3">
                          <input
                            type="time"
                            value={formData.operatingHours[day].close}
                            onChange={(e) =>
                              handleChange("hours", day, {
                                ...formData.operatingHours[day],
                                close: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#491648] focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleChange("root", "isActive", e.target.checked)
                  }
                  className="w-5 h-5 text-[#491648] rounded"
                />
                <div>
                  <span className="font-medium">Store is Active</span>
                  <p className="text-sm text-gray-600">
                    Inactive stores won't appear in customer search
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-[#491648] text-white rounded-lg hover:bg-[#5a1d59] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {isEdit ? "Update Store" : "Create Store"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreFormModal;
