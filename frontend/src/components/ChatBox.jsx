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

    const currentInput = input;
    setInput("");

    // Add an empty assistant message that will be filled with streaming content
    const assistantMessageIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    try {
      await sendMessage(sessionId, currentInput, (chunk) => {
        // Update the assistant message with each chunk
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantMessageIndex] = {
            role: "assistant",
            text: updated[assistantMessageIndex].text + chunk,
          };
          return updated;
        });
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          role: "assistant",
          text: "Error: Could not reach server.",
        };
        return updated;
      });
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
