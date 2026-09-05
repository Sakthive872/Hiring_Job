// File: src/components/ui/Modal.jsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  labelledBy,
  className = '',
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div
      className="ui-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        className={`ui-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || 'modal-title'}
      >
        <header className="ui-modal-header">
          <h2 id={labelledBy || 'modal-title'}>{title}</h2>
          <button
            type="button"
            className="ui-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </header>
        <div className="ui-modal-body">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
