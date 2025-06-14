import { toast as reactToastify } from 'react-toastify';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
}

// Main toast function that matches the existing interface
export const toast = (options: ToastOptions | string) => {
  // Handle string input for backward compatibility
  if (typeof options === 'string') {
    reactToastify.info(options, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return;
  }

  const { 
    title, 
    description, 
    variant = 'default', 
    position = 'top-right',
    autoClose = 4000,
    hideProgressBar = false,
    closeOnClick = true,
    pauseOnHover = true,
    draggable = true
  } = options;

  // Create message content
  const message = title && description ? `${title}: ${description}` : title || description || '';

  const toastOptions = {
    position,
    autoClose,
    hideProgressBar,
    closeOnClick,
    pauseOnHover,
    draggable,
    className: variant === 'destructive' ? 'toast-error' : 'toast-default',
  };

  // Map variant to toast type
  if (variant === 'destructive') {
    reactToastify.error(message, toastOptions);
  } else {
    reactToastify.success(message, toastOptions);
  }
};

// Specific toast type functions for easier usage
export const toastSuccess = (message: string, description?: string, options?: Partial<ToastOptions>) => {
  reactToastify.success(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    description,
    ...options,
  });
};

export const toastError = (message: string, description?: string, options?: Partial<ToastOptions>) => {
  reactToastify.error(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    description,
    ...options,
  });
};

export const toastInfo = (message: string, description?: string, options?: Partial<ToastOptions>) => {
  reactToastify.info(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    description,
    ...options,
  });
};

export const toastWarning = (message: string, options?: Partial<ToastOptions>) => {
  reactToastify.warn(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

// Hook for backward compatibility with existing components
export const useToast = () => {
  return { toast };
};

// Default export for easier importing
export default {
  toast,
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
  warning: toastWarning,
  useToast,
};