import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  children
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'text-red-600 bg-red-50',
    primary: 'text-text-primary bg-surface',
    warning: 'text-yellow-500 bg-yellow-50'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-border rounded-premium shadow-premium p-6 flex flex-col gap-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-text-secondary hover:bg-surface transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex gap-4">
          <div className={`p-3 rounded-full shrink-0 h-12 w-12 flex items-center justify-center ${colors[variant]}`}>
            <AlertCircle className="h-6 w-6" />
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-text-primary font-title">
              {title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {children}

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
