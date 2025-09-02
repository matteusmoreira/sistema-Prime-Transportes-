import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatTimeToAmPm } from '@/utils/timeFormatter';

interface TimeInputAmPmProps {
  value24h: string;
  onChange24h: (value: string) => void;
  readOnly?: boolean;
}

const to12h = (v: string) => {
  if (!v) return { hh: '', mm: '', ampm: 'AM' as 'AM'|'PM' };
  const [hStr, m = '00'] = v.split(':');
  const h = Math.max(0, Math.min(23, parseInt(hStr || '0')));
  const ampm: 'AM'|'PM' = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { hh: String(h12).padStart(2,'0'), mm: m.slice(0,2).padStart(2,'0'), ampm };
};

const to24h = (hh: string, mm: string, ampm: 'AM'|'PM') => {
  const h = Math.max(1, Math.min(12, parseInt(hh || '12')));
  let h24 = ampm === 'PM' ? (h % 12) + 12 : (h % 12);
  if (ampm === 'AM' && h === 12) h24 = 0;
  return `${String(h24).padStart(2,'0')}:${String(parseInt(mm||'0')).toString().padStart(2,'0')}`;
};

export function TimeInputAmPm({ value24h, onChange24h, readOnly }: TimeInputAmPmProps) {
  const base = useMemo(() => to12h(value24h), [value24h]);
  const [hh, setHh] = useState(base.hh);
  const [mm, setMm] = useState(base.mm);
  const [ampm, setAmPm] = useState<'AM'|'PM'>(base.ampm);

  useEffect(() => {
    setHh(base.hh); setMm(base.mm); setAmPm(base.ampm);
  }, [base.hh, base.mm, base.ampm]);

  useEffect(() => {
    if (hh.length === 2 && mm.length === 2) onChange24h(to24h(hh, mm, ampm));
  }, [hh, mm, ampm]);

  if (readOnly) {
    return <Input value={formatTimeToAmPm(value24h)} readOnly className="bg-gray-100" />;
  }

  const onHhChange = (v: string) => {
    const d = v.replace(/[^0-9]/g, '').slice(0,2);
    setHh(d);
    const num = parseInt(d || '0');
    if (d.length >= 1) setAmPm(num >= 12 ? 'PM' : 'AM'); // puxa AM/PM automaticamente
  };
  const onMmChange = (v: string) => setMm(v.replace(/[^0-9]/g, '').slice(0,2));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 w-full">
        <Input
          placeholder="hh"
          value={hh}
          onChange={e => onHhChange(e.target.value)}
          className="w-16 text-center"
          inputMode="numeric"
          maxLength={2}
        />
        <span className="opacity-70">:</span>
        <Input
          placeholder="mm"
          value={mm}
          onChange={e => onMmChange(e.target.value)}
          className="w-16 text-center"
          inputMode="numeric"
          maxLength={2}
        />
      </div>
      <ToggleGroup type="single" value={ampm} onValueChange={(v:any)=> v && setAmPm(v)}>
        <ToggleGroupItem value="AM">AM</ToggleGroupItem>
        <ToggleGroupItem value="PM">PM</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}