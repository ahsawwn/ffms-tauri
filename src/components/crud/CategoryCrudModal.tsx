import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface CategoryCrudModalProps {
  open: boolean;
  initial?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const CategoryCrudModal: React.FC<CategoryCrudModalProps> = ({ open, initial, onClose, onSave }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '🍽️');
  const [order, setOrder] = useState(initial?.displayOrder ?? 0);
  const [active, setActive] = useState(initial?.isActive ?? true);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
        <h2 className="font-black uppercase text-xl">{initial ? 'Edit Category' : 'Add Category'}</h2>
        <input className="brutal-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="brutal-input" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className="brutal-input" placeholder="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
        <input className="brutal-input" type="number" placeholder="Display Order" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => { onSave({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), icon, displayOrder: order, isActive: active, id: initial?.id }); onClose(); }}>Save</Button>
        </div>
      </div>
    </div>
  );
};
