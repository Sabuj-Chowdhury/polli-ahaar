import { Link, NavLink, useNavigate } from "react-router";
import {
  AiOutlineClose,
  AiOutlineMenu,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo.jpg";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const Navbar = ({ cartCount = 0 }) => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const onLogout = async () => {
    try {
      await logOut();
      toast.success("আপনি সফলভাবে লগআউট করেছেন!");
      navigate("/");
    } finally {
      setDropdownOpen(false);
      setMenuOpen(false);
    }
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  return (
    <header className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 text-gray-800 sticky top-0 z-50 shadow-md">
      {/* nav container */}
      <nav className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between gap-4">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src={logo}
              alt="লোগো"
              className="h-12 w-12 object-contain rounded-xl bg-white p-1"
            />
            <span className="noto-serif-bengali-normal text-2xl tracking-tight">
              পল্লী আহার
            </span>
          </Link>
        </div>

        {/* Center links (desktop) */}
        <div className="hidden md:flex items-center justify-center flex-1 gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hind-siliguri-medium text-base px-3 py-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? "bg-green-100 text-green-700 hind-siliguri-semibold"
                  : "hover:bg-green-50 hover:text-green-700"
              }`
            }
          >
            হোম
          </NavLink>

          <NavLink
            to="/all-products"
            className={({ isActive }) =>
              `hind-siliguri-medium text-base px-3 py-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? "bg-green-100 text-green-700 hind-siliguri-semibold"
                  : "hover:bg-green-50 hover:text-green-700"
              }`
            }
          >
            পণ্যসমূহ
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `hind-siliguri-medium text-base px-3 py-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? "bg-green-100 text-green-700 hind-siliguri-semibold"
                  : "hover:bg-green-50 hover:text-green-700"
              }`
            }
          >
            যোগাযোগ
          </NavLink>
        </div>

        {/* Right cluster (desktop): Cart + Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cart (icon) */}
          <Link
            to="/cart"
            className="relative inline-flex items-center rounded-xl border border-green-200 bg-white p-2 hover:bg-green-50 hover:text-green-700 transition"
            aria-label="কার্ট"
            title="কার্ট"
          >
            <AiOutlineShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 text-white text-xs px-1 hind-siliguri-regular">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 rounded-xl border border-green-200 bg-white px-2 py-1.5 hover:bg-green-50 hover:text-green-700 transition"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <img
                  src={user?.photoURL}
                  alt="ব্যবহারকারী"
                  className="h-9 w-9 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden lg:inline text-sm hind-siliguri-medium">
                  {user?.displayName?.split(" ")?.[0] || "প্রোফাইল"}
                </span>
                <span className="hidden lg:inline">▼</span>
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-green-200 bg-white text-gray-800 shadow-lg overflow-hidden"
                >
                  <div className="px-4 py-3 text-sm">
                    <p className="noto-serif-bengali-normal truncate">
                      {user?.displayName || "ব্যবহারকারী"}
                    </p>
                    <p className="hind-siliguri-regular text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="border-t border-green-200" />
                  <NavLink
                    to="/dashboard/profile"
                    className="block px-4 py-2 text-sm hover:bg-green-50 hind-siliguri-regular"
                    onClick={() => setDropdownOpen(false)}
                  >
                    প্রোফাইল
                  </NavLink>
                  {user.role === "user" && (
                    <NavLink
                      to="/dashboard/orders"
                      className="block px-4 py-2 text-sm hover:bg-green-50 hind-siliguri-regular"
                      onClick={() => setDropdownOpen(false)}
                    >
                      আমার অর্ডার
                    </NavLink>
                  )}
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-green-50 hind-siliguri-regular"
                  >
                    লগআউট
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="hind-siliguri-medium text-base px-3 py-2 rounded-xl border border-green-200 bg-white hover:bg-green-50 hover:text-green-700 transition"
            >
              লগইন
            </NavLink>
          )}
        </div>

        {/* Mobile: cart + avatar + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {/* Cart icon (mobile quick access) */}
          <Link
            to="/cart"
            className="relative inline-flex items-center rounded-xl border border-green-200 bg-white p-2 hover:bg-green-50 hover:text-green-700 transition"
            aria-label="কার্ট"
            title="কার্ট"
          >
            <AiOutlineShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 text-white text-[10px] px-1 hind-siliguri-regular">
                {cartCount}
              </span>
            )}
          </Link>

          {user && (
            <button
              onClick={() => {
                setDropdownOpen((p) => !p);
                setMenuOpen(false);
              }}
              className="relative inline-flex items-center gap-1"
              aria-label="ব্যবহারকারী মেনু"
            >
              <img
                src={user?.photoURL}
                alt="ব্যবহারকারী"
                className="h-9 w-9 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="sr-only">প্রোফাইল মেনু</span>
            </button>
          )}

          <button
            onClick={toggleMenu}
            className="focus:outline-none"
            aria-label="মেনু"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <AiOutlineClose size={26} className="cursor-pointer" />
            ) : (
              <AiOutlineMenu size={26} className="cursor-pointer" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown (profile) */}
      {dropdownOpen && user && (
        <div className="md:hidden border-t border-green-200 bg-white text-gray-800">
          <div className="px-4 py-3">
            <p className="noto-serif-bengali-normal">
              {user?.displayName || "ব্যবহারকারী"}
            </p>
            <p className="hind-siliguri-regular text-xs text-gray-500">
              {user?.email}
            </p>
          </div>
          <div className="border-t border-green-200" />
          <NavLink
            to="/dashboard/profile"
            className="block px-4 py-2 hover:bg-green-50 hind-siliguri-regular"
            onClick={() => {
              setDropdownOpen(false);
              setMenuOpen(false);
            }}
          >
            প্রোফাইল
          </NavLink>
          {user.role === "user" && (
            <NavLink
              to="/dashboard/orders"
              className="block px-4 py-2 hover:bg-green-50 hind-siliguri-regular"
              onClick={() => {
                setDropdownOpen(false);
                setMenuOpen(false);
              }}
            >
              আমার অর্ডার
            </NavLink>
          )}
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 hover:bg-green-50 hind-siliguri-regular"
          >
            লগআউট
          </button>
        </div>
      )}

      {/* ===== Mobile RIGHT-SIDE DRAWER ===== */}
      {/* Backdrop (fade + slight blur) */}
      <div
        className={`md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer (right, with smooth slide) */}
      <aside
        className={`md:hidden fixed right-0 top--70 z-[61] h-full w-1/2 max-w-xs bg-gradient-to-r from-green-50 via-green-100 to-green-50 text-gray-800  shadow-xl will-change-transform transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Optional small brand area (no close button inside) */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-green-200">
          <img
            src={logo}
            alt="লোগো"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="noto-serif-bengali-normal text-lg">পল্লী আহার</span>
        </div>

        {/* Drawer content with subtle fade/slide-in */}
        <div
          className={`flex flex-col items-stretch px-2 py-2 hind-siliguri-medium transition-all duration-300 ${
            menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <NavLink
            to="/"
            className="px-3 py-3 rounded-md hover:bg-green-100 hover:text-green-700 transition"
            onClick={() => setMenuOpen(false)}
          >
            হোম
          </NavLink>
          <NavLink
            to="/all-products"
            className="px-3 py-3 rounded-md hover:bg-green-100 hover:text-green-700 transition"
            onClick={() => setMenuOpen(false)}
          >
            পণ্যসমূহ
          </NavLink>
          <NavLink
            to="/contact"
            className="px-3 py-3 rounded-md hover:bg-green-100 hover:text-green-700 transition"
            onClick={() => setMenuOpen(false)}
          >
            যোগাযোগ
          </NavLink>

          {user && (
            <>
              <div className="my-2 mx-3 border-t border-green-200" />
              <NavLink
                to="/dashboard/profile"
                className="px-3 py-3 rounded-md hover:bg-green-100 hover:text-green-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                প্রোফাইল
              </NavLink>
              {user.role === "user" && (
                <NavLink
                  to="/dashboard/orders"
                  className="px-3 py-3 rounded-md hover:bg-green-100 hover:text-green-700 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  আমার অর্ডার
                </NavLink>
              )}
              <button
                onClick={() => {
                  onLogout();
                  setMenuOpen(false);
                }}
                className="text-left px-3 py-3 rounded-md hover:bg-green-100 hover:text-green-700 transition"
              >
                লগআউট
              </button>
            </>
          )}

          {!user && (
            <>
              <div className="my-2 mx-3 border-t border-green-200" />
              <NavLink
                to="/login"
                className="px-3 py-3 rounded-md hover:bg-green-100 hover:text-green-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                লগইন
              </NavLink>
            </>
          )}
        </div>
      </aside>
    </header>
  );
};

export default Navbar;
