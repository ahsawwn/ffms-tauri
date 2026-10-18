import React from 'react';
import { Button } from '../ui/Button';
import { Delete } from 'lucide-react';

export interface PinKeypadProps {
  onKeyPress: (digit: string) => void;
  onClear: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export const PinKeypad: React.FC<PinKeypadProps> = ({ onKeyPress, onClear, onDelete, disabled }) => (
  <div className="grid grid-cols-3 gap-2.5 w-full">
    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
      <Button key={num} variant="outline" size="lg" className="py-3 text-xl font-black bg-white hover:bg-[#FFE600]" onClick={() => onKeyPress(num)} disabled={disabled}>
        {num}
      </Button>
    ))}
    <Button variant="danger" size="lg" className="py-3 text-xs font-black" onClick={onClear} disabled={disabled}>
      CLR
    </Button>
    <Button variant="outline" size="lg" className="py-3 text-xl font-black bg-white hover:bg-[#FFE600]" onClick={() => onKeyPress('0')} disabled={disabled}>
      0
    </Button>
    <Button variant="warning" size="lg" className="py-3 flex items-center justify-center" onClick={onDelete} disabled={disabled}>
      <Delete className="w-5 h-5 stroke-[2.5]" />
    </Button>
  </div>
);
