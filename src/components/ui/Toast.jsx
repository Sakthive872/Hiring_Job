// File: src/components/ui/Toast.jsx
import { CircleCheck, CircleX, Info, X } from 'lucide-react';

const icons = { success: CircleCheck, error: CircleX, info: Info };
export default function Toast({
  message,
  title,
  variant = 'info',
  onClose,
  duration = 5000,
}) {
  const Icon = icons[variant] || Info;
  if (!message && !title) return null;
  return (
    <div
      className={`ui-toast ui-toast-${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <Icon size={18} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {message && <span>{message}</span>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
      {duration > 0 && (
        <span
          className="ui-toast-timer"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}
