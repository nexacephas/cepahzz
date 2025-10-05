import React, { useEffect, useState } from "react";
import {
  FaBolt, FaTachometerAlt, FaCloud, FaChartBar,
  FaBatteryHalf, FaBalanceScale, FaWallet,
  FaShieldAlt, FaExclamationTriangle
} from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush
} from "recharts";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";   // ✅ Toastify import
import "react-toastify/dist/ReactToastify.css";           // ✅ Toastify styles
import "./Dashboard.css";
import ChatBot from "../ChatBot/ChatBot";

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://smart-meter-2025-c7b32-default-rtdb.firebaseio.com/",
  projectId: "smart-meter-2025-c7b32",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function Dashboard() {
  const RATE = 209.9; // ₦ per kWh

  const [stats, setStats] = useState({});
  const [latestBilling, setLatestBilling] = useState(null);
  const [unitCountdown, setUnitCountdown] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theftAlertSent, setTheftAlertSent] = useState(false);

  // Safely render stats
  const renderValue = (value, unit = "") => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    return `${value} ${unit}`;
  };

  // --- Theft Alerts (SMS + Telegram) ---
  useEffect(() => {
    const sendTheftAlertSMS = async (alertMessage) => {
      try {
        const res = await fetch("http://localhost:5000/api/alert/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: "+2348131495622", // ✅ Hardcoded number
            text: alertMessage,
          }),
        });

        const data = await res.json();
        if (data.success) {
          console.log("✅ Theft alert SMS sent");
          setTheftAlertSent(true);
          toast.success("🚨 Theft Alert SMS Sent!"); // ✅ Toastify instead of alert
        }
      } catch (err) {
        console.error("SMS error:", err);
        toast.error("❌ SMS Alert Failed!");
      }
    };

    const sendTheftAlertTelegram = async (alertMessage) => {
      try {
        const res = await fetch("http://localhost:5000/api/alert/send-telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meterId: stats?.meter_id || "Unknown",
            location: getUserLocation(),
            time: new Date().toLocaleString("en-GB", { hour12: false }),
            status: "Tampering Detected",
          }),
        });

        const data = await res.json();
        if (data.success) {
          console.log("✅ Telegram alert sent");
          toast.info("🚨 Theft Alert sent to Telegram!"); // ✅ Toastify instead of alert
        }
      } catch (err) {
        console.error("Telegram error:", err);
        toast.error("❌ Telegram Alert Failed!");
      }
    };

    if (stats?.theft_detected && !theftAlertSent) {
      const alertMessage = `
🚨 Theft Detection Alert!

📟 Meter ID: ${stats?.meter_id || "Unknown"}
📍 Location: ${getUserLocation()}
⏰ Time: ${new Date().toLocaleString("en-GB", { hour12: false })}
⚡ Status: Tampering Detected
      `;

      sendTheftAlertSMS(alertMessage);
      sendTheftAlertTelegram(alertMessage);
    }

    if (!stats?.theft_detected && theftAlertSent) {
      setTheftAlertSent(false);
    }
  }, [stats?.theft_detected, theftAlertSent]);

  // --- Helper: Get saved location from Settings ---
  const getUserLocation = () => {
    const profile = JSON.parse(localStorage.getItem("userSettings")) || {};
    if (profile.town && profile.state && profile.country) {
      return `${profile.town}, ${profile.state}, ${profile.country}`;
    }
    return "Unknown Location";
  };

  // Fetch stats and billing
  const fetchStats = async () => {
    try {
      setLoading(true);
      const statsRes = await fetch("https://smart-server-i0ah.onrender.com/api/stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      const billingRes = await fetch("https://smart-server-i0ah.onrender.com/api/billing/latest");
      const billingData = await billingRes.json();
      setLatestBilling(billingData);

      if (statsData.energy && billingData?.units) {
        setUnitCountdown(Math.max(billingData.units - statsData.energy, 0));
      }

      if (statsData.energy && !isNaN(statsData.energy)) {
        push(ref(db, "hardwareData/chart/energy"), {
          value: statsData.energy,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Polling
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // Listen to Firebase chart data
  useEffect(() => {
    const energyRef = ref(db, "hardwareData/chart/energy");
    const unsubscribe = onValue(energyRef, (snapshot) => {
      const data = snapshot.val() || {};
      const arrayData = Object.entries(data).map(([key, val]) => ({
        time: new Date(val.timestamp).toLocaleTimeString(),
        energy: val.value,
      }));
      arrayData.sort((a, b) => new Date(a.time) - new Date(b.time));
      setChartData(arrayData.slice(-100)); // ✅ show more data points
    });
    return () => unsubscribe();
  }, []);

  // Countdown simulation
  useEffect(() => {
    if (!latestBilling) return;
    const consumptionRate = 0.01; // kWh per second
    const interval = setInterval(() => {
      setUnitCountdown((prev) => (prev - consumptionRate > 0 ? prev - consumptionRate : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [latestBilling]);

  const unitsPurchased = latestBilling?.units || 0;
  const billingAmount = latestBilling?.amount || 0;

  return (
    <div className="dashboard-page">
      {/* Billing & Unit Cards */}
      <div className="billing-row">
        <div className="billing-card">
          <div className="icon"><FaWallet /></div>
          <div className="info">
            <h4>Billing Balance</h4>
            <p>Rate: <strong>{RATE} ₦/kWh</strong></p>
            <p>This Month: <strong>₦{billingAmount}</strong></p>
          </div>
        </div>
        <div className="billing-card">
          <div className="icon"><FaBatteryHalf /></div>
          <div className="info">
            <h4>Unit Status</h4>
            <p>Units Purchased: <strong>{unitsPurchased.toFixed(2)}</strong></p>
            <p>Remaining Units: <strong>{unitCountdown.toFixed(2)}</strong></p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stats-card"><div className="icon"><FaBolt /></div><div className="info"><h4>Voltage</h4><p>{renderValue(stats?.voltage, "V")}</p></div></div>
        <div className="stats-card"><div className="icon"><FaTachometerAlt /></div><div className="info"><h4>Current</h4><p>{renderValue(stats?.current || stats?.ct_current, "A")}</p></div></div>
        <div className="stats-card"><div className="icon"><FaChartBar /></div><div className="info"><h4>Power</h4><p>{renderValue(stats?.power, "W")}</p></div></div>
        <div className="stats-card"><div className="icon"><FaCloud /></div><div className="info"><h4>Frequency</h4><p>{renderValue(stats?.frequency, "Hz")}</p></div></div>
        <div className="stats-card"><div className="icon"><FaBatteryHalf /></div><div className="info"><h4>Energy</h4><p>{renderValue(stats?.energy, "kWh")}</p></div></div>
        <div className="stats-card"><div className="icon"><FaBalanceScale /></div><div className="info"><h4>Power Factor</h4><p>{renderValue(stats?.power_factor)}</p></div></div>
        <div className="stats-card"><div className="icon">{stats?.tamper_detected ? <FaExclamationTriangle color="red"/> : <FaShieldAlt color="green"/>}</div><div className="info"><h4>Tamper</h4><p>{stats?.tamper_detected ? "Detected" : "Safe"}</p></div></div>
        <div className="stats-card"><div className="icon">{stats?.theft_detected ? <FaExclamationTriangle color="red"/> : <FaShieldAlt color="green"/>}</div><div className="info"><h4>Theft</h4><p>{stats?.theft_detected ? "Detected" : "Safe"}</p></div></div>
      </div>

      {/* Energy Chart */}
      <div className="chart-container">
        <h3>Energy Consumption (kWh vs Time)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Line type="monotone" dataKey="energy" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Brush dataKey="time" height={30} stroke="#4f46e5" /> {/* ✅ Zoom/scroll */}
          </LineChart>
        </ResponsiveContainer>
        <ChatBot />
      </div>

      {/* Toastify container */}
      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
}

export default Dashboard;
