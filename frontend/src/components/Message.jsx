import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Message({ role, text, source, fallback, isDarkTheme }) {
  if (role === "user") {
    return (
      <div className="mb-8">
        {/* User message with highlighted background like Claude */}
        <div className={`${
          isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        } border rounded-lg p-4 mb-4`}>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">U</span>
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
    <div className="mb-8">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">🌉</span>
        </div>
        <div className="flex-1">
          {/* Source indicator */}
          {source && (
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block w-2 h-2 rounded-full ${
                source === "online" ? "bg-green-500" : "bg-gray-400"
              }`}></span>
              <span className={`text-xs font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                {source === "online" ? "Cerebras Llama-4" : "Local Llama-2"}
                {fallback && " (Fallback)"}
              </span>
            </div>
          )}
          
          {/* Message content */}
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
        </div>
      </div>
    </div>
  );
}
