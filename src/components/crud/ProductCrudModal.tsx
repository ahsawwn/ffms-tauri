import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface ProductCrudModalProps {
  open: boolean;
  categories: any[];
  initial?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const ProductCrudModal: React.FC<ProductCrudModalProps> = ({ open, categories, initial, onClose, onSave }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [cost, setCost] = useState(initial?.costPrice ?? '');
  const [image, setImage] = useState(initial?.imageUrl ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'AVAILABLE');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
        <h2 className="font-black uppercase text-xl">{initial ? 'Edit Product' : 'Add Product'}</h2>
        <input className="brutal-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="brutal-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="brutal-input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Cost Price" value={cost} onChange={(e) => setCost(e.target.value)} />
        <input className="brutal-input" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
        <select className="brutal-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="AVAILABLE">AVAILABLE</option><option value="SUSPENDED">SUSPENDED</option><option value="UNAVAILABLE">UNAVAILABLE</option>
        </select>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => { onSave({ id: initial?.id, name, categoryId, description, price: Number(price), costPrice: Number(cost), imageUrl: image, status, isAvailable: status === 'AVAILABLE' }); onClose(); }}>Save</Button>
        </div>
      </div>
    </div>
  );
};
