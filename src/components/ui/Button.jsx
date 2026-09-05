// File: src/components/ui/Button.jsx
import { LoaderCircle } from 'lucide-react';

export default function Button({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`ui-button ui-button-${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          className="ui-button-spinner"
          size={16}
          aria-hidden="true"
        />
      ) : (
        children
      )}
    </button>
  );
}
