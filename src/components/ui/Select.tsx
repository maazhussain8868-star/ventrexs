import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-on-surface">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full bg-surface-container-lowest border rounded-lg py-2.5 pl-3.5 pr-10 appearance-none text-sm text-on-surface focus:outline-none focus:ring-2 transition-all cursor-pointer ${
            error 
              ? 'border-error text-error focus:border-error focus:ring-error/20' 
              : 'border-outline-variant focus:border-primary focus:ring-primary/10'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-xl">
          expand_more
        </span>
      </div>
      {error ? (
        <p className="text-xs text-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-on-surface-variant">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
