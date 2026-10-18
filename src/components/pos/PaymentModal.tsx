import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface PaymentModalProps {
  open: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (method: 'CASH' | 'CARD' | 'ONLINE', cashReceived: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ open, total, onClose, onConfirm }) => {
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'ONLINE'>('CASH');
  const [cash, setCash] = useState<string>('');
  if (!open) return null;
  const received = Number(cash) || 0;
  const change = received - total;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-4">
        <h2 className="font-black uppercase text-xl">Payment</h2>
        <Badge variant="yellow">Total: PKR {total.toFixed(0)}</Badge>
        <div className="grid grid-cols-3 gap-2">
          {(['CASH', 'CARD', 'ONLINE'] as const).map((m) => (
            <Button key={m} variant={method === m ? 'primary' : 'outline'} onClick={() => setMethod(m)}>{m}</Button>
          ))}
        </div>
        {method === 'CASH' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase">Cash Received</label>
            <input className="brutal-input" type="number" value={cash} onChange={(e) => setCash(e.target.value)} />
            <Badge variant={change >= 0 ? 'lime' : 'pink'}>Change: PKR {change.toFixed(0)}</Badge>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => onConfirm(method, received)} disabled={method === 'CASH' && received < total}>Confirm</Button>
        </div>
      </div>
    </div>
  );
};
