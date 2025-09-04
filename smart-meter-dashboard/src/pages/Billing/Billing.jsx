import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Billing.css";

function Billing() {
  const publicKey = "pk_test_b417dfecf191ef3e208ea705abd6e487eb845789"; // Paystack test key
  const [email] = useState("peteradebayo57@gmail.com");
  const [price, setPrice] = useState(0);
  const [units, setUnits] = useState(0);
  const [tariff] = useState(50); // ₦ per kWh
  const [receipt, setReceipt] = useState(null); // store last bill for download

  // Auto-calc units when price is entered
  const handlePriceChange = (e) => {
    const enteredPrice = parseInt(e.target.value) || 0;
    setPrice(enteredPrice);
    setUnits(enteredPrice / tariff);
  };

  // Trigger Paystack payment
  const payWithPaystack = () => {
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: price * 100, // convert to kobo
      currency: "NGN",
      callback: function (response) {
        alert("Payment Successful ✅ " + response.reference);
        const newBill = {
          id: Date.now(),
          date: new Date().toISOString().split("T")[0],
          units,
          tariff,
          amount: price,
          status: "Paid",
          reference: response.reference,
        };
        setReceipt(newBill);
        generateReceipt(newBill); // auto-generate immediately
        setPrice(0);
        setUnits(0);
      },
      onClose: function () {
        alert("Transaction closed ❌");
      },
    });
    handler.openIframe();
  };

  // Generate Receipt PDF
  const generateReceipt = (bill) => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      doc.setFontSize(18);
      doc.text("Smart Meter Billing Receipt", 40, 40);
      doc.setFontSize(12);
      doc.text(`Customer Email: ${email}`, 40, 64);
      doc.text(`Date: ${bill.date}`, 40, 80);
      if (bill.reference) doc.text(`Transaction Ref: ${bill.reference}`, 40, 96);

      autoTable(doc, {
        startY: 120,
        head: [["Units (kWh)", "Tariff (₦/kWh)", "Amount (₦)", "Status"]],
        body: [[bill.units.toFixed(2), bill.tariff, bill.amount, bill.status]],
      });

      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 24 : 160;
      doc.text("Thank you for your payment!", 40, finalY);
      doc.save(`receipt_${bill.id}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Could not generate receipt. Check console for details.");
    }
  };

  return (
    <div className="billing-page">
      {/* Billing Form */}
      <div className="billing-form">
        <h3>Purchase Electricity</h3>
        <div className="form-group">
          <label>Enter Amount (₦):</label>
          <input
            type="number"
            value={price}
            onChange={handlePriceChange}
            placeholder="Enter amount e.g. 5000"
          />
        </div>
        <div className="form-group">
          <label>Units (kWh):</label>
          <input type="text" value={units.toFixed(2)} readOnly />
        </div>
        <button
          className="pay-btn"
          onClick={payWithPaystack}
          disabled={price <= 0}
        >
          Pay ₦{price}
        </button>
      </div>

      {/* Receipt Section */}
      {receipt && (
        <div className="receipt-section">
          <h3>Last Transaction</h3>
          <p>
            Date: <strong>{receipt.date}</strong>
          </p>
          <p>
            Units: <strong>{receipt.units.toFixed(2)} kWh</strong>
          </p>
          <p>
            Amount: <strong>₦{receipt.amount}</strong>
          </p>
          <p>
            Status:{" "}
            <strong
              style={{
                color: receipt.status === "Paid" ? "green" : "red",
              }}
            >
              {receipt.status}
            </strong>
          </p>
          <button
            type="button"
            className="download-btn"
            onClick={() => generateReceipt(receipt)}
          >
            ⬇ Download Receipt
          </button>
        </div>
      )}
    </div>
  );
}

export default Billing;
