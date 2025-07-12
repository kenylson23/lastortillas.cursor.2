import * as React from "react";
import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

interface ToastContextType {
  toast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const fullToast: Toast = {
      id,
      duration: 5000,
      ...newToast,
    };

    setToasts((prev) => [...prev, fullToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, fullToast.duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`
                p-4 rounded-lg shadow-lg max-w-sm w-full cursor-pointer
                ${toast.variant === "destructive" 
                  ? "bg-red-50 border border-red-200 text-red-800" 
                  : toast.variant === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-white border border-gray-200 text-gray-800"
                }
              `}
              onClick={() => removeToast(toast.id)}
            >
              <div className="font-medium">{toast.title}</div>
              {toast.description && (
                <div className="text-sm mt-1 opacity-80">{toast.description}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};