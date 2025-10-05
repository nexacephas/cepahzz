import React, { useState, useEffect } from "react";
import "./Settings.css";

const Settings = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country: "",
    state: "",
    town: "",
    email: "",
    meterId: "",
  });

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      setFormData(JSON.parse(savedSettings));
    } else {
      // generate permanent meterId if none
      const randomId = "MTR-" + Math.floor(10000 + Math.random() * 90000);
      setFormData((prev) => ({ ...prev, meterId: randomId }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save to localStorage
    localStorage.setItem("userSettings", JSON.stringify(formData));

    // Send settings to backend
    try {
      const res = await fetch("http://localhost:5000/api/alert/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Profile updated successfully ✅");
      } else {
        alert("Failed to update profile on server.");
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Error connecting to server.");
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2>Account Settings</h2>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Town</label>
            <input
              type="text"
              name="town"
              value={formData.town}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Meter ID</label>
            <input type="text" name="meterId" value={formData.meterId} disabled />
          </div>

          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
