import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface VariantSelectorModalProps {
  open: boolean;
  product: any;
  variants: any[];
  addons: any[];
  onClose: () => void;
  onConfirm: (variantId: string | null, addonIds: string[]) => void;
}

export const VariantSelectorModal: React.FC<VariantSelectorModalProps> = ({ open, product, variants, addons, onClose, onConfirm }) => {
  const [variantId, setVariantId] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  if (!open || !product) return null;
  const pVariants = variants.filter((v) => v.productId === product.id && v.isAvailable);
  const pAddons = addons.filter((a) => (!a.productId || a.productId === product.id) && a.isAvailable);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
        <h2 className="font-black uppercase text-xl">{product.name}</h2>
        {pVariants.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase">Variant</span>
            {pVariants.map((v) => (
              <label key={v.id} className="flex items-center gap-2 text-sm font-bold">
                <input type="radio" name="variant" checked={variantId === v.id} onChange={() => setVariantId(v.id)} />
                {v.name} (+PKR {v.priceDelta})
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="radio" name="variant" checked={variantId === null} onChange={() => setVariantId(null)} />
              Standard
            </label>
          </div>
        )}
        {pAddons.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase">Add-ons</span>
            {pAddons.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={addonIds.includes(a.id)} onChange={(e) => setAddonIds(e.target.checked ? [...addonIds, a.id] : addonIds.filter((x) => x !== a.id))} />
                {a.name} (+PKR {a.price})
              </label>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => { onConfirm(variantId, addonIds); onClose(); }}>Add to Cart</Button>
        </div>
      </div>
    </div>
  );
};
