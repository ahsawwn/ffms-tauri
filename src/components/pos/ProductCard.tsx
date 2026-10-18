import React from 'react';
import type { products } from '../../db/schema';
import { Badge } from '../ui/Badge';

type Product = typeof products.$inferSelect;

export interface ProductCardProps {
  product: Product;
  available: boolean;
  warning?: string;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, available, warning, onAdd }) => (
  <button
    type="button"
    disabled={!available || !product.isAvailable}
    onClick={() => onAdd(product)}
    className={`brutal-card p-3 bg-[var(--bg-surface)] text-left flex flex-col gap-2 ${available && product.isAvailable ? 'brutal-card-hover' : 'opacity-50 cursor-not-allowed'}`}
  >
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-black uppercase text-sm leading-tight">{product.name}</h3>
      <Badge variant={product.isAvailable ? 'lime' : 'pink'}>{product.isAvailable ? 'Available' : 'Off'}</Badge>
    </div>
    <p className="text-xs font-bold text-black/60 line-clamp-2">{product.description}</p>
    <div className="flex items-center justify-between mt-auto">
      <span className="font-black text-lg">PKR {product.price.toFixed(0)}</span>
      {warning && <Badge variant="orange">{warning}</Badge>}
    </div>
  </button>
);
