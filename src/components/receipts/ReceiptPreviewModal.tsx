import React, { useRef } from 'react';
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
  const { printReceipt, printKot, renderReceiptHtml, renderKotHtml } = useThermalPrinter();
  if (!open || !data) return null;

  const handlePrint = async () => {
    const printData = { ...data };
    if (data.settings?.raast?.raastOnReceipt && data.settings?.raast?.iban && data.settings?.raast?.accountTitle) {
      try {
        const QRCode = (await import('qrcode')) as any;
        const payload = 'RAAST\nIBAN: ' + data.settings.raast.iban + '\nTitle: ' + data.settings.raast.accountTitle + '\nAmount: ' + data.total.toFixed(2);
        const qrUrl = await QRCode.toDataURL(payload, { width: 200, margin: 1 });
        printData.settings = { ...data.settings, raastQrDataUrl: qrUrl };
      } catch (e) { console.error('raast qr gen failed', e); }
    }
    const styled = renderReceiptHtml(printData);
    const win = window.open('', '_blank', 'width=360,height=640,noopener=yes');
    if (win) {
      try {
        win.document.write(styled);
        win.document.close();
        win.focus();
        setTimeout(() => { try { win.focus(); win.print(); } catch (e) { console.error('print failed', e); } }, 500);
        setTimeout(() => { try { win.close(); } catch (e) {} }, 1500);
      } catch (e) {
        console.error('receipt print write failed', e);
        printReceipt(styled);
      }
    } else {
      printReceipt(styled);
    }
  };

  const handleKot = () => {
    const styled = renderKotHtml(data);
    const win = window.open('', '_blank', 'width=360,height=640,noopener=yes');
    if (win) {
      try {
        win.document.write(styled);
        win.document.close();
        win.focus();
        setTimeout(() => { try { win.focus(); win.print(); } catch (e) { console.error('kot print failed', e); } }, 500);
        setTimeout(() => { try { win.close(); } catch (e) {} }, 1500);
      } catch (e) {
        console.error('kot print write failed', e);
        printKot(styled);
      }
    } else {
      printKot(styled);
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
          <KitchenTicket orderNumber={data.orderNumber} orderType={data.orderType} tableNumber={data.tableNumber} customerName={data.customerName} items={data.items} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          <Button variant="info" className="flex-1" onClick={handleKot}>Print KOT</Button>
          <Button variant="success" className="flex-1" onClick={handlePrint}>Print</Button>
        </div>
      </div>
    </div>
  );
}
