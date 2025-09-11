import React from 'react';
import { Input } from '@/components/ui/input';
import { formatTime24h } from '@/utils/timeFormatter';

export type TimeInput24hProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
};

export function TimeInput24h({ value, onChange, readOnly, placeholder = 'HH:MM', className, name, disabled, required }: TimeInput24hProps) {
  if (readOnly) {
    return <Input value={formatTime24h(value || '')} readOnly className={['bg-gray-100', className].filter(Boolean).join(' ')} />;
  }

  const handleChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 4);
    const formatted = digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
    onChange(formatted);
  };

  const handleBlur = () => {
    const v = (value || '').replace(/[^0-9]/g, '');
    if (!v) return;
    const hhRaw = v.slice(0, 2).padEnd(2, '0');
    const mmRaw = v.slice(2, 4).padEnd(2, '0');
    const h = Math.min(23, parseInt(hhRaw || '0', 10));
    const m = Math.min(59, parseInt(mmRaw || '0', 10));
    const normalized = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange(normalized);
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      inputMode="numeric"
      pattern="[0-2][0-9]:[0-5][0-9]"
      maxLength={5}
      value={value || ''}
      name={name}
      disabled={disabled}
      required={required}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      className={className}
    />
  );
}