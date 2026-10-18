import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`brutal-input w-full text-sm py-2 px-3 ${error ? 'border-[#FF6B8B] bg-[#FFF1F2]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[10px] font-black uppercase text-[#FF6B8B] tracking-wide">
          {error}
        </span>
      )}
    </div>
  );
};