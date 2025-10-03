import { X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

export default function EnhancementQueueTray({ 
  isOpen, 
  onClose, 
  queuedMessages, 
  enhancingMessages, 
  messages,
  isDarkTheme,
  onNavigateToMessage,
  onRemoveFromQueue 
}) {
  // Get message details from messages array
  const getMessageDetails = (messageId) => {
    const msgIndex = parseInt(messageId.split('-')[1]);
    const message = messages[msgIndex];
    
    if (!message) return null;
    
    // Get the question from the previous user message
    const userMessageIndex = msgIndex - 1;
    const userMessage = messages[userMessageIndex];
    const question = userMessage && userMessage.role === 'user' 
      ? userMessage.text 
      : 'Unknown question';
    
    // Get preview of response (first 60 chars)
    const responsePreview = message.text.length > 60 
      ? message.text.substring(0, 60) + '...' 
      : message.text;
    
    return {
      id: messageId,
      question,
      responsePreview,
      isEnhancing: enhancingMessages.has(messageId),
      isEnhanced: message.isEnhanced,
      isQueued: queuedMessages.has(messageId)
    };
  };

  // Combine queued and enhancing messages
  const allQueuedIds = Array.from(new Set([...queuedMessages, ...enhancingMessages]));
  const queueItems = allQueuedIds
    .map(getMessageDetails)
    .filter(item => item !== null && !item.isEnhanced); // Don't show already enhanced

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Tray */}
      <div className={`fixed top-0 right-0 h-full w-96 ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      } shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkTheme ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                isDarkTheme ? 'text-white' : 'text-gray-900'
              }`}>
                Enhancement Queue
              </h2>
              <p className={`text-xs ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {queueItems.length} {queueItems.length === 1 ? 'message' : 'messages'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Queue Items */}
        <div className="overflow-y-auto h-[calc(100%-80px)]">
          {queueItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Sparkles className={`w-8 h-8 ${
                  isDarkTheme ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}>
                No messages queued
              </h3>
              <p className={`text-sm ${
                isDarkTheme ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Messages waiting for enhancement will appear here
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isDarkTheme
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } cursor-pointer group`}
                  onClick={() => {
                    onNavigateToMessage(item.id);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        {item.isEnhancing ? (
                          <>
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkTheme
                                ? 'bg-blue-900/40 text-blue-300'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              Enhancing...
                            </span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkTheme
                                ? 'bg-purple-900/40 text-purple-300'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              Queued
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Question (Bold) */}
                      <p className={`text-sm font-semibold leading-relaxed mb-1.5 ${
                        isDarkTheme ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {item.question}
                      </p>
                      
                      {/* Response Preview (Lighter) */}
                      <p className={`text-xs leading-relaxed ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.responsePreview}
                      </p>
                    </div>
                    
                    {/* Remove Button */}
                    {!item.isEnhancing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromQueue(item.id);
                        }}
                        className={`p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${
                          isDarkTheme
                            ? 'hover:bg-red-900/30 text-red-400'
                            : 'hover:bg-red-100 text-red-600'
                        }`}
                        title="Remove from queue"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
