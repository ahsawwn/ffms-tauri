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

  const handlePrint = () => {
    // Render a dedicated print page (popup-blocker safe) instead of printing the preview innerHTML.
    const printWin = window.open('', '_blank', 'width=360,height=640,noopener=yes');
    if (printWin) {
      try {
        printWin.document.write(renderReceiptHtml(data));
        printWin.document.close();
        printWin.focus();
      } catch (e) {
        console.error('receipt print write failed', e);
        printReceipt(ref.current?.innerHTML ?? '');
      }
    } else {
      printReceipt(ref.current?.innerHTML ?? '');
    }
  };

  const handleKot = () => {
    const printWin = window.open('', '_blank', 'width=360,height=640,noopener=yes');
    if (printWin) {
      try {
        printWin.document.write(renderKotHtml(data));
        printWin.document.close();
        printWin.focus();
      } catch (e) {
        console.error('kot print write failed', e);
        printKot(kotRef.current?.innerHTML ?? '');
      }
    } else {
      printKot(kotRef.current?.innerHTML ?? '');
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
