import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { AiOutlineHome } from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";
import { IoMdAddCircleOutline, IoMdListBox } from "react-icons/io";
import { ImProfile } from "react-icons/im";
import { IoAnalyticsSharp } from "react-icons/io5";
import { MdManageSearch } from "react-icons/md";
import { FaReceipt, FaTasks, FaUsers } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useAdmin from "../../hooks/useAdmin";
import toast from "react-hot-toast";

const SideBar = () => {
  const { logOut } = useAuth();
  const { isAdmin } = useAdmin();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed((s) => !s);

  const onLogout = async () => {
    await logOut();
    toast.success("আপনি সফলভাবে লগআউট করেছেন!");
    navigate("/");
  };

  const baseItem =
    "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-100 hover:text-green-800 transition";
  const activeItem = "bg-green-200 text-green-900";

  return (
    <aside
      className={`h-screen sticky top-0 border-r border-green-200 bg-white text-gray-800 transition-[width] duration-300 ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-3 border-b border-green-200 bg-gradient-to-r from-green-50 via-green-100 to-green-50 cursor-pointer"
        onClick={toggleSidebar}
      >
        {!isCollapsed && (
          <h1 className="noto-serif-bengali-normal text-xl text-green-800">
            পল্লী আহার
          </h1>
        )}
        <button
          className="rounded-lg px-2 py-1 hover:bg-green-100"
          aria-label="Toggle sidebar"
          title="Toggle"
        >
          {isCollapsed ? "➤" : "⟨"}
        </button>
      </div>

      {/* Links */}
      <nav className="flex flex-col gap-2 p-3">
        {isAdmin ? (
          <>
            {/* Admin section */}
            {!isCollapsed && (
              <div className="mt-1 mb-1 px-3 text-xs text-gray-500">
                অ্যাডমিন
              </div>
            )}

            <NavLink
              to="/dashboard/add-product"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : ""}`
              }
            >
              <IoMdAddCircleOutline size={20} />
              {!isCollapsed && (
                <span className="hind-siliguri-medium">
                  নতুন আইটেম যুক্ত করুন
                </span>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/manage-products"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : ""}`
              }
            >
              <MdManageSearch size={20} />
              {!isCollapsed && (
                <span className="hind-siliguri-medium">আইটেম ম্যানেজমেন্ট</span>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/manage-order"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : ""}`
              }
            >
              <FaTasks size={18} />
              {!isCollapsed && (
                <span className="hind-siliguri-medium">
                  অর্ডার ম্যানেজমেন্ট
                </span>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/manage-users"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : ""}`
              }
            >
              <FaUsers size={18} /> {/* 👈 use user-related icon */}
              {!isCollapsed && (
                <span className="hind-siliguri-medium">ইউজার ম্যানেজমেন্ট</span>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/admin-analytics"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : ""}`
              }
            >
              <IoAnalyticsSharp size={20} />
              {!isCollapsed && (
                <span className="hind-siliguri-medium">অ্যানালিটিক্স</span>
              )}
            </NavLink>
          </>
        ) : (
          <>
            {/* User section */}
            {!isCollapsed && (
              <div className="mt-1 mb-1 px-3 text-xs text-gray-500">
                আমার অ্যাকাউন্ট
              </div>
            )}

            <NavLink
              to="/dashboard/analytics"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : ""}`
              }
            >
              <IoAnalyticsSharp size={20} />
              {!isCollapsed && (
                <span className="hind-siliguri-medium">অ্যানালিটিক্স</span>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/registered-camps"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : ""}`
              }
            >
              <IoMdListBox size={20} />
              {!isCollapsed && (
                <span className="hind-siliguri-medium">আমার তালিকা</span>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/payment-history"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? activeItem : ""}`
              }
            >
              <FaReceipt size={18} />
              {!isCollapsed && (
                <span className="hind-siliguri-medium">পেমেন্ট হিস্ট্রি</span>
              )}
            </NavLink>
          </>
        )}

        {/* Common */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${baseItem} ${isActive ? activeItem : ""}`
          }
        >
          <ImProfile size={20} />
          {!isCollapsed && (
            <span className="hind-siliguri-medium">প্রোফাইল</span>
          )}
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseItem} ${isActive ? activeItem : ""}`
          }
        >
          <AiOutlineHome size={20} />
          {!isCollapsed && <span className="hind-siliguri-medium">হোম</span>}
        </NavLink>

        <button
          onClick={onLogout}
          className={`${baseItem} text-left`}
          title="Logout"
        >
          <BiLogOut size={20} />
          {!isCollapsed && <span className="hind-siliguri-medium">লগআউট</span>}
        </button>
      </nav>
    </aside>
  );
};

export default SideBar;
