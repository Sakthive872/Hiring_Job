// File: src/components/ui/Input.jsx
import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { label, error, hint, id, className = '', ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  return (
    <div className={`ui-field ${className}`}>
      <label htmlFor={inputId}>{label}</label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...props}
      />
      {error ? (
        <span className="ui-field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="ui-field-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
});
export default Input;
