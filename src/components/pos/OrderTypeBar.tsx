import React from 'react';
import { Button } from '../ui/Button';

export interface OrderMetadata {
  tableNumber?: string;
  serviceCharge?: number;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
}

export interface OrderTypeBarProps {
  tables?: any[];
  orderType: string;
  setOrderType: (t: string) => void;
  metadata: OrderMetadata;
  setMetadata: (m: OrderMetadata) => void;
}

export const OrderTypeBar: React.FC<OrderTypeBarProps> = ({ tables = [], orderType, setOrderType, metadata, setMetadata }) => {
  const types = ['DINE_IN', 'TAKEAWAY', 'PICKUP', 'DELIVERY'];
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-1">
        {types.map((t) => (
          <Button key={t} size="sm" variant={orderType === t ? 'primary' : 'outline'} onClick={() => setOrderType(t)}>{t.replace('_', ' ')}</Button>
        ))}
      </div>
      {orderType === 'DINE_IN' && (
        <div className="flex gap-2">
          <select className="brutal-input flex-1" value={metadata.tableNumber ?? ''} onChange={(e) => setMetadata({ ...metadata, tableNumber: e.target.value })}>
            <option value="">Select Table</option>
            {tables.map((t:any) => <option key={t.id} value={t.name}>{t.name} ({t.status})</option>)}
          </select>
          <label className="flex items-center gap-1 text-xs font-black"><input type="checkbox" checked={!!metadata.serviceCharge} onChange={(e) => setMetadata({ ...metadata, serviceCharge: e.target.checked ? 0.1 : 0 })} /> Service Charge</label>
        </div>
      )}
      {orderType === 'PICKUP' && (
        <div className="flex gap-2">
          <input className="brutal-input flex-1" placeholder="Customer Name" value={metadata.customerName ?? ''} onChange={(e) => setMetadata({ ...metadata, customerName: e.target.value })} />
          <input className="brutal-input flex-1" placeholder="Phone" value={metadata.customerPhone ?? ''} onChange={(e) => setMetadata({ ...metadata, customerPhone: e.target.value })} />
        </div>
      )}
      {orderType === 'DELIVERY' && (
        <div className="flex flex-col gap-2">
          <input className="brutal-input" placeholder="Customer Name" value={metadata.customerName ?? ''} onChange={(e) => setMetadata({ ...metadata, customerName: e.target.value })} />
          <input className="brutal-input" placeholder="Phone" value={metadata.customerPhone ?? ''} onChange={(e) => setMetadata({ ...metadata, customerPhone: e.target.value })} />
          <input className="brutal-input" placeholder="Delivery Address" value={metadata.deliveryAddress ?? ''} onChange={(e) => setMetadata({ ...metadata, deliveryAddress: e.target.value })} />
        </div>
      )}
    </div>
  );
};
