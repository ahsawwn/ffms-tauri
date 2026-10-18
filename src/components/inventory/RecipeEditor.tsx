import React, { useState, useEffect } from 'react';
import type { products, inventoryItems, productRecipes } from '../../db/schema';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

type Product = typeof products.$inferSelect;
type Inv = typeof inventoryItems.$inferSelect;
type Rec = typeof productRecipes.$inferSelect;

export interface RecipeEditorProps {
  products: Product[];
  inventory: Inv[];
  recipes: Rec[];
  initialProductId?: string;
  onAddLine: (productId: string, inventoryItemId: string, qty: number) => void;
  onDeleteLine: (id: string) => void;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ products, inventory, recipes, initialProductId, onAddLine, onDeleteLine }) => {
  const [productId, setProductId] = useState(initialProductId ?? products[0]?.id ?? '');
  useEffect(() => { if (initialProductId) setProductId(initialProductId); }, [initialProductId]);
  const [invId, setInvId] = useState(inventory[0]?.id ?? '');
  const [qty, setQty] = useState('1');
  const selectedProduct = products.find((p) => p.id === productId);
  const lines = recipes.filter((r) => r.productId === productId);
  const cost = lines.reduce((s, r) => {
    const inv = inventory.find((i) => i.id === r.inventoryItemId);
    return s + (inv ? inv.costPerUnit * r.requiredQuantity : 0);
  }, 0);
  const margin = selectedProduct ? selectedProduct.price - cost : 0;

  return (
    <div className="brutal-card p-4 bg-white flex flex-col gap-3">
      <h2 className="font-black uppercase text-lg">Recipe Editor</h2>
      <select className="brutal-input" value={productId} onChange={(e) => setProductId(e.target.value)}>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <div className="flex gap-2">
        <select className="brutal-input flex-1" value={invId} onChange={(e) => setInvId(e.target.value)}>
          {inventory.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <input className="brutal-input w-24" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
        <Button variant="success" onClick={() => onAddLine(productId, invId, Number(qty))}>Add</Button>
      </div>
      <div className="flex flex-col gap-1">
        {lines.map((r) => {
          const inv = inventory.find((i) => i.id === r.inventoryItemId);
          return (
            <div key={r.id} className="flex items-center justify-between border-2 border-black p-2 bg-[#F4F0EA]">
              <span className="font-bold text-sm">{inv?.name} x {r.requiredQuantity} {inv?.unit}</span>
              <Button size="sm" variant="danger" onClick={() => onDeleteLine(r.id)}>Del</Button>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Badge variant="cyan">Cost: PKR {cost.toFixed(0)}</Badge>
        <Badge variant="lime">Price: PKR {selectedProduct?.price.toFixed(0)}</Badge>
        <Badge variant={margin >= 0 ? 'lime' : 'pink'}>Margin: PKR {margin.toFixed(0)}</Badge>
      </div>
    </div>
  );
};
