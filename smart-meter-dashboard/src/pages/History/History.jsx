import React, { useState } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";
import jsPDF from "jspdf";  // ✅ Correct import
import "jspdf-autotable";
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
  // Mock consumption data
  const consumptionData = [
    { date: "2025-08-01", units: 25 },
    { date: "2025-08-05", units: 30 },
    { date: "2025-08-10", units: 45 },
    { date: "2025-08-15", units: 20 },
    { date: "2025-08-20", units: 50 },
    { date: "2025-08-25", units: 40 },
  ];

  // Mock billing history
  const [bills] = useState([
    {
      id: 1,
      date: "2025-08-01",
      units: 25,
      tariff: 60,
      amount: 1500,
      status: "Paid",
    },
    {
      id: 2,
      date: "2025-08-10",
      units: 45,
      tariff: 60,
      amount: 2700,
      status: "Paid",
    },
    {
      id: 3,
      date: "2025-08-20",
      units: 50,
      tariff: 60,
      amount: 3000,
      status: "Pending",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [chartFilter, setChartFilter] = useState("month");
  const [billingFilter, setBillingFilter] = useState("month");

  // Filter bills by search term
  const filteredBills = bills.filter(
    (bill) =>
      bill.date.includes(searchTerm) ||
      bill.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter data based on dropdown (mock filtering for now)
  const filterData = (data, filterType) => {
    switch (filterType) {
      case "day":
        return data.slice(-1); // latest day only
      case "week":
        return data.slice(-2); // last 2 records (mock weekly)
      case "month":
        return data; // all in this mock dataset
      case "year":
        return data; // would normally group by year
      default:
        return data;
    }
  };

  const chartData = filterData(consumptionData, chartFilter);
  const billingData = filterData(filteredBills, billingFilter);

  // Download receipt
  const downloadReceipt = (bill) => {
    const doc = new jsPDF();
    doc.text("Electricity Bill Receipt", 14, 15);
    doc.autoTable({
      startY: 25,
      head: [["Date", "Units", "Tariff", "Amount", "Status"]],
      body: [
        [
          bill.date,
          `${bill.units} kWh`,
          `₦${bill.tariff}`,
          `₦${bill.amount}`,
          bill.status,
        ],
      ],
    });
    doc.save(`receipt_${bill.id}.pdf`);
  };

  return (
    <div className="history-container">
      {/* Consumption Chart */}
      <div className="history-card chart-card">
        <div className="section-header">
          <h2>Consumption History</h2>
          <select
            value={chartFilter}
            onChange={(e) => setChartFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Line type="monotone" dataKey="units" stroke="#4f46e5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Billing History Table */}
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
            <select
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="filter-dropdown"
            >
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
            {billingData.length > 0 ? (
              billingData.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.date}</td>
                  <td>{bill.units}</td>
                  <td>{bill.tariff}</td>
                  <td>{bill.amount}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        bill.status === "Paid" ? "paid" : "pending"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td>
                    {bill.status === "Paid" ? (
                      <button
                        className="receipt-btn"
                        onClick={() => downloadReceipt(bill)}
                      >
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
