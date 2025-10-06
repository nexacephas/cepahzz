/* import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode", !darkMode);
  };

  return (
    <div className={`dashboard-layout ${darkMode ? "dark" : ""}`}>
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        className={sidebarVisible ? "show" : ""}
      />

      <div className="dashboard-main">
        <Navbar
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
 */