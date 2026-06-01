'use client';

// ============================================================
// components/ui/Toast.tsx
// Glassmorphic toast notification component and context provider.
// Displays notifications in a stacked stack with micro-animations.
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string, dur?: number) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg: string, dur?: number) => addToast(msg, 'error', dur), [addToast]);
  const info = useCallback((msg: string, dur?: number) => addToast(msg, 'info', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none sm:bottom-auto sm:top-5">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <InfoIcon className="w-5 h-5 text-cyan-400" />,
  };

  const bgBorderMap = {
    success: 'bg-[oklch(15%_0.02_140/0.75)] border-emerald-500/20 text-emerald-100 shadow-emerald-950/20',
    error: 'bg-[oklch(15%_0.02_20/0.75)] border-rose-500/20 text-rose-100 shadow-rose-950/20',
    info: 'bg-[oklch(15%_0.02_230/0.75)] border-cyan-500/20 text-cyan-100 shadow-cyan-950/20',
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto",
        "animate-slide-in transition-all duration-300 hover:scale-[1.01] hover:brightness-110",
        bgBorderMap[toast.type]
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</div>
      
      <div className="flex-1 text-sm font-medium leading-tight">
        {toast.message}
      </div>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 text-var(--color-base-500) hover:text-var(--color-base-300) transition-colors p-0.5 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
