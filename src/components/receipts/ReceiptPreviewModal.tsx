import React, { useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { ThermalReceipt, ReceiptData } from './ThermalReceipt';
import { KitchenTicket } from './KitchenTicket';
import { useThermalPrinter } from '../../hooks/useThermalPrinter';

export interface ReceiptPreviewModalProps {
  open: boolean;
  data: ReceiptData | null;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ open, data, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const kotRef = useRef<HTMLDivElement>(null);
  const { renderReceiptHtml, renderKotHtml, printHtml } = useThermalPrinter();
  const [printing, setPrinting] = useState(false);

  if (!open || !data) return null;

  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const printData = { ...data };
      // Generate Raast QR if enabled
      if (data.settings?.raast?.raastOnReceipt && data.settings?.raast?.iban && data.settings?.raast?.accountTitle) {
        try {
          const m = (await import('sendkardo-qr')) as any;
          const ibanNorm = m.normalizePakistaniIban(data.settings.raast.iban);
          if (m.isValidPakistaniIban(ibanNorm)) {
            const qrUrl = await m.createRaastQrDataUrl(
              { iban: ibanNorm, amount: data.total },
              { width: 160, margin: 1 }
            );
            printData.settings = { ...data.settings, raastQrDataUrl: qrUrl };
          }
        } catch (e) {
          console.error('raast qr gen failed', e);
        }
      }
      const html = renderReceiptHtml(printData);
      printHtml(html);
    } finally {
      setPrinting(false);
    }
  };

  const handleKot = () => {
    if (printing) return;
    setPrinting(true);
    try {
      const html = renderKotHtml(data);
      printHtml(html);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-4 bg-[#F4F0EA] w-full max-w-md flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
        <h2 className="font-black uppercase text-xl">Receipt Preview</h2>
        <div ref={ref} className="border-4 border-black bg-white p-2 max-h-96 overflow-y-auto">
          <ThermalReceipt {...data} />
        </div>
        <div className="hidden" ref={kotRef}>
          <KitchenTicket
            orderNumber={data.orderNumber}
            orderType={data.orderType}
            tableNumber={data.tableNumber}
            customerName={data.customerName}
            items={data.items}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={printing}>
            Close
          </Button>
          <Button variant="info" className="flex-1" onClick={handleKot} disabled={printing}>
            Print KOT
          </Button>
          <Button variant="success" className="flex-1" onClick={handlePrint} disabled={printing}>
            {printing ? 'Printing...' : 'Print'}
          </Button>
        </div>
      </div>
    </div>
  );
};
