// src/components/History.jsx
import React, { useEffect, useState } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./History.css";

const History = () => {
  const [consumptionData, setConsumptionData] = useState([]);
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chartFilter, setChartFilter] = useState("month");
  const [billingChartFilter, setBillingChartFilter] = useState("month");
  const [billingFilter, setBillingFilter] = useState("month");
  const [loading, setLoading] = useState(true);

  // ✅ Use deployed backend base URL
const API_BASE = "https://smart-server-1-71nx.onrender.com";


  const fetchData = async () => {
    try {
      setLoading(true);
      const [consumptionRes, billingRes] = await Promise.all([
        axios.get(`${API_BASE}/api/chart?type=energy`),
        axios.get(`${API_BASE}/api/billing`),
      ]);

      const mappedConsumption = (consumptionRes.data || []).map((item) => {
        let time = item.timestamp;
        if (typeof time === "number") {
          if (time < 10000000000) time *= 1000;
          time = new Date(time);
        } else if (typeof time === "string") {
          time = new Date(time);
        } else if (time?.seconds) {
          time = new Date(time.seconds * 1000);
        } else {
          time = new Date();
        }
        return { time, energy: item.value };
      });
      setConsumptionData(mappedConsumption);

      const billingArray = billingRes.data
        ? Object.entries(billingRes.data).map(([id, bill]) => ({ id, ...bill }))
        : [];
      setBills(billingArray);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredBills = bills.filter(
    (bill) =>
      bill.date?.includes(searchTerm) ||
      bill.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filterChartData = (data, filterType, valueKey) => {
    const now = new Date();
    let filtered = data;

    switch (filterType) {
      case "day":
        filtered = data.filter((d) => now - new Date(d.time || d.date) <= 24 * 60 * 60 * 1000);
        break;
      case "week":
        filtered = data.filter((d) => now - new Date(d.time || d.date) <= 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        filtered = data.filter(
          (d) =>
            new Date(d.time || d.date).getMonth() === now.getMonth() &&
            new Date(d.time || d.date).getFullYear() === now.getFullYear()
        );
        break;
      case "year":
        filtered = data.filter((d) => new Date(d.time || d.date).getFullYear() === now.getFullYear());
        break;
      default:
        break;
    }

    return filtered.map((d) => ({
      time:
        filterType === "day"
          ? new Date(d.time || d.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : new Date(d.time || d.date).toLocaleDateString(),
      [valueKey]: d[valueKey] || 0,
    }));
  };

  const consumptionChartData = filterChartData(consumptionData, chartFilter, "energy");
  const billingChartData = filterChartData(bills, billingChartFilter, "units");

  const downloadReceipt = (bill) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Electricity Bill Receipt", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Date", "Units (kWh)", "Tariff (₦/kWh)", "Amount (₦)", "Status"]],
      body: [[bill.date || "-", bill.units || 0, bill.tariff || 0, bill.amount || 0, bill.status || "-"]],
      styles: { fontSize: 12 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`receipt_${bill.id || Date.now()}.pdf`);
  };

  return (
    <div className="history-container">
      {/* Energy Consumption Chart */}
      <div className="history-card chart-card">
        <div className="section-header">
          <h2>Energy Consumption</h2>
          <select value={chartFilter} onChange={(e) => setChartFilter(e.target.value)} className="filter-dropdown">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        {loading ? (
          <p>Loading chart...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={consumptionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="energy" stroke="#4f46e5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Billing Chart */}
      <div className="history-card chart-card">
        <div className="section-header">
          <h2>Billing Consumption</h2>
          <select
            value={billingChartFilter}
            onChange={(e) => setBillingChartFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        {loading ? (
          <p>Loading chart...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={billingChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: "Units (kWh)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="units" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Billing Table */}
      <div className="history-card table-card">
        <div className="table-header">
          <h2>Billing History</h2>
          <div className="table-actions">
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by date or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select value={billingFilter} onChange={(e) => setBillingFilter(e.target.value)} className="filter-dropdown">
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>

        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Units (kWh)</th>
              <th>Tariff (₦/kWh)</th>
              <th>Amount (₦)</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length > 0 ? (
              filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.date}</td>
                  <td>{bill.units}</td>
                  <td>{bill.tariff}</td>
                  <td>{bill.amount}</td>
                  <td>
                    <span className={`status-badge ${bill.status === "Paid" ? "paid" : "pending"}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>
                    {bill.status === "Paid" ? (
                      <button className="receipt-btn" onClick={() => downloadReceipt(bill)}>
                        <FaDownload /> Download
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
