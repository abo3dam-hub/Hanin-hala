import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  full?: boolean;
  children: ReactNode;
}

export const FormField = ({
  id,
  label,
  required,
  error,
  hint,
  full,
  children,
}: FormFieldProps) => (
  <div className={`field${full ? ' field--full' : ''}${error ? ' has-error' : ''}`}>
    <label htmlFor={id}>
      {label}
      {required && (
        <span className="field__req" aria-hidden="true">
          *
        </span>
      )}
    </label>
    {children}
    {hint && !error && <p className="field__hint">{hint}</p>}
    {error && (
      <p className="field__error" id={`${id}-error`} role="alert">
        {error}
      </p>
    )}
  </div>
);
