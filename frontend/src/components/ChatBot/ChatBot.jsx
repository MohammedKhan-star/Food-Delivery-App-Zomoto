import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ChatBot.css";
import { StoreContext } from "../../../context/StoreContext";

const ChatBot = () => {
  const { url, token } = useContext(StoreContext);
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! Start typing to see food suggestions."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const chatEndRef = useRef(null);

  /* 🔽 Auto scroll */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, suggestions]);

  /* 🔥 LIVE SUGGESTIONS */
  const handleTyping = async (text) => {
    setInput(text);

    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.post(
        `${url}/api/cart/chat`,
        { mode: "suggest", message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuggestions(res.data.items || []);
    } catch {
      setSuggestions([]);
    }
  };

  /* 📨 SEND MESSAGE */
  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setSuggestions([]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${url}/api/cart/chat`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.reply }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Something went wrong. Try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* 🧾 PRODUCT CLICK */
  const handleProductClick = async (item) => {
    setSuggestions([]);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: item.name }
    ]);

    try {
      const res = await axios.post(
        `${url}/api/cart/chat`,
        { mode: "detail", productId: item._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const p = res.data.product;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: ` ${p.name}\n ₹${p.price}\n Category: ${p.category}`
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Unable to load item." }
      ]);
    }
  };

  return (
    <div className={`chat-container ${open ? "open" : "closed"}`}>
      <div className="chat-header" onClick={() => setOpen(!open)}>SmartMenu AI Chat Window</div>

      <div className="chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.text}
          </div>
        ))}

        {/* 🔥 Animated Suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestion-box">
            {suggestions.map((item) => (
              <div
                key={item._id}
                className="suggestion-card"
                onClick={() => handleProductClick(item)}
              >
              <img
              src={`${url}/images/${item.image}`}
              alt={item.name}
              className="food-img"
            />

            <div className="food-info">
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
              </div>
            ))}
          </div>
        )}
        


        {loading && <div className="chat-msg assistant">Typing...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* 📞 WhatsApp */}
      <div className="call-support">
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mohammedkhan20019@gmail.com" target="_blank">
            Email: mohammedkhan20019@gmail.com
          </a>

      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Search food..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
