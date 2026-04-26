import { useState, useRef, useEffect } from "react";

export default function ChatUI() {
  const [userId, setUserId] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI assistant. How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://chatbot-ai-backend-t7xb.onrender.com/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            userId,
            token: "",
          }),
        },
      );

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not reach server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!userId) {
    return (
      <div className="chat-container">
        <div className="chat-header">🤖 AI Chatbot</div>
        <div className="userid-screen">
          <p>Apna User ID enter karein</p>
          <input
            type="text"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && userIdInput.trim() && setUserId(userIdInput.trim())}
            placeholder="Enter User ID..."
          />
          <button onClick={() => userIdInput.trim() && setUserId(userIdInput.trim())}>
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">🤖 AI Chatbot <span className="userid-badge">ID: {userId}</span></div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <span>{msg.content}</span>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <span className="typing">● ● ●</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
