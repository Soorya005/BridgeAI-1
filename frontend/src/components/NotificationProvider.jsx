import { Toaster } from 'react-hot-toast';

export default function NotificationProvider({ isDarkTheme }) {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDarkTheme ? '#1f2937' : '#ffffff',
          color: isDarkTheme ? '#f3f4f6' : '#111827',
          border: `1px solid ${isDarkTheme ? '#374151' : '#e5e7eb'}`,
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}
