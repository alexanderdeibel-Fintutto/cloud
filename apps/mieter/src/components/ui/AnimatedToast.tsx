import { toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Enhanced toast functions with consistent styling and animations
export const animatedToast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      className: "group-[.toaster]:border-success/20 group-[.toaster]:bg-success/5",
    });
  },

  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <XCircle className="w-5 h-5 text-destructive" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      className: "group-[.toaster]:border-destructive/20 group-[.toaster]:bg-destructive/5",
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      className: "group-[.toaster]:border-warning/20 group-[.toaster]:bg-warning/5",
    });
  },

  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <Info className="w-5 h-5 text-info" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      className: "group-[.toaster]:border-info/20 group-[.toaster]:bg-info/5",
    });
  },

  loading: (message: string, options?: Omit<ToastOptions, 'action'>) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      duration: options?.duration || Infinity,
      icon: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};
