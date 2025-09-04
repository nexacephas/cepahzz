import React, { useEffect, useState } from "react";
import {
  FaBolt,
  FaTachometerAlt,
  FaCloud,
  FaChartBar,
  FaBatteryHalf,
  FaPlug,
  FaBalanceScale,
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
import "./Dashboard.css";

function Dashboard() {
  const [data, setData] = useState([]);
  const [time, setTime] = useState(0);

  const [stats, setStats] = useState({
    voltage: 230,
    current: 5.2,
    power: 1.2,
    frequency: 50,
    energy: 15.3,
    load: 85,
    powerFactor: 0.98,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        const newTime = +(prev + 0.04).toFixed(2);
        const newEnergy = +(Math.sin(newTime * 2) * 5 + newTime * 2).toFixed(2);

        setData((prevData) => {
          const updated = [...prevData, { time: newTime, energy: newEnergy }];
          return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
        });

        setStats((prev) => ({
          voltage: +(230 + (Math.random() * 2 - 1)).toFixed(1),
          current: +(5.2 + (Math.random() * 0.2 - 0.1)).toFixed(2),
          power: +(1.2 + (Math.random() * 0.1 - 0.05)).toFixed(2),
          frequency: +(50 + (Math.random() * 0.2 - 0.1)).toFixed(2),
          energy: +(prev.energy + Math.random() * 0.05).toFixed(2),
          load: +(85 + (Math.random() * 2 - 1)).toFixed(1),
          powerFactor: +(0.98 + (Math.random() * 0.01 - 0.005)).toFixed(3),
        }));

        return newTime;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="icon"><FaBolt /></div>
          <div className="info"><h4>Voltage</h4><p>{stats.voltage} V</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaTachometerAlt /></div>
          <div className="info"><h4>Current</h4><p>{stats.current} A</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaChartBar /></div>
          <div className="info"><h4>Power</h4><p>{stats.power} kW</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaCloud /></div>
          <div className="info"><h4>Frequency</h4><p>{stats.frequency} Hz</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaBatteryHalf /></div>
          <div className="info"><h4>Energy</h4><p>{stats.energy} kWh</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaPlug /></div>
          <div className="info"><h4>Load</h4><p>{stats.load} %</p></div>
        </div>
        <div className="stats-card">
          <div className="icon"><FaBalanceScale /></div>
          <div className="info"><h4>Power Factor</h4><p>{stats.powerFactor}</p></div>
        </div>
      </div>

      {/* Energy/Time Chart */}
      <div className="chart-container">
        <h3>Energy Consumption (Energy vs Time)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: "Time (s)", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
