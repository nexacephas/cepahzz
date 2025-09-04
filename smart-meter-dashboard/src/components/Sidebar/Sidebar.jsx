import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="logo">{isOpen ? "SmartGrid" : "SG"}</h2>
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

      <div className="sidebar-footer">
        <Link
          to="/auth"
          className="sidebar-link"
          onClick={() => handleMenuClick("/auth")}
        >
          <span className="icon">
            <FaSignOutAlt />
          </span>
          {isOpen && <span className="label">Logout</span>}
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
