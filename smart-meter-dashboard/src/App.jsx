import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import Auth from "./pages/Auth/Auth";
import Dashboard from "./components/Dashboard/Dashboard";
import Billing from "./pages/Billing/Billing";
import History from "./pages/History/History";
import Settings from "./pages/Settings/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

function Layout({ children, toggleSidebar, darkMode, toggleDarkMode, sidebarOpen }) {
  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Navbar
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        {children}
      </div>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768); // open by default on desktop

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Update sidebarOpen on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Accept optional boolean to explicitly open/close sidebar
  const toggleSidebar = (state) => {
    if (typeof state === "boolean") setSidebarOpen(state);
    else setSidebarOpen(prev => !prev);
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <Layout
              toggleSidebar={toggleSidebar}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              sidebarOpen={sidebarOpen}
            >
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/billing"
          element={
            <Layout
              toggleSidebar={toggleSidebar}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              sidebarOpen={sidebarOpen}
            >
              <Billing />
            </Layout>
          }
        />

        <Route
          path="/history"
          element={
            <Layout
              toggleSidebar={toggleSidebar}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              sidebarOpen={sidebarOpen}
            >
              <History />
            </Layout>
          }
        />

        <Route
          path="/settings"
          element={
            <Layout
              toggleSidebar={toggleSidebar}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              sidebarOpen={sidebarOpen}
            >
              <Settings />
            </Layout>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
