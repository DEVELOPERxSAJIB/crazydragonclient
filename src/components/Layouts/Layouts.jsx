import Header from "../Header/Header";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import CartSidebar from "../CartSidebar";
import LocationModal from "../Location/LocationModal";
import { useLocation } from "../../context/LocationContext";

const Layouts = () => {
  const { showLocationModal, setShowLocationModal } = useLocation();

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <CartSidebar />
      {showLocationModal && (
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          selectedMode={localStorage.getItem("deliveryMode") || "delivery"}
        />
      )}
    </>
  );
};

export default Layouts;
