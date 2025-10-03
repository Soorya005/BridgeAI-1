import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, clearChat } from "../api";
import Message from "./Message";

export default function ChatBox() {
  const [sessionId] = useState(uuidv4());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to dark like Claude
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    const requestedOnline = isOnline;
    setInput("");
    setIsGenerating(true);

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    // Add an empty assistant message that will be filled with streaming content
    const assistantMessageIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", text: "", source: requestedOnline ? "online" : "offline" }]);

    // Buffer for smoother updates (especially for offline mode)
    let updateBuffer = "";
    let lastUpdateTime = Date.now();
    const updateInterval = 50; // Update UI every 50ms for smoother rendering

    const flushBuffer = () => {
      if (updateBuffer) {
        const bufferContent = updateBuffer;
        updateBuffer = "";
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantMessageIndex] = {
            role: "assistant",
            text: updated[assistantMessageIndex].text + bufferContent,
            source: updated[assistantMessageIndex].source,
          };
          return updated;
        });
      }
    };

    try {
      await sendMessage(
        sessionId, 
        currentInput, 
        requestedOnline, 
        (chunk) => {
          // Buffer chunks and update periodically for smoother rendering
          updateBuffer += chunk;
          const now = Date.now();
          
          if (now - lastUpdateTime >= updateInterval) {
            flushBuffer();
            lastUpdateTime = now;
          }
        },
        () => {
          // Fallback callback - flush buffer and update source to offline
          flushBuffer();
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantMessageIndex] = {
              ...updated[assistantMessageIndex],
              source: "offline",
              fallback: true,
            };
            return updated;
          });
        },
        controller.signal
      );
      
      // Flush any remaining buffered content
      flushBuffer();
    } catch (err) {
      // Check if it was aborted
      if (err.name === 'AbortError') {
        // Update the message to show it was stopped
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantMessageIndex] = {
            role: "assistant",
            text: updated[assistantMessageIndex].text + "\n\n[Response stopped by user]",
            source: updated[assistantMessageIndex].source,
          };
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantMessageIndex] = {
            role: "assistant",
            text: "Error: Could not reach server.",
            source: requestedOnline ? "online" : "offline",
          };
          return updated;
        });
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
    }
    setIsGenerating(false);
    setAbortController(null);
  };

  const handleClear = async () => {
    await clearChat(sessionId);
    setMessages([]);
  };

  return (
    <div className={`flex h-screen ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Unified Sidebar - Seamlessly transitions between collapsed and expanded */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out ${
        isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      } border-r flex flex-col overflow-hidden`}>
        
        {/* Top Section - New Chat */}
        <div className="p-3">
          <button
            onClick={handleClear}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4 py-3 justify-start' : 'justify-center p-3'} ${
              isDarkTheme 
                ? 'bg-gray-700 border-gray-600 hover:border-gray-500 text-gray-200 hover:text-white hover:bg-gray-600' 
                : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
            } border rounded-lg transition-all text-sm font-medium`}
            title={!sidebarOpen ? "New chat" : ""}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {sidebarOpen && <span className="whitespace-nowrap">New chat</span>}
          </button>
        </div>

        {/* Middle Section - Navigation items (Chats, Projects, etc.) */}
        {sidebarOpen && (
          <div className="flex-1 px-3">
            <div className={`text-xs font-semibold ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-2 px-2`}>
              Chats
            </div>
            <div className={`text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'} px-2`}>
              No previous chats
            </div>
          </div>
        )}
        
        {!sidebarOpen && <div className="flex-1"></div>}

        {/* Bottom Section - Mode and Theme toggles */}
        <div className={`${sidebarOpen ? 'p-3 space-y-3' : 'p-2 space-y-2'}`}>
          {/* Mode Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3 py-2 justify-between' : 'justify-center p-3'} rounded-lg transition-all ${
              isOnline 
                ? isDarkTheme
                  ? "bg-green-900 text-green-200 border border-green-700 hover:bg-green-800" 
                  : "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200"
                : isDarkTheme
                  ? "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            }`}
            title={!sidebarOpen ? (isOnline ? "Online Mode" : "Offline Mode") : ""}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg flex-shrink-0">{isOnline ? "🌐" : "📱"}</span>
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {isOnline ? "Online" : "Offline"}
                </span>
              )}
            </span>
            {sidebarOpen && (
              <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap`}>
                {isOnline ? "Cerebras" : "Local"}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3 py-2 justify-between' : 'justify-center p-3'} rounded-lg transition-all ${
              isDarkTheme
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
            title={!sidebarOpen ? (isDarkTheme ? "Dark Theme" : "Light Theme") : ""}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg flex-shrink-0">{isDarkTheme ? "🌙" : "☀️"}</span>
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {isDarkTheme ? "Dark" : "Light"}
                </span>
              )}
            </span>
            {sidebarOpen && (
              <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap`}>
                Theme
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkTheme ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 ${
                isDarkTheme ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              } rounded-md transition-all duration-300`}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              BridgeAI
            </h1>
          </div>
          
          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all ${
            isDarkTheme 
              ? isOnline 
                ? 'bg-green-900/30 border border-green-700/50' 
                : 'bg-gray-700/50 border border-gray-600/50'
              : isOnline
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-100 border border-gray-200'
          }`}>
            <span className={`relative flex h-2.5 w-2.5`}>
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isOnline ? 'bg-green-500' : isDarkTheme ? 'bg-gray-400' : 'bg-gray-500'
              }`}></span>
            </span>
            <span className={`text-sm font-medium ${
              isDarkTheme 
                ? isOnline ? 'text-green-300' : 'text-gray-400'
                : isOnline ? 'text-green-700' : 'text-gray-600'
            }`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl font-bold">🌉</span>
              </div>
              <h2 className={`text-2xl font-semibold mb-3 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Good evening, User</h2>
              <p className={`max-w-md ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                How can I help you today?
              </p>
              

              {/* Quick action buttons
              <div className="flex flex-wrap gap-3 mt-8">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                  <span>✍️</span>
                  Writes
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                  <span>📚</span>
                  Learn
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                  <span>�</span>
                  Code
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                  <span>🎯</span>
                  Analyze
                </button>
              </div> */}
            
            
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-8">
              {messages.map((msg, idx) => (
                <Message key={idx} role={msg.role} text={msg.text} source={msg.source} fallback={msg.fallback} isDarkTheme={isDarkTheme} />
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className={`border-t p-4 ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (isGenerating) {
                        handleStop();
                      } else {
                        handleSend();
                      }
                    }
                  }}
                  className={`w-full resize-none border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={isGenerating ? "Press Enter to stop..." : "How can I help you today?"}
                  rows="1"
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                />
                
                {/* Send/Stop button */}
                <button
                  onClick={isGenerating ? handleStop : handleSend}
                  disabled={!input.trim() && !isGenerating}
                  className={`absolute right-3 bottom-3 p-2 rounded-md transition-all ${
                    isGenerating
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : input.trim()
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : isDarkTheme
                      ? "bg-gray-600 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isGenerating ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="8" width="12" height="12" rx="1"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className={`flex items-center justify-center mt-2 text-xs ${
              isDarkTheme ? 'text-gray-500' : 'text-gray-500'
            }`}>
              BridgeAI can make mistakes. Please double-check important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
