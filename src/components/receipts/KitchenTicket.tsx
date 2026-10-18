import React from 'react';

export interface KitchenTicketProps {
  orderNumber: string;
  orderType: string;
  tableNumber?: string;
  customerName?: string;
  items: { name: string; quantity: number; note?: string }[];
  metadata?: any;
}

export const KitchenTicket: React.FC<KitchenTicketProps> = ({ orderNumber, orderType, tableNumber, customerName, items }) => (
  <div className="bg-white text-black font-mono mx-auto p-2" style={{ width: '80mm' }}>
    <div className="text-center text-2xl font-black">*** KOT ***</div>
    <div className="text-center text-xl font-black">{orderType}</div>
    {tableNumber && <div className="text-center text-lg font-black">Table: {tableNumber}</div>}
    {customerName && <div className="text-center text-lg font-black">Name: {customerName}</div>}
    <div className="border-t border-dashed border-black my-1" />
    <div className="text-sm font-black">Order: {orderNumber}</div>
    <div className="border-t border-dashed border-black my-1" />
    {items.map((it, idx) => (
      <div key={idx} className="text-lg font-black">
        {it.quantity}x {it.name} {it.note ? `(${it.note})` : ''}
      </div>
    ))}
    <div className="border-t border-dashed border-black my-1" />
    <div className="text-center text-xs">Rush Order</div>
  </div>
);
