import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Store,
  Menu,
  X,
  FolderOpen,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaDragon } from "react-icons/fa";
import { useSelector } from "react-redux";
import { LogOut, User, Settings } from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: FolderOpen,
    },
    {
      name: "Foods",
      path: "/admin/products",
      icon: Package,
    },
    {
      name: "Stores",
      path: "/admin/stores",
      icon: Store,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Reviews",
      path: "/admin/reviews",
      icon: Star,
    },
  ];

  const isActive = (path) => location.pathname === path;

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const getInitials = (fullName) => {
    if (!fullName) return "";
    const names = fullName.split(" ");
    let initials = names[0].charAt(0);
    if (names.length > 1) {
      initials += names[1].charAt(0);
    }
    return initials.toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-[#491648] text-white p-3 rounded-full shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#491648] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  <FaDragon color="#fff" size={20} />
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Crazy Dragon
                </h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? "bg-[#491648] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 relative" ref={menuRef}>
            {/* Trigger */}
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center cursor-pointer"
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt="admin"
                  className="w-10 h-10 rounded-full object-cover mr-2"
                />
              ) : (
                <div
                  className="mr-2
      w-8 h-8 
      rounded-full 
      bg-gray-300 
      flex items-center justify-center 
      text-sm font-semibold text-gray-700
    "
                >
                  {getInitials(user?.name)}
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user?.name}</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
            </div>

            {/* Dropdown Menu */}
            {open && (
              <div className="absolute bottom-16 left-4 w-56 bg-white shadow-lg rounded-lg border border-gray-50 z-50 py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <Link
                  to={"/profile"}
                  className="w-full px-4 py-2 text-sm flex gap-2 items-center hover:bg-gray-100"
                >
                  <User size={16} /> Account
                </Link>

                <div className="border-t my-1 border-gray-100" />

                <button
                  className="w-full px-4 py-2 text-sm flex gap-2 items-center text-red-600 hover:bg-red-50"
                  onClick={() => console.log("Logout")}
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
