import React, { useState, useEffect } from "react";
import HomeSlider from "../components/Home/HomeSlider";
import FoodList from "../components/Home/FoodList";
import { Truck, ClockPlus, Handbag, MapPin, Phone } from "lucide-react";
import api from "../utils/api";

const Home = () => {
  const [storeData, setStoreData] = useState(null);
  const [mapUrl, setMapUrl] = useState("");

  // Fetch store details
  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const response = await api.get("/stores?active=true");
        if (response.data.success && response.data.data?.length > 0) {
          const store = response.data.data[0];
          setStoreData(store);

          // Construct Google Maps embed URL from store address
          const address =
            store.address?.fullAddress ||
            `${store.address?.street || ""}, ${store.address?.city || ""}, ${
              store.address?.postalCode || ""
            }, ${store.address?.country || ""}`;

          // Encode address for URL
          const encodedAddress = encodeURIComponent(address);

          // Get coordinates if available
          const [lng, lat] = store.location?.coordinates || [
            4.270696, 52.101439,
          ];

          // Build Google Maps embed URL using place query format
          const mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2450.807220580942!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodedAddress}!5e0!3m2!1sen!2sbd!4v${Date.now()}!5m2!1sen!2sbd`;

          setMapUrl(mapEmbedUrl);
        }
      } catch (error) {
        console.error("Error fetching store details:", error);
        // Fallback to default location
        setMapUrl(
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2450.807220580942!2d4.2706967127671716!3d52.101439971837436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b0bd6e75a3e7%3A0xc6af5d9379bcead2!2sZeesluisweg%2018%2C%202583%20DR%20Den%20Haag%2C%20Netherlands!5e0!3m2!1sen!2sbd!4v1738283117384!5m2!1sen!2sbd"
        );
      }
    };

    fetchStoreDetails();
  }, []);

  return (
    <>
      {/* HERO SLIDER */}
      <HomeSlider />

      {/* Service Cards */}
      <div className="slider-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto max-w-7xl px-4 my-16">
          {/* Home Delivery */}
          <div className="flex flex-col md:flex-row items-center gap-6 bg-linear-to-r from-purple-100 via-purple-50 to-purple-100 py-6 px-8 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <Truck size={80} color="#5A1E5A" />
            <div className="flex flex-col justify-center md:p-4">
              <h5 className="text-[22px] font-bold text-gray-900 mb-2">
                Home Delivery
              </h5>
              <p className="text-gray-700 text-[15px]">
                Order online to get the food at your doorstep
              </p>
            </div>
          </div>

          {/* Dine-in */}
          <div className="flex flex-col md:flex-row items-center gap-6 bg-linear-to-r from-[#5A1E5A] via-[#702870] to-[#480A4C] py-6 px-8 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <ClockPlus size={70} color="#fff" />
            <div className="flex flex-col justify-center md:p-4">
              <h5 className="text-[22px] text-white font-bold mb-2">Dine-in</h5>
              <p className="text-gray-200 text-[15px]">
                Everything you order will be served hot & fresh
              </p>
            </div>
          </div>

          {/* Take Away */}
          <div className="flex flex-col md:flex-row items-center gap-6 bg-linear-to-r from-gray-800 via-gray-900 to-black py-6 px-8 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <Handbag size={80} color="#fff" />
            <div className="flex flex-col justify-center md:p-4">
              <h5 className="text-[22px] font-bold text-white mb-2">
                Take Away
              </h5>
              <p className="text-gray-300 text-[15px]">
                Take away your favorite dishes when you are on the move
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Section */}
      <div id="order-section" className="pt-16 md:pt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-[24px] md:text-4xl font-bold text-gray-900">
              Discover Our Categories
            </h2>
          </div>
          <FoodList />
        </div>
      </div>

      {/* Halal Section */}
      <div className="pt-16 md:pt-12">
        <div className="max-w-full mx-auto">
          <section className="mt-6 md:mt-12">
            <div
              className="relative bg-cover bg-center py-24 md:py-48"
              style={{
                backgroundImage: `url('https://btthemesele.wpengine.com/kudil-elementor/wp-content/uploads/sites/5/2025/03/Menu-parallax-1.jpg')`,
              }}
            >
              <div className="absolute inset-0 bg-black/0 opacity-80"></div>

              <div className="relative z-10 container mx-auto text-center px-4">
                <h2 className="text-white text-4xl md:text-[32px] font-extrabold uppercase">
                  Prepared On Site With
                </h2>
                <h2 className="dancing-script text-[#f9f9f9] text-4xl md:text-[46px] font-bold">
                  Halal Ingredients
                </h2>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Store Details & Map Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {storeData && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-[20px] font-semibold text-gray-900 mb-2">
                    {storeData.name}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin size={18} className="text-[#4E1D4D]" />
                    {storeData.address?.fullAddress}
                  </p>
                  <p className="text-gray-600 flex gap-2 items-center mt-1">
                   <Phone size={18} color="#4E1D4D" /> {storeData.contact?.phone}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {storeData.isOpen ? (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="font-semibold">Open Now</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span className="font-semibold">Closed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="bg-[#faf5ef72] rounded-lg overflow-hidden flex items-end justify-center h-96 relative pb-4">
          {mapUrl ? (
            <iframe
              width="100%"
              height="100%"
              className="absolute inset-0"
              title="map"
              src={mapUrl}
              style={{ filter: "grayscale(0) contrast(1) opacity(0.9)" }}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
