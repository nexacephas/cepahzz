import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileInvoiceDollar,
  FaHistory,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(location.pathname);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const menuItems = [
    { id: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { id: "/billing", label: "Billing", icon: <FaFileInvoiceDollar /> },
    { id: "/history", label: "History", icon: <FaHistory /> },
    { id: "/settings", label: "Settings", icon: <FaCog /> },
  ];

  // Handle menu click (auto-close on mobile)
  const handleMenuClick = (id) => {
    setActiveItem(id);
    if (window.innerWidth <= 768) {
      toggleSidebar(false); // close sidebar
    }
  };

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth", { replace: true }); // redirect to login
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="logo">{isOpen ? "Smart meter" : "SG"}</h2>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={activeItem === item.id ? "active" : ""}
            onClick={() => handleMenuClick(item.id)}
          >
            <Link to={item.id} className="sidebar-link">
              <span className="icon">{item.icon}</span>
              {isOpen && <span className="label">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* ✅ Logout button */}
      <div className="sidebar-footer">
        <button className="sidebar-link logout-btn" onClick={handleLogout}>
          <span className="icon">
            <FaSignOutAlt />
          </span>
          {isOpen && <span className="label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
