import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface CustomProductModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: { name: string; price: number; quantity: number }) => void;
}

export const CustomProductModal: React.FC<CustomProductModalProps> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
        <h2 className="font-black uppercase text-xl">Custom Item</h2>
        <input className="brutal-input" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => { if (name) { onAdd({ name, price: Number(price), quantity: Number(qty) || 1 }); onClose(); } }}>Add</Button>
        </div>
      </div>
    </div>
  );
};
