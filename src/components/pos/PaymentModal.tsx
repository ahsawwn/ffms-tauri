import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { QRCodeSVG } from 'qrcode.react';
import { broadcastCustomerDisplay } from '../../utils/customerDisplay';

export interface PaymentModalProps {
  open: boolean;
  total: number;
  settings?: any;
  onClose: () => void;
  onConfirm: (method: 'CASH' | 'CARD' | 'ONLINE' | 'RAAST', cashReceived: number) => void;
}

const QR_STYLES: Record<string, { fg: string; bg: string; level: 'L' | 'M' | 'Q' | 'H' }> = {
  classic: { fg: '#000000', bg: '#FFFFFF', level: 'M' },
  branded: { fg: '#000000', bg: '#FFE600', level: 'M' },
  high: { fg: '#000000', bg: '#FFFFFF', level: 'H' },
  mint: { fg: '#065F46', bg: '#D1FAE5', level: 'M' },
  rose: { fg: '#9F1239', bg: '#FFE4E6', level: 'M' },
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ open, total, settings, onClose, onConfirm }) => {
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'ONLINE' | 'RAAST'>('CASH');
  const [cash, setCash] = useState<string>('');
  const [raastSettings, setRaastSettings] = useState<any>(null);

  useEffect(() => {
    if (open) {
      const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
      let r: any = null;
      if (isTauri) {
        r = settings?.raast;
        if (typeof r === 'string') { try { r = JSON.parse(r); } catch { r = null; } }
      } else {
        try { r = JSON.parse(localStorage.getItem('nerve_raast') ?? '{}'); } catch { r = null; }
      }
      setRaastSettings(r);
      broadcastCustomerDisplay({ status: 'payment', total, restaurantName: settings?.restaurantName, raast: r, raastPayload: r?.iban ? 'RAAST\nIBAN: ' + r.iban + '\nTitle: ' + (r.accountTitle ?? '') + '\nAmount: ' + total.toFixed(2) : null });
    } else {
      broadcastCustomerDisplay({ status: 'idle', items: [], total: 0, restaurantName: settings?.restaurantName });
    }
  }, [open, settings, total]);

  if (!open) return null;
  const received = Number(cash) || 0;
  const change = received - total;

  const iban = raastSettings?.iban ?? '';
  const accountTitle = raastSettings?.accountTitle ?? '';
  const qrStyle = raastSettings?.qrStyle ?? 'classic';
  const style = QR_STYLES[qrStyle] ?? QR_STYLES.classic;
  const payload = `RAAST\nIBAN: ${iban}\nTitle: ${accountTitle}\nAmount: ${total.toFixed(2)}`;

  const handlePrintRaast = async () => {
    const w = window.open('', '_blank', 'width=360,height=480,noopener=yes');
    if (!w) return;
    let qrImg = '';
    try {
      const QRCode = (await import('qrcode')) as any;
      qrImg = await QRCode.toDataURL(payload, { width: 220, margin: 1 });
    } catch (e) { console.error('raast qr gen failed', e); }
    w.document.write('<html><head><style>body{font-family:monospace;text-align:center;padding:20px;} .qr{margin:20px auto;}</style></head><body>'
      + '<h2>Raast Payment</h2>'
      + '<p><strong>' + accountTitle + '</strong></p>'
      + '<p>IBAN: ' + iban + '</p>'
      + '<p>Amount: PKR ' + total.toFixed(0) + '</p>'
      + (qrImg ? '<img src="' + qrImg + '" style="width:220px;height:220px;margin:12px auto;display:block" />' : '')
      + '<p>Scan to pay via Raast</p>'
      + '<script>setTimeout(function(){window.print();},500);setTimeout(function(){try{window.close();}catch(e){}},1500);</script>'
      + '</body></html>');
    w.document.close();
    w.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-black uppercase text-xl">Payment</h2>
        <Badge variant="yellow">Total: PKR {total.toFixed(0)}</Badge>
        <div className="grid grid-cols-4 gap-2">
          {(['CASH', 'CARD', 'ONLINE', 'RAAST'] as const).map((m) => (
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
        {method === 'RAAST' && (
          <div className="flex flex-col gap-3 items-center">
            {iban && accountTitle ? (
              <>
                <div className="brutal-card p-3 bg-[#F4F0EA] flex flex-col items-center gap-2 border-3 border-black">
                  <QRCodeSVG
                    value={payload}
                    size={200}
                    bgColor={style.bg}
                    fgColor={style.fg}
                    level={style.level}
                    includeMargin={true}
                  />
                  <div className="text-xs font-bold text-center">
                    <div>{accountTitle}</div>
                    <div className="text-black/60">{iban}</div>
                    <div className="font-black mt-1">PKR {total.toFixed(0)}</div>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-black/60 uppercase text-center">Scan with Raast app to pay</p>
                <Button variant="info" size="sm" onClick={handlePrintRaast}>Print Raast QR</Button>
              </>
            ) : (
              <p className="text-xs font-bold text-[#FF6B8B] uppercase text-center">Configure IBAN & Account Title in Settings → Raast</p>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="success"
            className="flex-1"
            onClick={() => onConfirm(method, method === 'CASH' ? received : total)}
            disabled={method === 'CASH' && received < total}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};
