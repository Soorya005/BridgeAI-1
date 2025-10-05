import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { sendMessage, clearChat } from "../api";
import Message from "./Message";
import SettingsModal from "./SettingsModal";
import NotificationProvider from "./NotificationProvider";
import NotificationTray from "./NotificationTray";
import EnhancementQueueTray from "./EnhancementQueueTray";
import { Settings, Bell, Sparkles, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

export default function ChatBox() {
  const navigate = useNavigate();
  const [sessionId] = useState(uuidv4());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationTrayOpen, setNotificationTrayOpen] = useState(false);
  const [queueTrayOpen, setQueueTrayOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [enhancementQueue, setEnhancementQueue] = useState(new Set());
  const [enhancingMessages, setEnhancingMessages] = useState(new Set());
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const previousOnlineStatus = useRef(isOnline);
  const userScrolledUp = useRef(false);
  const enhancementLockRef = useRef(new Set()); 

  const addNotification = (type, title, message, messageId = null) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    setNotifications(prev => [{
      id: Date.now(),
      type,
      title,
      message,
      messageId,
      time: timeString
    }, ...prev].slice(0, 20)); // Keep only 20 most recent
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const navigateToMessage = (messageId) => {
    const element = document.getElementById(messageId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Briefly highlight the message
      element.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 2000);
    }
  };

  useEffect(() => {
    // Only auto-scroll if user hasn't scrolled up
    if (!userScrolledUp.current && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Detect if user has scrolled up
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      userScrolledUp.current = !isNearBottom;
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-enhancement when going from offline to online
  useEffect(() => {
    const autoEnhance = localStorage.getItem('autoEnhance');
    const shouldAutoEnhance = autoEnhance !== null ? JSON.parse(autoEnhance) : true;
    
    // Check if we just went from offline to online
    if (!previousOnlineStatus.current && isOnline) {
      
      // CRITICAL FIX: Wait for any ongoing generation to complete before enhancing
      if (isGenerating) {
        console.log('Generation in progress, will enhance after completion');
        previousOnlineStatus.current = isOnline;
        return;
      }
      
      // CRITICAL FIX: Use setTimeout to avoid setState during render
      setTimeout(() => {
        // First, process any manually queued messages
        if (enhancementQueue.size > 0) {
          const queuedMessageIds = Array.from(enhancementQueue);
          console.log(`Going online with ${queuedMessageIds.length} manually queued messages, starting enhancement...`);
          enhanceQueuedMessages(queuedMessageIds);
        }
        
        // Then, if auto-enhance is enabled, queue additional messages
        if (shouldAutoEnhance) {
          const enhanceRecent = localStorage.getItem('enhanceRecent');
          const shouldEnhanceRecent = enhanceRecent !== null ? JSON.parse(enhanceRecent) : true;
          const maxMessages = parseInt(localStorage.getItem('maxMessagesToEnhance') || '5');
          
          // Find offline messages that aren't already enhanced, queued, or being enhanced
          const offlineMessages = messages
            .map((msg, idx) => ({ ...msg, index: idx, id: `msg-${idx}` }))
            .filter(msg => 
              msg.role === 'assistant' && 
              msg.source === 'offline' && 
              !msg.isEnhanced &&
              !enhancementQueue.has(`msg-${msg.index}`) &&
              !enhancingMessages.has(`msg-${msg.index}`) // CRITICAL FIX: Don't queue if already enhancing
            );
          
          if (offlineMessages.length > 0) {
            // Get messages to enhance based on settings
            const messagesToEnhance = shouldEnhanceRecent 
              ? offlineMessages.slice(-maxMessages)
              : offlineMessages;
            
            if (messagesToEnhance.length > 0) {
              // Add them to enhancement queue
              const newQueue = new Set(enhancementQueue);
              messagesToEnhance.forEach(msg => newQueue.add(msg.id));
              setEnhancementQueue(newQueue);
              
              // Only show notification in tray, not toast (to avoid duplicates)
              addNotification('info', 'Enhancement Queue', `Queued ${messagesToEnhance.length} message${messagesToEnhance.length > 1 ? 's' : ''} for enhancement`);
              
              // Start enhancing
              enhanceQueuedMessages(messagesToEnhance.map(m => m.id));
            }
          }
        }
      }, 0);
    }
    
    previousOnlineStatus.current = isOnline;
  }, [isOnline]); // CRITICAL FIX: Only depend on isOnline to prevent multiple triggers

  // CRITICAL FIX: Trigger enhancement when generation completes while online
  useEffect(() => {
    const autoEnhance = localStorage.getItem('autoEnhance');
    const shouldAutoEnhance = autoEnhance !== null ? JSON.parse(autoEnhance) : true;
    
    // If generation just finished AND we're online AND auto-enhance is on
    if (!isGenerating && isOnline && shouldAutoEnhance && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastMessageId = `msg-${messages.length - 1}`;
      
      // Check if the last message is an offline assistant message that needs enhancement
      if (lastMessage.role === 'assistant' && 
          lastMessage.source === 'offline' && 
          !lastMessage.isEnhanced &&
          !enhancementQueue.has(lastMessageId) &&
          !enhancingMessages.has(lastMessageId)) {
        
        console.log('Generation completed, auto-enhancing last offline message...');
        
        setTimeout(() => {
          // Add to queue
          const newQueue = new Set(enhancementQueue);
          newQueue.add(lastMessageId);
          setEnhancementQueue(newQueue);
          
          // Start enhancing
          enhanceQueuedMessages([lastMessageId]);
        }, 500); // Small delay to ensure message is fully saved
      }
    }
  }, [isGenerating]); // Trigger when isGenerating changes

  const enhanceQueuedMessages = async (messageIds) => {
    for (const msgId of messageIds) {
      if (!isOnline) break; // Stop if we go offline
      
      // CRITICAL FIX: Check ref lock FIRST to prevent race conditions
      if (enhancementLockRef.current.has(msgId)) {
        console.log(`Enhancement already in progress for ${msgId}, skipping...`);
        continue;
      }
      
      const msgIndex = parseInt(msgId.split('-')[1]);
      const message = messages[msgIndex];
      
      // CRITICAL FIX: Skip if already enhanced OR already enhancing OR not offline
      if (!message || message.isEnhanced || message.source !== 'offline' || enhancingMessages.has(msgId)) {
        console.log(`Skipping enhancement for ${msgId}: already processed or in progress`);
        continue;
      }
      
      // IMPORTANT: Acquire lock BEFORE doing anything else
      enhancementLockRef.current.add(msgId);
      
      // IMPORTANT: Save the original offline text BEFORE we start enhancing
      const originalOfflineText = message.text;
      
      // Mark as enhancing BEFORE making API call
      setEnhancingMessages(prev => new Set([...prev, msgId]));
      
      try {
        // Get the original query from the previous user message
        const userMessageIndex = msgIndex - 1;
        const userMessage = messages[userMessageIndex];
        
        if (!userMessage || userMessage.role !== 'user') {
          throw new Error('Could not find original question');
        }
        
        let enhancedText = '';
        
        // Send the same query but request online mode
        await sendMessage(
          sessionId,
          userMessage.text,
          true, // Force online
          (chunk) => {
            enhancedText += chunk;
          },
          () => {
            // Fallback - keep original
            throw new Error('Enhancement failed');
          },
          new AbortController().signal
        );
        
        // Update the message with enhanced content
        setMessages(prev => {
          const updated = [...prev];
          updated[msgIndex] = {
            ...updated[msgIndex],
            isEnhanced: true,
            enhancedText: enhancedText,
            offlineText: originalOfflineText, // Use the saved original text
            text: enhancedText, // Show enhanced by default
            source: 'offline', // Keep offline source to show it was originally offline
          };
          console.log('Enhanced message updated:', {
            isEnhanced: updated[msgIndex].isEnhanced,
            hasEnhancedText: !!updated[msgIndex].enhancedText,
            hasOfflineText: !!updated[msgIndex].offlineText
          });
          return updated;
        });
        
        // Remove from queue
        setEnhancementQueue(prev => {
          const newQueue = new Set(prev);
          newQueue.delete(msgId);
          return newQueue;
        });
        
        // Add notification to tray AND show toast
        addNotification('success', 'Response Enhanced', 'Click to view enhanced message', msgId);
        toast.success('Response enhanced with more details', {
          icon: '✨',
        });
        
      } catch (error) {
        console.error('Enhancement failed:', error);
        addNotification('error', 'Enhancement Failed', 'Could not enhance response', msgId);
        toast.error('Failed to enhance response', {
          icon: '❌',
        });
      } finally {
        // CRITICAL FIX: Release lock first
        enhancementLockRef.current.delete(msgId);
        
        // Remove from enhancing set
        setEnhancingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(msgId);
          return newSet;
        });
      }
      
      // Small delay between enhancements
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const toggleEnhancement = (messageId) => {
    const msgIndex = parseInt(messageId.split('-')[1]);
    const message = messages[msgIndex];
    
    // CRITICAL FIX: Prevent toggling enhancement for already enhanced or currently enhancing messages
    if (message && (message.isEnhanced || enhancingMessages.has(messageId))) {
      console.log(`Cannot toggle enhancement for ${messageId}: already enhanced or in progress`);
      return;
    }
    
    setEnhancementQueue(prev => {
      const newQueue = new Set(prev);
      if (newQueue.has(messageId)) {
        newQueue.delete(messageId);
        toast('Removed from enhancement queue', { icon: '🗑️' });
      } else {
        newQueue.add(messageId);
        toast('Added to enhancement queue', { icon: '✅' });
        
        // If online, start enhancing immediately
        if (isOnline) {
          enhanceQueuedMessages([messageId]);
        }
      }
      return newQueue;
    });
  };

  const removeFromQueue = (messageId) => {
    setEnhancementQueue(prev => {
      const newQueue = new Set(prev);
      newQueue.delete(messageId);
      return newQueue;
    });
    toast('Removed from enhancement queue', { icon: '🗑️' });
  };

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
          // CRITICAL FIX: Check if the message still exists (prevents crash when clearing mid-generation)
          if (assistantMessageIndex >= prev.length) {
            console.warn('Message index out of bounds, chat may have been cleared');
            return prev;
          }
          
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
            // CRITICAL FIX: Check if the message still exists
            if (assistantMessageIndex >= prev.length) {
              console.warn('Message index out of bounds during fallback, chat may have been cleared');
              return prev;
            }
            
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
          // CRITICAL FIX: Check if the message still exists
          if (assistantMessageIndex >= prev.length) {
            console.warn('Message index out of bounds during abort, chat may have been cleared');
            return prev;
          }
          
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
          // CRITICAL FIX: Check if the message still exists
          if (assistantMessageIndex >= prev.length) {
            console.warn('Message index out of bounds during error, chat may have been cleared');
            return prev;
          }
          
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
    // CRITICAL FIX: Abort any ongoing generation before clearing
    if (abortController) {
      console.log('Aborting ongoing generation before clearing chat');
      abortController.abort();
      setAbortController(null);
    }
    
    // Reset generation state
    setIsGenerating(false);
    
    // Clear the chat on backend
    await clearChat(sessionId);
    
    // Clear all state
    setMessages([]);
    setEnhancementQueue(new Set());
    setEnhancingMessages(new Set());
    enhancementLockRef.current.clear();
    
    // Clear notifications
    setNotifications([]);
    
    toast.success('Chat cleared', { icon: '🗑️' });
  };

  return (
    <div className={`flex h-screen ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <NotificationProvider isDarkTheme={isDarkTheme} />
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        isDarkTheme={isDarkTheme}
        setIsDarkTheme={setIsDarkTheme}
      />
      <NotificationTray
        isOpen={notificationTrayOpen}
        onClose={() => setNotificationTrayOpen(false)}
        notifications={notifications}
        isDarkTheme={isDarkTheme}
        onNavigateToMessage={navigateToMessage}
        onRemoveNotification={removeNotification}
      />
      <EnhancementQueueTray
        isOpen={queueTrayOpen}
        onClose={() => setQueueTrayOpen(false)}
        queuedMessages={enhancementQueue}
        enhancingMessages={enhancingMessages}
        messages={messages}
        isDarkTheme={isDarkTheme}
        onNavigateToMessage={navigateToMessage}
        onRemoveFromQueue={removeFromQueue}
      />
      
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

        {/* Middle Section - Spacer to keep buttons at bottom */}
        <div className="flex-1"></div>

        {/* Bottom Section - Mode and Theme toggles */}
        <div className={`${sidebarOpen ? 'p-3 space-y-3' : 'p-2 space-y-2'}`}>
          {/* Mode Toggle - Sleek Design */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`group w-full flex items-center ${sidebarOpen ? 'gap-3 px-4 py-3 justify-between' : 'justify-center p-3'} rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              isOnline 
                ? isDarkTheme
                  ? "bg-gradient-to-r from-green-900 to-emerald-900 text-green-100 shadow-lg shadow-green-900/50 hover:shadow-green-800/60 border border-green-700/50" 
                  : "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-md shadow-green-200/50 hover:shadow-green-300/60 border border-green-200"
                : isDarkTheme
                  ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 shadow-lg shadow-gray-900/50 hover:shadow-gray-800/60 border border-gray-600/50"
                  : "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 shadow-md shadow-gray-200/50 hover:shadow-gray-300/60 border border-gray-200"
            }`}
            title={!sidebarOpen ? (isOnline ? "Online Mode" : "Offline Mode") : ""}
          >
            <span className="flex items-center gap-2.5">
              <span className={`text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isOnline ? 'animate-pulse' : ''}`}>
                {isOnline ? "🌐" : "📱"}
              </span>
              {sidebarOpen && (
                <span className="text-sm font-semibold whitespace-nowrap">
                  {isOnline ? "Online" : "Offline"}
                </span>
              )}
            </span>
            {sidebarOpen && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isOnline 
                  ? isDarkTheme ? 'bg-green-800/50 text-green-300' : 'bg-green-200/60 text-green-700'
                  : isDarkTheme ? 'bg-gray-600/50 text-gray-400' : 'bg-gray-200/60 text-gray-600'
              } whitespace-nowrap font-medium`}>
                {isOnline ? "Cerebras" : "Local"}
              </span>
            )}
          </button>

          {/* Theme Toggle - Sleek Design */}
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`group w-full flex items-center ${sidebarOpen ? 'gap-3 px-4 py-3 justify-between' : 'justify-center p-3'} rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              isDarkTheme
                ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 hover:from-indigo-900/60 hover:to-purple-900/60 text-indigo-200 border border-indigo-700/50 shadow-lg shadow-indigo-900/30'
                : 'bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 text-amber-800 border border-amber-200 shadow-md shadow-amber-200/50'
            }`}
            title={!sidebarOpen ? (isDarkTheme ? "Dark Theme" : "Light Theme") : ""}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-xl flex-shrink-0 transition-transform duration-300 group-hover:rotate-[360deg]">
                {isDarkTheme ? "🌙" : "☀️"}
              </span>
              {sidebarOpen && (
                <span className="text-sm font-semibold whitespace-nowrap">
                  {isDarkTheme ? "Dark" : "Light"}
                </span>
              )}
            </span>
            {sidebarOpen && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDarkTheme 
                  ? 'bg-indigo-800/40 text-indigo-300' 
                  : 'bg-amber-200/60 text-amber-700'
              } whitespace-nowrap font-medium`}>
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
              onClick={() => navigate('/')}
              className={`p-2 ${
                isDarkTheme ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              } rounded-lg transition-colors group`}
              title="Back to landing page"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
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
          
          <div className="flex items-center gap-3">
            {/* Status indicator */}
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
            
            {/* Enhancement Queue Icon */}
            <button
              onClick={() => setQueueTrayOpen(true)}
              className={`relative p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Enhancement Queue"
            >
              <Sparkles className="w-5 h-5" />
              {(enhancementQueue.size > 0 || enhancingMessages.size > 0) && (
                <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold rounded-full ${
                  enhancingMessages.size > 0
                    ? 'bg-blue-500 text-white'
                    : 'bg-purple-500 text-white'
                } px-1`}>
                  {enhancementQueue.size + enhancingMessages.size}
                </span>
              )}
            </button>
            
            {/* Notification bell */}
            <button
              onClick={() => setNotificationTrayOpen(true)}
              className={`relative p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
            </button>
            
            {/* Settings button */}
            <button
              onClick={() => setSettingsOpen(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 overflow-hidden bg-white shadow-lg">
                <img 
                  src={logo} 
                  alt="BridgeAI" 
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <h2 className={`text-2xl font-semibold mb-3 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Welcome to BridgeAI</h2>
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
                <Message 
                  key={idx} 
                  role={msg.role} 
                  text={msg.text} 
                  source={msg.source} 
                  fallback={msg.fallback} 
                  isDarkTheme={isDarkTheme}
                  messageId={`msg-${idx}`}
                  isQueuedForEnhancement={enhancementQueue.has(`msg-${idx}`)}
                  isEnhanced={msg.isEnhanced}
                  isEnhancing={enhancingMessages.has(`msg-${idx}`)}
                  onToggleEnhancement={toggleEnhancement}
                  enhancedText={msg.enhancedText}
                  offlineText={msg.offlineText}
                  isGenerating={isGenerating && idx === messages.length - 1 && msg.role === 'assistant'}
                />
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
                
                {/* Send/Stop button - Sleek Design */}
                <button
                  onClick={isGenerating ? handleStop : handleSend}
                  disabled={!input.trim() && !isGenerating}
                  className={`absolute right-3 bottom-3 p-2.5 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                    isGenerating
                      ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/50 hover:shadow-red-600/60 animate-pulse"
                      : input.trim()
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/50 hover:shadow-orange-600/60"
                      : isDarkTheme
                      ? "bg-gray-700 text-gray-600 cursor-not-allowed"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  title={isGenerating ? "Stop generation" : "Send message"}
                >
                  {isGenerating ? (
                    <svg className="w-4 h-4 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
