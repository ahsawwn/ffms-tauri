import React from 'react';
import type { categories } from '../../db/schema';
import { Button } from '../ui/Button';

type Category = typeof categories.$inferSelect;

export interface CategoryBarProps {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories, selected, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto pb-2">
    <Button variant={selected === null ? 'primary' : 'outline'} size="sm" onClick={() => onSelect(null)}>All</Button>
    {categories.map((c) => (
      <Button key={c.id} variant={selected === c.id ? 'primary' : 'outline'} size="sm" onClick={() => onSelect(c.id)}>
        {c.icon} {c.name}
      </Button>
    ))}
  </div>
);
