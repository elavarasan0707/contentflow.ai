import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, Copy, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'copied', title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  copied: (message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'copied' = 'success',
    title?: string,
    duration = 3500
  ) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9) + Date.now();
    const newToast: ToastMessage = { id, type, title, message, duration };

    setToasts(prev => [...prev.slice(-4), newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => {
    showToast(message, 'success', title);
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast(message, 'error', title, 4500);
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast(message, 'info', title);
  }, [showToast]);

  const copied = useCallback((message = 'Copied to clipboard') => {
    showToast(message, 'copied', undefined, 2500);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, copied }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-lg shadow-slate-900/10 text-slate-800"
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-600" />}
                {toast.type === 'copied' && <Copy className="w-5 h-5 text-indigo-600" />}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className="text-xs font-semibold text-slate-900 mb-0.5 tracking-tight">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs font-medium text-slate-600 leading-relaxed break-words">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
