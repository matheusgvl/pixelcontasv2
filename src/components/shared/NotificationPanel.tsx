import React from 'react';
import { AlertCircle, CheckCircle, Bell, X, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'error' | 'warning' | 'success' | 'info';
  date: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll
}) => {
  if (!isOpen) return null;

  const typeIcons = {
    error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />,
    success: <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-600 shrink-0" />
  };

  const typeStyles = {
    error: 'border-l-4 border-l-red-600 bg-red-600-bg/30',
    warning: 'border-l-4 border-l-yellow-500 bg-yellow-500-bg/30',
    success: 'border-l-4 border-l-green-600 bg-green-600-bg/30',
    info: 'border-l-4 border-l-blue-600 bg-blue-600-bg/30'
  };

  return (
    <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-white border border-pixel-neutral-200 rounded-premium shadow-premium-hover z-50 overflow-hidden flex flex-col max-h-[500px] animate-fade-in">
      
      {/* Header */}
      <div className="p-4 border-b border-pixel-neutral-200 flex justify-between items-center bg-neutral-bgSecondary/50">
        <div className="flex items-center gap-2">
          <Bell className="h-4.5 w-4.5 text-pixel-navy-900" />
          <span className="font-bold text-pixel-navy-900 text-sm font-title">
            Notificações ({notifications.length})
          </span>
        </div>
        <div className="flex gap-2 items-center">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] font-bold text-pixel-navy-900 hover:underline"
            >
              Limpar todas
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-pixel-neutral-500 hover:bg-pixel-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-pixel-neutral-200">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-pixel-neutral-500">
            Nenhuma nova notificação.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex gap-3 text-xs leading-relaxed transition-colors hover:bg-neutral-bgSecondary/20 ${typeStyles[item.type]}`}
            >
              {typeIcons[item.type]}
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-pixel-neutral-900 font-title">
                  {item.title}
                </span>
                <p className="text-pixel-neutral-500">
                  {item.description}
                </p>
                <span className="text-[9px] text-brand-grayBlue/60 mt-1 font-medium">
                  {item.date}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
export type { NotificationItem };
