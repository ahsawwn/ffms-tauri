import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { broadcastCustomerDisplay } from '../../utils/customerDisplay';

export interface PaymentModalProps {
  open: boolean;
  total: number;
  settings?: any;
  onClose: () => void;
  onConfirm: (method: 'CASH' | 'CARD' | 'ONLINE' | 'RAAST', cashReceived: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ open, total, settings, onClose, onConfirm }) => {
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'ONLINE' | 'RAAST'>('CASH');
  const [cash, setCash] = useState<string>('');
  const [raastSettings, setRaastSettings] = useState<any>(null);
  const [raastQrUrl, setRaastQrUrl] = useState<string>('');

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
      // Generate Raast QR via sendkardo-qr
      if (r?.iban && r?.accountTitle) {
        const styleMap: Record<string, { dark: string; light: string; level: 'L' | 'M' | 'Q' | 'H' }> = {
          classic: { dark: '#000000', light: '#FFFFFF', level: 'M' },
          branded: { dark: '#000000', light: '#FFE600', level: 'M' },
          high: { dark: '#000000', light: '#FFFFFF', level: 'H' },
          mint: { dark: '#065F46', light: '#D1FAE5', level: 'M' },
          rose: { dark: '#9F1239', light: '#FFE4E6', level: 'M' },
        };
        const st = styleMap[r.qrStyle ?? 'classic'] ?? styleMap.classic;
        import('sendkardo-qr').then(async (m: any) => {
          try {
            // Validate IBAN first
            if (!m.isValidPakistaniIban(r.iban)) {
              console.error('Invalid IBAN:', r.iban);
              setRaastQrUrl('INVALID');
              return;
            }
            const url = await m.createRaastQrDataUrl({ iban: r.iban, amount: total }, { errorCorrectionLevel: st.level, margin: 1, width: 220, color: { dark: st.dark, light: st.light } });
            setRaastQrUrl(url);
            broadcastCustomerDisplay({ status: 'payment', total, restaurantName: settings?.restaurantName, raast: r, raastQrDataUrl: url });
          } catch (e) { console.error('raast qr gen failed', e); setRaastQrUrl('ERROR'); }
        }).catch((e) => { console.error('sendkardo import failed', e); setRaastQrUrl('ERROR'); });
      } else {
        setRaastQrUrl('');
      }
    } else {
      broadcastCustomerDisplay({ status: 'idle', items: [], total: 0, restaurantName: settings?.restaurantName });
    }
  }, [open, settings, total]);

  if (!open) return null;
  const received = Number(cash) || 0;
  const change = received - total;

  const iban = raastSettings?.iban ?? '';
  const accountTitle = raastSettings?.accountTitle ?? '';

  const handlePrintRaast = async () => {
    const w = window.open('', '_blank', 'width=360,height=480,noopener=yes');
    if (!w) return;
    // Generate QR on click to ensure it's available
    let qrImg = raastQrUrl || '';
    if (!qrImg && iban && accountTitle) {
      try {
        const m = (await import('sendkardo-qr')) as any;
        qrImg = await m.createRaastQrDataUrl({ iban, amount: total }, { width: 220, margin: 1 });
        setRaastQrUrl(qrImg);
      } catch (e) { console.error('raast qr gen failed', e); }
    }
    w.document.write('<html><head><style>'
      + '@page { size: 80mm auto; margin: 0; }'
      + 'body{font-family:monospace;text-align:center;padding:10px;margin:0;}'
      + 'img{width:200px;height:200px;margin:10px auto;display:block;}'
      + '</style></head><body>'
      + '<h2>Raast Payment</h2>'
      + '<p><strong>' + accountTitle + '</strong></p>'
      + '<p>IBAN: ' + iban + '</p>'
      + '<p>Amount: PKR ' + total.toFixed(0) + '</p>'
      + (qrImg ? '<img src="' + qrImg + '" />' : '<p>Generating QR...</p>')
      + '<p>Scan to pay via Raast</p>'
      + '<script>setTimeout(function(){window.print();},800);setTimeout(function(){try{window.close();}catch(e){}},1800);</script>'
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
                  {raastQrUrl === 'INVALID' ? (
                    <p className="text-xs font-bold text-[#FF6B8B]">Invalid IBAN. Check Settings.</p>
                  ) : raastQrUrl === 'ERROR' ? (
                    <p className="text-xs font-bold text-[#FF6B8B]">QR generation failed.</p>
                  ) : raastQrUrl ? (
                    <img src={raastQrUrl} alt="raast qr" className="w-52 h-52" />
                  ) : (
                    <p className="text-xs font-bold">Generating QR...</p>
                  )}
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
