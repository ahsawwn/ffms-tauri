import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface AddProductModalProps {
  open: boolean;
  categories: any[];
  onClose: () => void;
  onSave: (data: any) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ open, categories, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [available, setAvailable] = useState(true);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
        <h2 className="font-black uppercase text-xl">Add Product</h2>
        <input className="brutal-input" placeholder="Name (e.g. Big Mac)" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="brutal-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="brutal-input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Cost Price" value={cost} onChange={(e) => setCost(e.target.value)} />
        <label className="flex items-center gap-2 font-bold text-sm">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Available
        </label>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => {
            onSave({ name, categoryId, description, price: Number(price), costPrice: Number(cost), isAvailable: available });
            onClose();
          }}>Save</Button>
        </div>
      </div>
    </div>
  );
};
