import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextData {
  showToast: (message: string, type: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts((state) => [...state, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-green-50 border-green-600 text-green-800',
            error: 'bg-red-50 border-red-600 text-red-800',
            info: 'bg-blue-50 border-blue-600 text-blue-800',
            warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
          };

          const icons = {
            success: <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
            info: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
            warning: <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-4 border rounded-soft shadow-premium bg-white animate-fade-in transition-all duration-300 ${typeStyles[toast.type]}`}
            >
              <div className="flex items-center gap-3">
                {icons[toast.type]}
                <p className="text-sm font-semibold">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 p-1 rounded-full text-current hover:bg-black/5 transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
