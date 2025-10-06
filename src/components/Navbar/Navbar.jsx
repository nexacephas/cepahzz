import React from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

function Navbar({ toggleSidebar }) {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const userData = storedUser?.user || storedUser || {};

  const user = {
    meterId: "MT-001", // 🔥 Hardcoded meter ID
    email: userData.email || "user@example.com",
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="navbar-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FaBars />
        </button>
        <h1 className="navbar-title">Smart Meter Dashboard</h1>
      </div>

      {user && (
        <div className="navbar-right">
          <span className="meter-id">Meter ID: {user.meterId}</span>
          <div className="user-info">
            <FaUserCircle className="user-avatar" />
            <span className="user-email">{user.email}</span>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
