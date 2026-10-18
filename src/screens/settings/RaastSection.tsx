import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export interface RaastSectionProps {
  raast: { accountTitle: string; iban: string; till: string; amount: string };
  onRaastChange: (raast: { accountTitle: string; iban: string; till: string; amount: string }) => void;
}

export const RaastSection: React.FC<RaastSectionProps> = ({ raast, onRaastChange }) => {
  const [showQr, setShowQr] = useState(false);

  const payload = `RAAST\nIBAN: ${raast.iban}\nTitle: ${raast.accountTitle}\nTill: ${raast.till}\nAmount: ${raast.amount || '0'}`;

  return (
    <div className="brutal-card p-4 bg-white flex flex-col gap-3">
      <h3 className="font-black uppercase text-sm border-b-3 border-black pb-1">Raast Payments</h3>
      <Input label="Account Title" value={raast.accountTitle} onChange={(e) => onRaastChange({ ...raast, accountTitle: e.target.value })} />
      <Input label="IBAN (PK..)" value={raast.iban} onChange={(e) => onRaastChange({ ...raast, iban: e.target.value })} />
      <Input label="Till / Till ID" value={raast.till} onChange={(e) => onRaastChange({ ...raast, till: e.target.value })} placeholder="e.g. TILL-01" />
      <Input label="Amount (PKR)" type="number" value={raast.amount} onChange={(e) => onRaastChange({ ...raast, amount: e.target.value })} />
      <div className="flex gap-2">
        <Button variant="info" size="sm" onClick={() => setShowQr(!showQr)}>{showQr ? 'Hide QR' : 'Show Raast QR'}</Button>
        <Button variant="outline" size="sm" onClick={() => onRaastChange({ ...raast, amount: '' })}>Clear Amount</Button>
      </div>
      {showQr && raast.iban && raast.accountTitle && (
        <div className="brutal-card p-3 bg-[#F4F0EA] flex flex-col items-center gap-2 border-3 border-black">
          <span className="text-[10px] font-black uppercase">Dynamic Raast QR (scan to pay)</span>
          <QRCodeSVG value={payload} size={160} />
          <div className="flex flex-col gap-1 text-xs font-bold">
            <span>{raast.accountTitle}</span>
            <span className="text-black/60">{raast.iban}</span>
            {raast.till && <span className="text-black/60">Till: {raast.till}</span>}
          </div>
        </div>
      )}
      {!showQr && raast.iban && raast.accountTitle && (
        <p className="text-[10px] font-bold text-black/60 uppercase text-center">Tap "Show Raast QR" to generate payment QR</p>
      )}
    </div>
  );
}
