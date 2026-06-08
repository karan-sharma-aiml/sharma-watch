import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

const icons = {
  success: <FiCheckCircle className="text-green-400 shrink-0" size={18} />,
  error:   <FiXCircle     className="text-red-400   shrink-0" size={18} />,
  info:    <FiInfo        className="text-blue-400  shrink-0" size={18} />,
  warning: <FiAlertTriangle className="text-yellow-400 shrink-0" size={18} />,
};

const colors = {
  success: 'border-green-500/30  bg-green-500/10',
  error:   'border-red-500/30    bg-red-500/10',
  info:    'border-blue-500/30   bg-blue-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl
              border glass-dark card-shadow animate-fade-in-up
              ${colors[toast.type]}
            `}
          >
            {icons[toast.type]}
            <p className="text-sm text-white flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-white transition-colors shrink-0 mt-0.5"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};