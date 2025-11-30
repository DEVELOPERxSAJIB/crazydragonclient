import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../../features/auth/authApiSlice";
import { setMessageEmpty } from "../../features/auth/authSlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loader, message, error } = useSelector((state) => state.auth);

  // Initialize form with user data from localStorage/Redux
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.avatar?.url || null);

  // Handle success/error messages
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(setMessageEmpty());
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    }

    if (error) {
      toast.error(error);
      dispatch(setMessageEmpty());
    }
  }, [message, error, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append("name", formData.name);
    if (formData.phone) {
      submitData.append("phone", formData.phone);
    }
    if (photoFile) {
      submitData.append("photo", photoFile);
    }

    dispatch(updateUserProfile(submitData));
  };

  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const names = fullName.split(" ");
    let initials = names[0].charAt(0);
    if (names.length > 1) {
      initials += names[names.length - 1].charAt(0);
    }
    return initials.toUpperCase();
  };

  return (
    <div className="min-h-[calc(100vh-84px)] flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          Update Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-3">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              {photoPreview ? (
                <img
                  className="h-20 w-20 rounded-full object-cover shadow-md border-2 border-gray-200"
                  src={photoPreview}
                  alt="Profile Preview"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center rounded-full shadow-md bg-[#D7A3FF] font-semibold text-[#480A4C] text-2xl border-2 border-gray-200">
                  {getInitials(formData.name)}
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer inline-block bg-[#491648] hover:bg-[#6E3B72] text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-150">
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG or GIF (Max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label
              htmlFor="email"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              value={user?.email || ""}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full px-4 py-3 outline-0 border border-gray-300 rounded-xl focus:border-[#491648] focus:ring-1 focus:ring-[#491648] transition duration-150"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loader}
              className="flex-1 py-3 px-6 bg-[#491648] hover:bg-[#6E3B72] text-white font-semibold rounded-lg shadow-md transition duration-200 active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loader ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
