import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { categories } from '../../db/schema';

type Cat = typeof categories.$inferSelect;

export interface CategoryManagerProps {
  categories: Cat[];
  onAdd: (data: { name: string; slug: string; icon: string; displayOrder: number }) => void;
  onDelete: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍽️');
  return (
    <div className="brutal-card p-4 bg-white flex flex-col gap-3">
      <h2 className="font-black uppercase text-lg">Categories</h2>
      <div className="flex gap-2">
        <input className="brutal-input flex-1" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="brutal-input w-16" value={icon} onChange={(e) => setIcon(e.target.value)} />
        <Button variant="success" onClick={() => { if (name) { onAdd({ name, slug: name.toLowerCase().replace(/\s+/g, '-'), icon, displayOrder: categories.length + 1 }); setName(''); } }}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <Badge variant="cyan">{c.icon} {c.name}</Badge>
            <Button size="sm" variant="danger" onClick={() => onDelete(c.id)}>X</Button>
          </div>
        ))}
      </div>
    </div>
  );
};
