import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const QR_STYLES = [
  { id: 'classic', label: 'Classic (Black/White)' },
  { id: 'branded', label: 'Branded (Yellow BG)' },
  { id: 'high', label: 'High Contrast (Level H)' },
  { id: 'mint', label: 'Mint Lith' },
  { id: 'rose', label: 'Rose Lith' },
];

export interface RaastSectionProps {
  raast: { accountTitle: string; iban: string; qrStyle?: string; raastOnReceipt?: boolean };
  onRaastChange: (raast: { accountTitle: string; iban: string; qrStyle?: string; raastOnReceipt?: boolean }) => void;
}

export const RaastSection: React.FC<RaastSectionProps> = ({ raast, onRaastChange }) => {
  const [showQr, setShowQr] = useState(false);
  const qrStyle = raast.qrStyle ?? 'classic';
  const styleMap: Record<string, { fg: string; bg: string; level: 'L' | 'M' | 'Q' | 'H' }> = {
    classic: { fg: '#000000', bg: '#FFFFFF', level: 'M' },
    branded: { fg: '#000000', bg: '#FFE600', level: 'M' },
    high: { fg: '#000000', bg: '#FFFFFF', level: 'H' },
    mint: { fg: '#065F46', bg: '#D1FAE5', level: 'M' },
    rose: { fg: '#9F1239', bg: '#FFE4E6', level: 'M' },
  };
  const style = styleMap[qrStyle] ?? styleMap.classic;
  const payload = `RAAST\nIBAN: ${raast.iban}\nTitle: ${raast.accountTitle}\nAmount: 0.00`;

  return (
    <div className="brutal-card p-4 bg-white flex flex-col gap-3">
      <h3 className="font-black uppercase text-sm border-b-3 border-black pb-1">Raast Payments</h3>
      <p className="text-[10px] font-bold text-black/60 uppercase">Configure IBAN & account title. Amount is taken from checkout at payment time.</p>
      <Input label="Account Title" value={raast.accountTitle ?? ''} onChange={(e) => onRaastChange({ ...raast, accountTitle: e.target.value })} />
      <Input label="IBAN (PK..)" value={raast.iban ?? ''} onChange={(e) => onRaastChange({ ...raast, iban: e.target.value })} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-wider">QR Style</label>
        <select className="brutal-input" value={qrStyle} onChange={(e) => onRaastChange({ ...raast, qrStyle: e.target.value })}>
          {QR_STYLES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs font-bold">
        <input type="checkbox" checked={!!raast.raastOnReceipt} onChange={(e) => onRaastChange({ ...raast, raastOnReceipt: e.target.checked })} /> Print Raast QR on receipt
      </label>
      <div className="flex gap-2">
        <Button variant="info" size="sm" onClick={() => setShowQr(!showQr)}>{showQr ? 'Hide Preview' : 'Preview Raast QR'}</Button>
      </div>
      {showQr && raast.iban && raast.accountTitle && (
        <div className="brutal-card p-3 bg-[#F4F0EA] flex flex-col items-center gap-2 border-3 border-black">
          <span className="text-[10px] font-black uppercase">Raast QR Preview (amount from checkout)</span>
          <QRCodeSVG value={payload} size={160} bgColor={style.bg} fgColor={style.fg} level={style.level} includeMargin />
          <div className="flex flex-col gap-1 text-xs font-bold text-center">
            <span>{raast.accountTitle}</span>
            <span className="text-black/60">{raast.iban}</span>
          </div>
        </div>
      )}
    </div>
  );
}
