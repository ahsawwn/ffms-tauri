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
    <div className="bg-white text-black font-mono mx-auto p-2" style={{ width }}>
      {settings?.showLogo && settings?.logoUrl && (
        <div className="text-center mb-1">
          <img src={settings.logoUrl} alt="logo" style={{ maxWidth: '60%', maxHeight: '60px', margin: '0 auto' }} />
        </div>
      )}
      {settings?.showLogo && !settings?.logoUrl && <div className="text-center text-2xl font-black">{settings?.restaurantName ?? 'Nerve Fast Food'}</div>}
      <div className="text-center text-xs">{settings?.tagline}</div>
      <div className="text-center text-xs">{settings?.address}</div>
      <div className="text-center text-xs">Tel: {settings?.phone}</div>
      <div className="text-center text-xs">TRN: {settings?.taxRegistrationNumber}</div>
      <div className="border-t border-dashed border-black my-1" />
      <div className="text-xs">Order: {orderNumber}</div>
      <div className="text-xs">Type: {orderType}</div>
      <div className="text-xs">Cashier: {cashier}</div>
      {settings?.showLogo && settings?.logoUrl && <div className="text-center text-2xl font-black mt-1">{settings?.restaurantName ?? 'Nerve Fast Food'}</div>}
      <div className="border-t border-dashed border-black my-1" />
      {items.map((it, idx) => (
        <div key={idx} className="text-xs flex justify-between">
          <span>{it.quantity}x {it.name}</span>
          <span>{(it.quantity * it.unitPrice).toFixed(0)}</span>
        </div>
      ))}
      <div className="border-t border-dashed border-black my-1" />
      <div className="text-xs flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(0)}</span></div>
      <div className="text-xs flex justify-between"><span>Tax</span><span>{tax.toFixed(0)}</span></div>
      <div className="text-xs flex justify-between"><span>Discount</span><span>-{discount.toFixed(0)}</span></div>
      <div className="text-xs flex justify-between font-black"><span>Total</span><span>{total.toFixed(0)}</span></div>
      <div className="text-xs flex justify-between"><span>Cash</span><span>{cashReceived.toFixed(0)}</span></div>
      <div className="text-xs flex justify-between"><span>Change</span><span>{change.toFixed(0)}</span></div>
      <div className="border-t border-dashed border-black my-1" />
      <div className="text-center text-xs">{settings?.footerMessage}</div>
      <div className="text-center text-xs mt-1">|||| |||| ||||</div>
    </div>
  );
};
