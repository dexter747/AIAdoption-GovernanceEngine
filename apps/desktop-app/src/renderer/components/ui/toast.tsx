'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// Toast Types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
 id: string;
 type: ToastType;
 title: string;
 message?: string;
 duration?: number;
}

interface ToastContextType {
 toasts: Toast[];
 addToast: (toast: Omit<Toast, 'id'>) => void;
 removeToast: (id: string) => void;
 success: (title: string, message?: string) => void;
 error: (title: string, message?: string) => void;
 warning: (title: string, message?: string) => void;
 info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
 const [toasts, setToasts] = useState<Toast[]>([]);

 const removeToast = useCallback((id: string) => {
 setToasts(prev => prev.filter(t => t.id !== id));
 }, []);

 const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
 const id = crypto.randomUUID();
 const duration = toast.duration ?? 5000;
 
 setToasts(prev => [...prev, { ...toast, id }]);
 
 if (duration > 0) {
 setTimeout(() => removeToast(id), duration);
 }
 }, [removeToast]);

 const success = useCallback((title: string, message?: string) => {
 addToast({ type: 'success', title, message });
 }, [addToast]);

 const error = useCallback((title: string, message?: string) => {
 addToast({ type: 'error', title, message, duration: 8000 });
 }, [addToast]);

 const warning = useCallback((title: string, message?: string) => {
 addToast({ type: 'warning', title, message });
 }, [addToast]);

 const info = useCallback((title: string, message?: string) => {
 addToast({ type: 'info', title, message });
 }, [addToast]);

 return (
 <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
 {children}
 <ToastContainer toasts={toasts} onRemove={removeToast} />
 </ToastContext.Provider>
 );
}

export function useToast() {
 const context = useContext(ToastContext);
 if (!context) {
 throw new Error('useToast must be used within a ToastProvider');
 }
 return context;
}

// Toast Container Component
interface ToastContainerProps {
 toasts: Toast[];
 onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
 return (
 <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
 {toasts.map(toast => (
 <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
 ))}
 </div>
 );
}

// Individual Toast Component
interface ToastItemProps {
 toast: Toast;
 onRemove: () => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: ReactNode }> = {
 success: {
 bg: 'bg-zinc-900/40',
 border: 'border-zinc-800',
 icon: <CheckCircle className="w-5 h-5 text-zinc-400" />,
 },
 error: {
 bg: 'bg-zinc-900/40',
 border: 'border-zinc-800',
 icon: <XCircle className="w-5 h-5 text-zinc-400" />,
 },
 warning: {
 bg: 'bg-zinc-900/40',
 border: 'border-zinc-800',
 icon: <AlertTriangle className="w-5 h-5 text-zinc-400" />,
 },
 info: {
 bg: 'bg-zinc-900/40',
 border: 'border-zinc-800',
 icon: <Info className="w-5 h-5 text-zinc-300" />,
 },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
 const styles = toastStyles[toast.type];
 
 return (
 <div 
 className={cn(
 'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-up',
 styles.bg,
 styles.border
 )}
 role="alert"
 >
 <div className="flex-shrink-0 mt-0.5">
 {styles.icon}
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-medium text-white">
 {toast.title}
 </p>
 {toast.message && (
 <p className="mt-1 text-zinc-400">
 {toast.message}
 </p>
 )}
 </div>
 <button
 onClick={onRemove}
 className="flex-shrink-0 text-muted-foreground transition-colors hover:text-zinc-300"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 );
}

// Add animation styles
const styleSheet = `
@keyframes slide-up {
 from {
 opacity: 0;
 transform: translateY(10px);
 }
 to {
 opacity: 1;
 transform: translateY(0);
 }
}

.animate-slide-up {
 animation: slide-up 0.2s ease-out;
}
`;

// Inject styles (only in browser)
if (typeof document !== 'undefined') {
 const existingStyle = document.getElementById('toast-styles');
 if (!existingStyle) {
 const style = document.createElement('style');
 style.id = 'toast-styles';
 style.textContent = styleSheet;
 document.head.appendChild(style);
 }
}
