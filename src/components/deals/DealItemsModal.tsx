import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface DealItemsModalProps {
  open: boolean;
  deal: any;
  products: any[];
  items: any[];
  onClose: () => void;
  onAdd: (productId: string, quantity: number) => void;
  onDelete: (id: string) => void;
}

export const DealItemsModal: React.FC<DealItemsModalProps> = ({ open, deal, products, items, onClose, onAdd, onDelete }) => {
  const [selected, setSelected] = useState(products[0]?.id ?? '');
  const [qty, setQty] = useState('1');
  if (!open || !deal) return null;
  const dealComponents = items.filter((i) => i.dealId === deal.id);
  const availableProducts = products.filter((p) => p.id !== deal.id);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-lg flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-black uppercase text-xl">Deal Items: {deal.name}</h2>
          <Button size="sm" variant="danger" onClick={onClose}>Close</Button>
        </div>
        <div className="flex gap-2">
          <select className="brutal-input flex-1" value={selected} onChange={(e) => setSelected(e.target.value)}>
            {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="brutal-input w-20" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          <Button variant="success" onClick={() => onAdd(selected, Number(qty) || 1)}>Add</Button>
        </div>
        <div className="flex flex-col gap-2">
          {dealComponents.map((it) => {
            const p = products.find((x) => x.id === it.productId);
            return (
              <div key={it.id} className="flex items-center justify-between border-2 border-black p-2 bg-[#F4F0EA]">
                <span className="font-bold text-sm">{p?.name} x {it.quantity}</span>
                <div className="flex gap-2">
                  <Badge variant="yellow">PKR {((p?.price ?? 0) * it.quantity).toFixed(0)}</Badge>
                  <Button size="sm" variant="danger" onClick={() => onDelete(it.id)}>Del</Button>
                </div>
              </div>
            );
          })}
          {dealComponents.length === 0 && <p className="text-xs font-bold text-black/50">No items in this deal</p>}
        </div>
      </div>
    </div>
  );
};
