import { create } from 'zustand';
import { useState } from 'react';

interface ConfirmDialogConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmDialogStore {
  isOpen: boolean;
  config: ConfirmDialogConfig | null;
  resolve: ((value: boolean) => void) | null;
  show: (config: ConfirmDialogConfig) => Promise<boolean>;
  confirm: () => void;
  cancel: () => void;
}

const useConfirmDialogStore = create<ConfirmDialogStore>((set, get) => ({
  isOpen: false,
  config: null,
  resolve: null,
  show: (config: ConfirmDialogConfig) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        config,
        resolve,
      });
    });
  },
  confirm: () => {
    const { resolve } = get();
    if (resolve) resolve(true);
    set({ isOpen: false, config: null, resolve: null });
  },
  cancel: () => {
    const { resolve } = get();
    if (resolve) resolve(false);
    set({ isOpen: false, config: null, resolve: null });
  },
}));

// New promise-based hook for modern components
export const useConfirmDialog = () => {
  const { show } = useConfirmDialogStore();
  
  return {
    confirm: show,
  };
};

// Legacy hook for backward compatibility
function useLegacyConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<any>(null);

  const onOpenDialog = (data?: any) => {
    setContext(data || null);
    setOpen(true);
  };

  const onCloseDialog = () => {
    setContext(null);
    setOpen(false);
  };

  return {
    open,
    context,
    onOpenDialog,
    onCloseDialog,
  };
}

export default useLegacyConfirmDialog;

export { useConfirmDialogStore };