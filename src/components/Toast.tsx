import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 4000,
      };

      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, newToast.duration);
      }
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onHide: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onHide }) => {
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onHide={onHide} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onHide: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-emerald-50/90",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-950",
          accent: "from-emerald-200/70 to-lime-200/70",
          icon: Check,
        };
      case "error":
        return {
          bgColor: "bg-rose-50/95",
          borderColor: "border-rose-200",
          textColor: "text-rose-950",
          accent: "from-rose-200/70 to-amber-200/70",
          icon: X,
        };
      case "warning":
        return {
          bgColor: "bg-amber-50/95",
          borderColor: "border-amber-200",
          textColor: "text-amber-950",
          accent: "from-amber-200/70 to-lime-200/70",
          icon: AlertTriangle,
        };
      case "info":
      default:
        return {
          bgColor: "bg-teal-50/95",
          borderColor: "border-teal-200",
          textColor: "text-teal-950",
          accent: "from-teal-200/70 to-emerald-200/70",
          icon: Info,
        };
    }
  };

  const styles = getToastStyles(toast.type);
  const Icon = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 220, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 220, scale: 0.92 }}
      transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
      className={`
        relative p-4 rounded-2xl border backdrop-blur-xl
        ${styles.bgColor} ${styles.borderColor}
        shadow-[0_18px_45px_rgba(15,23,42,0.22)] hover:shadow-[0_22px_60px_rgba(15,23,42,0.28)]
        transition-shadow duration-300
        max-w-sm w-full
      `}
    >
      
      <div
        className={`
          absolute inset-0 rounded-2xl
          bg-gradient-to-br ${styles.accent}
          opacity-40 mix-blend-soft-light pointer-events-none
        `}
      />

      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-white/40 via-white/0 to-white/40 pointer-events-none" />

      <div className="relative flex items-start space-x-3">
        <div
          className={`
            flex-shrink-0 inline-flex items-center justify-center
            w-7 h-7 rounded-full bg-white/70 shadow-sm border border-white/60
          `}
        >
          <Icon className={`w-4 h-4 ${styles.textColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${styles.textColor} mb-0.5`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-[0.82rem] text-[#445547]/90 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>

        <button
          onClick={() => onHide(toast.id)}
          className="flex-shrink-0 text-emerald-900/50 hover:text-emerald-900/90 transition-colors duration-200 p-1 -m-1 rounded-lg hover:bg-white/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};