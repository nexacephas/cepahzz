import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaComments, FaTimes } from "react-icons/fa";
import "./ChatBot.css";

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Show typing indicator
    setIsTyping(true);

    try {
      // ✅ Updated to your Render backend URL
      const res = await axios.post("https://smart-server-i0ah.onrender.com/api/ai-chat", {
        message: input,
      });

      // Small delay for realism
      setTimeout(() => {
        setIsTyping(false);
        const botMessage = { sender: "bot", text: res.data.reply };
        setMessages((prev) => [...prev, botMessage]);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      const botMessage = { sender: "bot", text: "⚠️ Failed to get response." };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="chatbot-widget">
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <FaComments size={22} />
        </button>
      )}

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <span>💬 Support Chat</span>
            <FaTimes
              className="close-btn"
              onClick={() => setIsOpen(false)}
              size={18}
            />
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;
