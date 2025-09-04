import React from "react";
import { FaBars } from "react-icons/fa";
import "./Navbar.css";

function Navbar({ toggleSidebar }) {
  return (
    <nav className="navbar">
      {/* Left: Hamburger + Title */}
      <div className="navbar-left">
        <button
          className="navbar-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FaBars />
        </button>
        <h1 className="navbar-title">Smart Grid Dashboard</h1>
      </div>
    </nav>
  );
}

export default Navbar;
