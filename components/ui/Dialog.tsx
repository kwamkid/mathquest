// components/ui/Dialog.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ReactNode } from 'react';

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  type?: DialogType;
  title?: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  loading?: boolean;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Dialog({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
  confirmLabel = 'ตกลง',
  cancelLabel = 'ยกเลิก',
  onConfirm,
  loading = false,
  showCloseButton = true,
  size = 'sm'
}: DialogProps) {
  const isConfirmDialog = type === 'confirm';

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-10 h-10 text-green-400" />;
      case 'error':
        return <X className="w-10 h-10 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-10 h-10 text-orange-400" />;
      case 'info':
        return <Info className="w-10 h-10 text-blue-400" />;
      case 'confirm':
        return <AlertCircle className="w-10 h-10 text-yellow-400" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20';
      case 'error':
        return 'bg-red-500/20';
      case 'warning':
        return 'bg-orange-500/20';
      case 'info':
        return 'bg-blue-500/20';
      case 'confirm':
        return 'bg-yellow-500/20';
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'success':
        return 'สำเร็จ!';
      case 'error':
        return 'เกิดข้อผิดพลาด';
      case 'warning':
        return 'คำเตือน';
      case 'info':
        return 'ข้อมูล';
      case 'confirm':
        return 'ยืนยันการดำเนินการ';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={!loading ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`glass-dark rounded-3xl p-8 w-full border border-metaverse-purple/30 ${getSizeClass()}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {showCloseButton && !loading && !isConfirmDialog && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className={`w-20 h-20 ${getIconBg()} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              {getIcon()}
            </motion.div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              {getTitle()}
            </h3>

            {/* Message */}
            <div className="text-white/80 text-center mb-8">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>

            {/* Actions */}
            <div className={`flex gap-4 ${isConfirmDialog ? '' : 'justify-center'}`}>
              {isConfirmDialog && (
                <motion.button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelLabel}
                </motion.button>
              )}
              
              <motion.button
                onClick={handleConfirm}
                disabled={loading}
                className={`${isConfirmDialog ? 'flex-1' : 'px-8'} py-3 metaverse-button text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⏳
                    </motion.span>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  confirmLabel
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easy usage
import { useState, useCallback } from 'react';

interface UseDialogOptions {
  type?: DialogType;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
}

export function useDialog(options: UseDialogOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | ReactNode>('');
  const [loading, setLoading] = useState(false);
  const [dialogOptions, setDialogOptions] = useState(options);

  const showDialog = useCallback((msg: string | ReactNode, opts?: UseDialogOptions) => {
    setMessage(msg);
    if (opts) {
      setDialogOptions({ ...options, ...opts });
    }
    setIsOpen(true);
  }, [options]);

  const hideDialog = useCallback(() => {
    setIsOpen(false);
    setLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    const confirmFn = dialogOptions.onConfirm || options.onConfirm;
    
    if (confirmFn) {
      setLoading(true);
      try {
        await confirmFn();
        hideDialog();
      } catch (error) {
        console.error('Dialog confirm error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      hideDialog();
    }
  }, [dialogOptions, options, hideDialog]);

  const DialogComponent = useCallback(() => (
    <Dialog
      isOpen={isOpen}
      onClose={hideDialog}
      type={dialogOptions.type || options.type || 'info'}
      title={dialogOptions.title || options.title}
      message={message}
      confirmLabel={dialogOptions.confirmLabel || options.confirmLabel}
      cancelLabel={dialogOptions.cancelLabel || options.cancelLabel}
      onConfirm={handleConfirm}
      loading={loading}
    />
  ), [isOpen, message, dialogOptions, options, loading, hideDialog, handleConfirm]);

  return {
    showDialog,
    hideDialog,
    Dialog: DialogComponent,
    isOpen
  };
}