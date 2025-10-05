import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sparkles, XCircle, CheckCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Message({ 
  role, 
  text, 
  source, 
  fallback, 
  isDarkTheme, 
  messageId,
  isQueuedForEnhancement,
  isEnhanced,
  isEnhancing,
  onToggleEnhancement,
  enhancedText,
  offlineText,
  isGenerating
}) {
  const [showingEnhanced, setShowingEnhanced] = useState(true);

  if (role === "user") {
    return (
      <div className="mb-8">
        {/* User message with highlighted background like Claude */}
        <div className={`${
          isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        } border rounded-lg p-4 mb-4`}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-base font-medium">U</span>
            </div>
            <div className="flex-1 pt-1">
              <div className={`${isDarkTheme ? 'text-gray-100' : 'text-gray-900'} whitespace-pre-wrap leading-relaxed`}>
                {text}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8" id={messageId}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white shadow-sm">
          {isGenerating ? (
            <svg 
              className="animate-spin h-6 w-6 text-orange-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <img 
              src={logo} 
              alt="BridgeAI" 
              className="w-full h-full object-cover scale-110"
            />
          )}
        </div>
        <div className="flex-1">
          {/* Source indicator */}
          {source && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`inline-block w-2 h-2 rounded-full ${
                isEnhanced && showingEnhanced ? "bg-purple-500" : source === "online" ? "bg-green-500" : "bg-gray-400"
              }`}></span>
              <span className={`text-xs font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                {isEnhanced && showingEnhanced ? "Enhanced Response" : source === "online" ? "Cerebras Llama-3.3" : "Local Llama-2"}
                {fallback && " (Fallback)"}
              </span>
              
              {/* Enhanced badge */}
              {isEnhanced && showingEnhanced && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isDarkTheme ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  Enhanced
                </span>
              )}
              
              {/* Enhancing indicator */}
              {isEnhancing && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isDarkTheme ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Enhancing...
                </span>
              )}
              
              {/* Queued badge */}
              {isQueuedForEnhancement && !isEnhancing && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isDarkTheme ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  Queued
                </span>
              )}
            </div>
          )}
          
          {/* Swipeable Card Container - only for enhanced messages */}
          {(() => {
            const shouldShowComparison = isEnhanced && offlineText && enhancedText;
            if (isEnhanced) {
              console.log('Message enhanced status:', {
                messageId,
                isEnhanced,
                hasOfflineText: !!offlineText,
                hasEnhancedText: !!enhancedText,
                offlineTextLength: offlineText?.length,
                enhancedTextLength: enhancedText?.length,
                shouldShowComparison
              });
            }
            return shouldShowComparison;
          })() ? (
            <div className="relative">
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowingEnhanced(false)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !showingEnhanced
                      ? isDarkTheme
                        ? 'bg-gray-700 text-white border-2 border-orange-500'
                        : 'bg-gray-200 text-gray-900 border-2 border-orange-500'
                      : isDarkTheme
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Offline Response
                </button>
                
                <div className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                  Click to compare
                </div>
                
                <button
                  onClick={() => setShowingEnhanced(true)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    showingEnhanced
                      ? isDarkTheme
                        ? 'bg-purple-900/40 text-purple-300 border-2 border-purple-500'
                        : 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                      : isDarkTheme
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Enhanced Response
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Card with transition */}
              <div className={`relative rounded-lg border-2 transition-all duration-300 ${
                showingEnhanced
                  ? isDarkTheme
                    ? 'border-purple-500/50 bg-purple-900/10'
                    : 'border-purple-300 bg-purple-50/50'
                  : isDarkTheme
                    ? 'border-gray-600 bg-gray-800/30'
                    : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="p-4">
                  <MessageContent 
                    text={showingEnhanced ? enhancedText : offlineText}
                    isDarkTheme={isDarkTheme}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Regular message content for non-enhanced messages */
            <MessageContent text={text} isDarkTheme={isDarkTheme} />
          )}
          
          {/* Enhancement controls - only show for offline messages that have content */}
          {source === "offline" && text && !isEnhancing && !isEnhanced && (
            <div className={`mt-4 flex items-center gap-2 flex-wrap`}>
              {/* Toggle enhancement button - only show if not enhanced */}
              <button
                onClick={() => onToggleEnhancement && onToggleEnhancement(messageId)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isQueuedForEnhancement
                    ? isDarkTheme
                      ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-700'
                      : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                    : isDarkTheme
                      ? 'bg-orange-900/30 hover:bg-orange-900/50 text-orange-300 border border-orange-700'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
                }`}
              >
                {isQueuedForEnhancement ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    Skip enhancement
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Prepare for enhancement
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Separate component for message content to reduce duplication
function MessageContent({ text, isDarkTheme }) {
  return (
    <div className="prose prose-gray max-w-none">
      {text ? (
        <ReactMarkdown
          components={{
            // Headers
            h1: ({node, ...props}) => <h1 className={`text-xl font-bold mb-4 mt-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`} {...props} />,
            h2: ({node, ...props}) => <h2 className={`text-lg font-bold mb-3 mt-4 ${isDarkTheme ? 'text-gray-100' : 'text-gray-800'}`} {...props} />,
            h3: ({node, ...props}) => <h3 className={`text-base font-semibold mb-2 mt-3 ${isDarkTheme ? 'text-gray-100' : 'text-gray-800'}`} {...props} />,
            h4: ({node, ...props}) => <h4 className={`text-sm font-semibold mb-2 mt-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`} {...props} />,
            
            // Paragraphs
            p: ({node, ...props}) => <p className={`mb-3 last:mb-0 leading-relaxed ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
            
            // Lists
            ul: ({node, ...props}) => <ul className={`list-disc list-inside mb-3 space-y-1 ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
            ol: ({node, ...props}) => <ol className={`list-decimal list-inside mb-3 space-y-1 ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
            li: ({node, ...props}) => <li className="ml-2" {...props} />,
            
            // Code blocks
            code: ({node, inline, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="my-4">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg text-sm"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                  isDarkTheme 
                    ? 'bg-gray-700 text-orange-300' 
                    : 'bg-gray-100 text-red-600'
                }`} {...props}>
                  {children}
                </code>
              );
            },
            
            // Blockquotes
            blockquote: ({node, ...props}) => (
              <blockquote className={`border-l-4 pl-4 italic my-3 ${
                isDarkTheme ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'
              }`} {...props} />
            ),
            
            // Tables
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-4">
                <table className={`min-w-full border ${
                  isDarkTheme ? 'border-gray-600' : 'border-gray-300'
                }`} {...props} />
              </div>
            ),
            th: ({node, ...props}) => (
              <th className={`border px-3 py-2 font-semibold text-left ${
                isDarkTheme 
                  ? 'border-gray-600 bg-gray-700 text-gray-100' 
                  : 'border-gray-300 bg-gray-50 text-gray-900'
              }`} {...props} />
            ),
            td: ({node, ...props}) => (
              <td className={`border px-3 py-2 ${
                isDarkTheme 
                  ? 'border-gray-600 text-gray-100' 
                  : 'border-gray-300 text-gray-900'
              }`} {...props} />
            ),
            
            // Strong and emphasis
            strong: ({node, ...props}) => <strong className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`} {...props} />,
            em: ({node, ...props}) => <em className="italic" {...props} />,
          }}
        >
          {text}
        </ReactMarkdown>
      ) : (
        <div className={`flex items-center gap-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'}`}>
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkTheme ? 'bg-gray-400' : 'bg-gray-400'}`}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkTheme ? 'bg-gray-400' : 'bg-gray-400'}`} style={{ animationDelay: "0.1s" }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkTheme ? 'bg-gray-400' : 'bg-gray-400'}`} style={{ animationDelay: "0.2s" }}></div>
          </div>
          <span className="text-sm">Thinking...</span>
        </div>
      )}
    </div>
  );
}
