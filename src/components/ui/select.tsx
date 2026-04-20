"use client";

import { useId } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TerminalSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TerminalSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: TerminalSelectProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="label-strong">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="mono w-full appearance-none bg-void border border-hairline px-3 py-2 text-xs uppercase tracking-wider text-fg pr-8 disabled:text-fg-muted disabled:cursor-not-allowed"
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          className="label mono pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-muted"
          aria-hidden
        >
          ▾
        </span>
      </div>
    </div>
  );
}
