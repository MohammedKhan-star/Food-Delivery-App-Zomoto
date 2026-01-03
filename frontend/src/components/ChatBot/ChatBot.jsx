import { useContext, useState } from "react";
import axios from "axios";
import "./ChatBot.css";
import { StoreContext } from "../../../context/StoreContext";

const ChatBot = () => {
  const { food_list, url, token } = useContext(StoreContext);

  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Hi! Try saying: Add 2 burgers 🍔" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // 🔍 Auto suggestions while typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = food_list.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 5));
  };

  // 🤖 Send message to AI
  const sendMessage = async (customMessage) => {
    const msg = customMessage || input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setSuggestions([]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${url}/api/cart/chat`,
        { message: msg }, // ✅ FIXED
        {
          headers: {
            Authorization: `Bearer ${token}` // ✅ FIXED
          }
        }
      );

      const reply =
        res.data.reply ||
        res.data.message ||
        "✅ Done! Your cart has been updated.";

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: reply }
      ]);

    } catch (err) {
      let errorMessage = "⚠️ Something went wrong. Try again.";

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "⚠️ Please login again to use AI ordering.";
        } 
        else if (err.response.status === 429) {
          errorMessage = "⚠️ AI limit reached. Please try again later.";
        } 
        else if (err.response.data?.reply) {
          errorMessage = err.response.data.reply;
        }
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: errorMessage }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🎤 Voice Input
  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      sendMessage(voiceText);
    };
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        🍕 AI Food Assistant
        <button className="mic-btn" onClick={startVoiceInput}>🎤</button>
      </div>

      <div className="chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-msg assistant">Typing...</div>}
      </div>

      {/* 🔍 Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map(item => (
            <div
              key={item._id}
              className="suggestion-item"
              onClick={() => sendMessage(`Add 1 ${item.name}`)}
            >
              {item.name} – ₹{item.price}
            </div>
          ))}
        </div>
      )}

      <div className="chat-input">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type or say: Add 2 pizzas"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={() => sendMessage()}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
