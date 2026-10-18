import React from 'react';

export interface ReceiptItem { name: string; quantity: number; unitPrice: number; note?: string; }
export interface ReceiptData {
  orderNumber: string;
  orderType: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  cashReceived: number;
  change: number;
  cashier: string;
  settings: any;
  tableNumber?: string;
  customerName?: string;
}

export const ThermalReceipt: React.FC<ReceiptData> = ({ orderNumber, orderType, items, subtotal, tax, discount, total, cashReceived, change, cashier, settings }) => {
  const width = settings?.printerWidth === '58mm' ? '58mm' : '80mm';
  return (
    <div className="bg-white text-black font-mono mx-auto p-1" style={{ width, fontSize: '11px', lineHeight: 1.15 }}>
      {settings?.showLogo && settings?.logoUrl && (
        <div className="text-center mb-1">
          <img src={settings.logoUrl} alt="logo" style={{ maxWidth: '50%', maxHeight: '40px', margin: '0 auto', display: 'block' }} />
        </div>
      )}
      {settings?.showLogo && !settings?.logoUrl && <div className="text-center text-base font-bold uppercase">{settings?.restaurantName ?? 'Nerve Fast Food'}</div>}
      {settings?.showLogo && settings?.logoUrl && <div className="text-center text-sm font-bold uppercase">{settings?.restaurantName ?? 'Nerve Fast Food'}</div>}
      <div className="text-center text-[10px]">{settings?.tagline}</div>
      <div className="text-center text-[10px]">{settings?.address}</div>
      <div className="text-center text-[10px]">Tel: {settings?.phone}</div>
      <div className="text-center text-[10px]">TRN: {settings?.taxRegistrationNumber}</div>
      <div className="border-t border-dashed border-black my-1" />
      <div className="text-[11px] flex justify-between"><span>Order:</span><span>{orderNumber}</span></div>
      <div className="text-[11px] flex justify-between"><span>Type:</span><span>{orderType}</span></div>
      <div className="text-[11px] flex justify-between"><span>Cashier:</span><span>{cashier}</span></div>
      {settings?.tableNumber && <div className="text-[11px] flex justify-between"><span>Table:</span><span>{settings.tableNumber}</span></div>}
      <div className="border-t border-dashed border-black my-1" />
      {items.map((it, idx) => (
        <div key={idx} className="text-[11px] flex justify-between gap-2">
          <span className="flex-1 min-w-0 break-words">{it.quantity}x {it.name}</span>
          <span className="flex-shrink-0 text-right">{(it.quantity * it.unitPrice).toFixed(0)}</span>
        </div>
      ))}
      <div className="border-t border-dashed border-black my-1" />
      <div className="text-[11px] flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(0)}</span></div>
      <div className="text-[11px] flex justify-between"><span>Tax</span><span>{tax.toFixed(0)}</span></div>
      <div className="text-[11px] flex justify-between"><span>Discount</span><span>-{discount.toFixed(0)}</span></div>
      <div className="text-[11px] flex justify-between font-bold border-t border-dashed border-black pt-1 mt-1"><span>Total</span><span>{total.toFixed(0)}</span></div>
      <div className="text-[11px] flex justify-between"><span>Cash</span><span>{cashReceived.toFixed(0)}</span></div>
      <div className="text-[11px] flex justify-between"><span>Change</span><span>{change.toFixed(0)}</span></div>
      {settings?.raastQrDataUrl && (
        <>
          <div className="border-t border-dashed border-black my-1" />
          <div className="text-center text-[10px] font-bold">PAY VIA RAAST</div>
          <div className="text-center"><img src={settings.raastQrDataUrl} alt="raast qr" style={{ width: '40mm', height: '40mm', margin: '2px auto', display: 'block' }} /></div>
          <div className="text-center text-[9px]">{settings?.raast?.accountTitle}</div>
          <div className="text-center text-[9px]">{settings?.raast?.iban}</div>
        </>
      )}
      <div className="border-t border-dashed border-black my-1" />
      <div className="text-center text-[10px]">{settings?.footerMessage}</div>
      <div className="text-center text-[9px] mt-1 tracking-widest">|||| |||| ||||</div>
    </div>
  );
};
