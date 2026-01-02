import { useState } from "react";
import axios from "axios";

const AIChat = ({ menu }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    setChat([...chat, { user: message }]);

    const res = await axios.post("/api/chat", {
      message,
      menu
    });

    setChat(prev => [...prev, { bot: res.data.reply }]);
    setMessage("");
  };

  return (
    <div className="chatbox">
      <h3>🤖 AI Food Assistant</h3>

      <div className="chat-area">
        {chat.map((c, i) => (
          <div key={i}>
            {c.user && <p><b>You:</b> {c.user}</p>}
            {c.bot && <p><b>Bot:</b> {c.bot}</p>}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type your food request..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default AIChat;
