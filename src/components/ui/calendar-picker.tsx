
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CalendarPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const Calendar: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select date"
}) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
};
