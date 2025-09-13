import React, { useEffect, useState } from "react";
import {
  FaBolt,
  FaTachometerAlt,
  FaCloud,
  FaChartBar,
  FaBatteryHalf,
  FaBalanceScale,
  FaWallet,
  FaShieldAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";
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

  // Safely render stats
  const renderValue = (value, unit = "") => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    return `${value} ${unit}`;
  };

  // Fetch stats and billing from backend
  const fetchStats = async () => {
    try {
      setLoading(true);
      const statsRes = await fetch("https://smart-server-i0ah.onrender.com/api/stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      const billingRes = await fetch("https://smart-server-i0ah.onrender.com/api/billing/latest")
      const billingData = await billingRes.json();
      setLatestBilling(billingData);

      if (statsData.energy && billingData?.units) {
        setUnitCountdown(Math.max(billingData.units - statsData.energy, 0));
      }

      // Optionally push energy to Firebase for chart
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

  // Initial fetch & polling every 5s for stats/billing
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 300); 
    return () => clearInterval(interval);
  }, []);

  // Listen to real-time chart updates from Firebase
  useEffect(() => {
    const energyRef = ref(db, "hardwareData/chart/energy");
    const unsubscribe = onValue(energyRef, (snapshot) => {
      const data = snapshot.val() || {};
      const arrayData = Object.entries(data).map(([key, val]) => ({
        time: new Date(val.timestamp).toLocaleTimeString(),
        energy: val.value,
      }));
      arrayData.sort((a, b) => new Date(a.time) - new Date(b.time));
      setChartData(arrayData.slice(-50));
    });

    return () => unsubscribe();
  }, []);

  // Live unit countdown simulation
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
        <div className="stats-card">
          <div className="icon"><FaBolt /></div>
          <div className="info"><h4>Voltage</h4><p>{renderValue(stats?.voltage, "V")}</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaTachometerAlt /></div>
          <div className="info"><h4>Current</h4><p>{renderValue(stats?.current || stats?.ct_current, "A")}</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaChartBar /></div>
          <div className="info"><h4>Power</h4><p>{renderValue(stats?.power, "W")}</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaCloud /></div>
          <div className="info"><h4>Frequency</h4><p>{renderValue(stats?.frequency, "Hz")}</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaBatteryHalf /></div>
          <div className="info"><h4>Energy</h4><p>{renderValue(stats?.energy, "kWh")}</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaBalanceScale /></div>
          <div className="info"><h4>Power Factor</h4><p>{renderValue(stats?.power_factor)}</p></div>
        </div>
        <div className="stats-card">
          <div className="icon">{stats?.tamper_detected ? <FaExclamationTriangle color="red"/> : <FaShieldAlt color="green"/>}</div>
          <div className="info"><h4>Tamper</h4><p>{stats?.tamper_detected ? "Detected" : "Safe"}</p></div>
        </div>
        <div className="stats-card">
          <div className="icon">{stats?.theft_detected ? <FaExclamationTriangle color="red"/> : <FaShieldAlt color="green"/>}</div>
          <div className="info"><h4>Theft</h4><p>{stats?.theft_detected ? "Detected" : "Safe"}</p></div>
        </div>
      </div>

      {/* Energy Chart */}
      <div className="chart-container">
        <h3>Energy Consumption (kWh vs Time)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Line type="monotone" dataKey="energy" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
        <ChatBot />
      </div>
    </div>
  );
}

export default Dashboard;
