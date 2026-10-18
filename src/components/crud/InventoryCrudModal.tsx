import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface InventoryCrudModalProps {
  open: boolean;
  initial?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const InventoryCrudModal: React.FC<InventoryCrudModalProps> = ({ open, initial, onClose, onSave }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? 'pcs');
  const [quantity, setQuantity] = useState(initial?.quantity ?? 0);
  const [minStock, setMinStock] = useState(initial?.minStockLevel ?? 0);
  const [cost, setCost] = useState(initial?.costPerUnit ?? 0);
  const [active, setActive] = useState(initial?.isActive ?? true);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
        <h2 className="font-black uppercase text-xl">{initial ? 'Edit Ingredient' : 'Add Ingredient'}</h2>
        <input className="brutal-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="brutal-input" placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        <input className="brutal-input" type="number" placeholder="Min Stock" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} />
        <input className="brutal-input" type="number" placeholder="Cost/Unit" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => { onSave({ id: initial?.id, name, unit, quantity, minStockLevel: minStock, costPerUnit: cost, isActive: active }); onClose(); }}>Save</Button>
        </div>
      </div>
    </div>
  );
};
