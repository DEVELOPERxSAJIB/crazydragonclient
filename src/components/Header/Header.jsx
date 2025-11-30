import React, { useEffect, useState } from "react";
import { ShoppingCart, Menu, X, ChevronDown, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOutUser } from "../../features/auth/authApiSlice";
import { openCart } from "../../features/cart/cartSlice";
import { getCart } from "../../features/cart/cartApiSlice";
import AlertMessage from "../../utils/AlertMessage";
import { setMessageEmpty } from "../../features/auth/authSlice";
import LogoMain from "../../assets/logo/crazy.png";
import NotificationBell from "../NotificationBell";
import { useLocation } from "../../context/LocationContext";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, message, error } = useSelector(
    (state) => state.auth
  );
  const { itemCount, items } = useSelector((state) => state.cart);
  const { selectedLocation, hasLocation, setShowLocationModal } = useLocation();

  // Calculate item count from items array as fallback
  const displayItemCount =
    itemCount ||
    items?.reduce((total, item) => total + (item.quantity || 0), 0) ||
    0;

  const [open, setOpen] = useState(false);

  // Dynamic nav items based on user role
  const getNavItems = () => {
    const items = [
      { name: "Home", to: "/" },
      { name: "Menu", to: "/products" },
      { name: "Orders", to: "/orders" },
    ];

    // Add Dashboard link for admin/super_admin at the beginning
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      items.splice(1, 0, { name: "Dashboard", to: "/admin/dashboard" });
    }

    return items;
  };

  const navItems = getNavItems();

  const handleCartClick = () => {
    dispatch(openCart());
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bgColor = "bg-stone-50";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getInitials = (fullName) => {
    if (!fullName) return "";
    const names = fullName.split(" ");
    let initials = names[0].charAt(0);
    if (names.length > 1) {
      initials += names[1].charAt(0);
    }
    return initials.toUpperCase();
  };

  const handleLogout = () => {
    dispatch(logOutUser());
    setOpen(false);
  };

  // Fetch cart when user is authenticated to ensure count is up to date
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getCart());
    }
  }, [isAuthenticated, user, dispatch]);

  // Refresh cart when location changes
  useEffect(() => {
    if (isAuthenticated && user && selectedLocation) {
      // Refetch cart to get updated itemCount after location change
      dispatch(getCart());
    }
  }, [selectedLocation, isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (message) {
      AlertMessage({ type: "success", msg: message });
      dispatch(setMessageEmpty());
      navigate("/signin");
    }

    if (error) {
      AlertMessage({ type: "error", msg: error });
      dispatch(setMessageEmpty());
    }
  }, [error, isAuthenticated, navigate, user, message, dispatch]);

  return (
    <>
      <header className={`${bgColor} shadow-md w-full sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 md:py-2">
            {/* Logo Section */}
            <Link to={"/"} className="h-12 md:h-20">
              <img src={LogoMain} alt="Brand Logo" className="w-full h-full" />
            </Link>

            {/* Location Button - Desktop */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden md:block lg:flex items-center gap-2 px-4 py-2 ml-4 bg-gradient-to-r from-[#4e1d4d16] to-white border-2 border-[#501053] hover:border-[#501053] rounded-xl transition-all duration-200 group"
            >
              <MapPin
                size={20}
                className="text-[#501053] group-hover:scale-110 transition-transform"
              />
              <div className="text-left">
                <p className="text-[10px] text-[#501053d6] font-medium uppercase">
                  Deliver to
                </p>
                {hasLocation() ? (
                  <p className="text-sm font-bold text-[#501053] truncate max-w-[150px]">
                    {selectedLocation?.address?.split(",")[0] ||
                      "Your Location"}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-[#501053]">
                    Select Location
                  </p>
                )}
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 justify-center space-x-8 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="text-[#480A4C] text-[16px] hover:text-[#D9017E] transition duration-150"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Action Icons and Button */}
            <div className="flex items-center space-x-4">
              {/* <button
                onClick={() => setShowLocationModal(true)}
                className="hidden md:block p-2 hover:bg-red-50 rounded-lg transition relative"
                title={
                  hasLocation() ? selectedLocation?.address : "Select Location"
                }
              >
                <MapPin
                  size={24}
                  className={hasLocation() ? "text-red-600" : "text-gray-400"}
                />
                {!hasLocation() && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button> */}

              {/* Notification Bell (only for authenticated users) */}
              {isAuthenticated && <NotificationBell />}

              {/* Cart Icon */}
              <div
                onClick={handleCartClick}
                className="relative p-2 cursor-pointer hover:text-red-600 transition"
              >
                <ShoppingCart size={24} className="text-gray-800" />
                {displayItemCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-600 rounded-full ring-2 ring-stone-50">
                    {displayItemCount}
                  </span>
                )}
              </div>

              {/* Sign In Button */}
              <div className="relative hidden md:block">
                {user ? (
                  <>
                    {/* Trigger */}
                    <button
                      onClick={() => setOpen(!open)}
                      className="flex justify-between items-center gap-1.5"
                    >
                      {user.avatar ? (
                        <div className="h-8 w-8 rounded-full overflow-hidden shadow-sm">
                          <img
                            className="h-full w-full object-cover"
                            src={user.avatar.url}
                            alt="Avatar"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 flex items-center justify-center rounded-full shadow-sm bg-[#D7A3FF] font-semibold text-[#480A4C] text-[14px]">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <h3 className="text-gray-900 text-[14px] cursor-pointer font-semibold flex items-center gap-0.5">
                        {user.name}{" "}
                        <ChevronDown
                          className={`${
                            open ? "rotate-180" : "rotate-360"
                          } transition-all duration-300`}
                          size={20}
                          color="#480A4C"
                        />
                      </h3>
                    </button>

                    {/* Dropdown */}
                    {open && (
                      <div className="absolute right-0 mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-44">
                        <ul className="p-2 text-sm font-medium">
                          {(user.role === "admin" ||
                            user.role === "super_admin") && (
                            <li>
                              <Link
                                to="/admin/dashboard"
                                onClick={() => setOpen(!open)}
                                className="inline-flex items-center w-full p-2 hover:bg-gray-100 hover:text-gray-900 rounded font-semibold text-[#480A4C]"
                              >
                                Dashboard
                              </Link>
                            </li>
                          )}
                          <li>
                            <Link
                              to="/profile"
                              onClick={() => setOpen(!open)}
                              className="inline-flex items-center w-full p-2 hover:bg-gray-100 hover:text-gray-900 rounded"
                            >
                              Profile
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/orders"
                              onClick={() => setOpen(!open)}
                              className="inline-flex items-center w-full p-2 hover:bg-gray-100 hover:text-gray-900 rounded"
                            >
                              Orders
                            </Link>
                          </li>
                          <li>
                            <button
                              onClick={() => handleLogout()}
                              className="inline-flex text-red-900 items-center w-full p-2 hover:bg-gray-100 hover:text-red-800 rounded cursor-pointer"
                            >
                              Sign out
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/signin"
                    className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-[#480A4C] hover:bg-[#6E3B72] transition duration-150"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 lg:hidden text-gray-800 hover:text-red-600 transition"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation"
              >
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 lg:hidden transform transition-transform duration-300 ease-in-out z-40 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isMobileMenuOpen ? "opacity-50" : "opacity-0 pointer-events-none"
            }`}
            onClick={toggleMobileMenu}
          ></div>

          {/* Menu Content */}
          <div
            className={`absolute right-0 top-0 h-full w-64 ${bgColor} shadow-2xl p-6 flex flex-col space-y-4`}
          >
            <div className="flex justify-end">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-800 hover:text-[#480A4C]"
              >
                <X size={28} />
              </button>
            </div>

            {/* Location Section in Mobile Menu */}
            <button
              onClick={() => {
                setShowLocationModal(true);
                toggleMobileMenu();
              }}
              className="w-full p-3 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-[#501053] hover:border-[#501053] rounded-xl transition-all duration-200 flex items-center gap-3"
            >
              <MapPin size={20} className="text-[#501053]" />
              <div className="text-left flex-1">
                <p className="text-[10px] text-[#501053d5] font-medium uppercase">
                  Deliver to
                </p>
                {hasLocation() ? (
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {selectedLocation?.address?.split(",")[0] ||
                      "Your Location"}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-[#501053]">
                    Select Location
                  </p>
                )}
              </div>
            </button>

            {/* Show Dashboard link for admin/super_admin at top */}
            {user && (user.role === "admin" || user.role === "super_admin") && (
              <Link
                to="/admin/dashboard"
                className="block text-lg font-bold text-[#480A4C] hover:text-[#6E3B72] border-b-2 border-[#480A4C] pb-2"
                onClick={toggleMobileMenu}
              >
                📊 Dashboard
              </Link>
            )}

            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="block text-lg font-medium text-gray-800 hover:text-red-600"
                onClick={toggleMobileMenu}
              >
                {item.name}
              </Link>
            ))}

            {user && (
              <Link
                className="block text-lg font-medium text-red-900 hover:text-red-500"
                onClick={() => {
                  toggleMobileMenu();
                  handleLogout();
                }}
              >
                Sign Out
              </Link>
            )}

            {user ? (
              <div className="block absolute bottom-6 w-full">
                {/* Trigger */}
                <Link
                  to="/profile"
                  onClick={() => {
                    setOpen(!open), toggleMobileMenu();
                  }}
                  className="flex items-center gap-1.5"
                >
                  {user.avatar ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden shadow-sm">
                      <img
                        className="h-full w-full object-cover"
                        src={user.avatar?.url}
                        alt="Avatar"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center rounded-full shadow-sm bg-[#D7A3FF] font-semibold text-[#480A4C] text-[14px]">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <h3 className="text-gray-900 text-[14px] cursor-pointer font-semibold flex items-center gap-0.5">
                    {user?.name}{" "}
                  </h3>
                </Link>
              </div>
            ) : (
              <Link
                to="/signin"
                onClick={toggleMobileMenu}
                className="w-full flex sm:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-[#480A4C] hover:bg-[#6E3B72] transition duration-150"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
