import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface AddIngredientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; unit: string; quantity: number; minStockLevel: number; costPerUnit: number }) => void;
}

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ open, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [quantity, setQuantity] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [cost, setCost] = useState('0');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
        <h2 className="font-black uppercase text-xl">Add Ingredient</h2>
        <input className="brutal-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="brutal-input" placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Min Stock" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Cost/Unit" value={cost} onChange={(e) => setCost(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => {
            onSave({ name, unit, quantity: Number(quantity), minStockLevel: Number(minStock), costPerUnit: Number(cost) });
            onClose();
          }}>Save</Button>
        </div>
      </div>
    </div>
  );
};
