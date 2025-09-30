import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, clearChat } from "../api";
import Message from "./Message";

export default function ChatBox() {
  const [sessionId] = useState(uuidv4());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    try {
      const response = await sendMessage(sessionId, input);
      const assistantMessage = { role: "assistant", text: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error: Could not reach server." },
      ]);
    }
  };

  const handleClear = async () => {
    await clearChat(sessionId);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, idx) => (
          <Message key={idx} role={msg.role} text={msg.text} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded-lg p-2"
          placeholder="Ask something..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 rounded-lg"
        >
          Send
        </button>
        <button
          onClick={handleClear}
          className="bg-red-500 text-white px-4 rounded-lg"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
