import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { formatDateDDMMYYYY } from '@/utils/format';

interface DatePickerBRProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  label?: string;
}

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function DatePickerBR({ value, onChange, readOnly = false }: DatePickerBRProps) {
  const dateObj = useMemo(() => {
    if (!value) return undefined;
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [, y, mo, d] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d));
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  if (readOnly) {
    return (
      <Input value={formatDateDDMMYYYY(value) || ''} readOnly className="bg-gray-100" />
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          {dateObj ? formatDateDDMMYYYY(toISO(dateObj)) : 'Selecionar data'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={(d) => d && onChange(toISO(d))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}