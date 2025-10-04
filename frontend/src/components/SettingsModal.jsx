import { useState, useEffect } from 'react';
import { X, Settings, Sun, Moon } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, isDarkTheme, setIsDarkTheme }) {
  const [autoEnhance, setAutoEnhance] = useState(() => {
    const saved = localStorage.getItem('autoEnhance');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [enhanceRecent, setEnhanceRecent] = useState(() => {
    const saved = localStorage.getItem('enhanceRecent');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [maxMessagesToEnhance, setMaxMessagesToEnhance] = useState(() => {
    const saved = localStorage.getItem('maxMessagesToEnhance');
    return saved !== null ? parseInt(saved) : 5;
  });

  useEffect(() => {
    localStorage.setItem('autoEnhance', JSON.stringify(autoEnhance));
  }, [autoEnhance]);

  useEffect(() => {
    localStorage.setItem('enhanceRecent', JSON.stringify(enhanceRecent));
  }, [enhanceRecent]);

  useEffect(() => {
    localStorage.setItem('maxMessagesToEnhance', maxMessagesToEnhance.toString());
  }, [maxMessagesToEnhance]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 rounded-xl shadow-2xl ${
        isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkTheme ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">Theme</h3>
                <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose your preferred color scheme
                </p>
              </div>
              <button
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                  isDarkTheme ? 'bg-indigo-600' : 'bg-amber-500'
                }`}
              >
                <span
                  className={`flex h-4 w-4 transform items-center justify-center rounded-full bg-white transition-transform ${
                    isDarkTheme ? 'translate-x-6' : 'translate-x-1'
                  }`}
                >
                  {isDarkTheme ? (
                    <Moon className="w-3 h-3 text-indigo-600" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className={`border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`} />

          {/* Auto-enhance setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">Auto-enhance offline responses</h3>
                <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Automatically enhance offline responses when you're back online
                </p>
              </div>
              <button
                onClick={() => setAutoEnhance(!autoEnhance)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                  autoEnhance ? 'bg-orange-500' : isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoEnhance ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Enhance recent messages only */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">Enhance recent messages only</h3>
                <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Only enhance the most recent offline messages
                </p>
              </div>
              <button
                onClick={() => setEnhanceRecent(!enhanceRecent)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                  enhanceRecent ? 'bg-orange-500' : isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enhanceRecent ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Max messages to enhance */}
          {enhanceRecent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">Maximum messages to enhance</h3>
                  <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    Limit how many recent messages to enhance
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setMaxMessagesToEnhance(Math.max(1, maxMessagesToEnhance - 1))}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium ${
                      isDarkTheme 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{maxMessagesToEnhance}</span>
                  <button
                    onClick={() => setMaxMessagesToEnhance(Math.min(20, maxMessagesToEnhance + 1))}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium ${
                      isDarkTheme 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info section */}
          <div className={`p-4 rounded-lg ${
            isDarkTheme ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
              💡 <strong>Tip:</strong> You can manually prepare or skip individual responses for enhancement using the buttons below each offline message.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
