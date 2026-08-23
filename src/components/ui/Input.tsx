import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-on-surface">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-outline pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-surface-container-lowest border rounded-lg py-2.5 font-normal text-sm text-on-surface placeholder:text-outline transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-surface-container-low disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
            error 
              ? 'border-error text-error focus:border-error focus:ring-error/20' 
              : 'border-outline-variant focus:border-primary focus:ring-primary/10'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-outline flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-on-surface-variant">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
