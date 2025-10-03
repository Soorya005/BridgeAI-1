import { useState, useEffect } from 'react';
import { X, Bell, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function NotificationTray({ isOpen, onClose, notifications, isDarkTheme, onNavigateToMessage, onRemoveNotification }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className={`relative w-96 max-h-[80vh] rounded-xl shadow-2xl overflow-hidden ${
        isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkTheme ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Notifications</h2>
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

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className={`w-12 h-12 mb-3 ${isDarkTheme ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors relative ${
                    isDarkTheme 
                      ? 'hover:bg-gray-700/50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon based on type */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      notification.type === 'success' 
                        ? 'bg-green-900/30 text-green-400'
                        : notification.type === 'error'
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-blue-900/30 text-blue-400'
                    }`}>
                      {notification.type === 'success' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : notification.type === 'error' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>
                    
                    {/* Content - clickable to navigate */}
                    <div 
                      className={`flex-1 min-w-0 ${notification.messageId ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (notification.messageId) {
                          onNavigateToMessage(notification.messageId);
                          onClose();
                        }
                      }}
                    >
                      <p className={`text-sm font-medium ${
                        isDarkTheme ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className={`text-xs mt-1 ${
                          isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                      )}
                      <p className={`text-xs mt-1 ${
                        isDarkTheme ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {notification.time}
                      </p>
                    </div>
                    
                    {/* Close button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking X
                        onRemoveNotification(notification.id);
                      }}
                      className={`flex-shrink-0 p-1 rounded-md transition-colors ${
                        isDarkTheme
                          ? 'hover:bg-gray-600 text-gray-500 hover:text-gray-300'
                          : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
