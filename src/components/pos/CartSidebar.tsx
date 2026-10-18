import React from 'react';
import type { CartItem } from '../../types/pos';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { OrderTypeBar } from './OrderTypeBar';
import { Plus, Minus, Trash2 } from 'lucide-react';

export interface CartSidebarProps {
  items: CartItem[];
  onQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onNote: (productId: string, note: string) => void;
  taxRate: number;
  onTaxToggle: () => void;
  discount: number;
  onDiscount: (value: number) => void;
  onCheckout: () => void;
  onClear: () => void;
  onHold: () => void;
  onRecall: () => void;
  orderType: string;
  setOrderType: (t: string) => void;
  tables?: any[];
  metadata: any;
  setMetadata: (m: any) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = (props) => {
  const { items, onQty, onRemove, onNote, taxRate, onTaxToggle, discount, onDiscount, onCheckout, onClear, onHold, onRecall, orderType, setOrderType, metadata, setMetadata, tables } = props;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * taxRate;
  const service = metadata?.serviceCharge ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + tax + service - discount);

  return (
    <div className="brutal-card p-4 bg-white flex flex-col gap-3 h-full">
      <h2 className="font-black uppercase text-lg border-b-3 border-black pb-2">Live Cart</h2>
      <OrderTypeBar tables={tables} orderType={orderType} setOrderType={setOrderType} metadata={metadata} setMetadata={setMetadata} />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
        {items.length === 0 && <p className="text-xs font-bold text-black/50 uppercase">Cart empty</p>}
        {items.map((item) => (
          <div key={item.productId + (item.variantId ?? '')} className="border-2 border-black p-2 bg-[#F4F0EA]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-sm uppercase">{item.name}{item.variantName ? ` (${item.variantName})` : ''}</span>
              <Badge variant="yellow">PKR {(item.price * item.quantity).toFixed(0)}</Badge>
            </div>
            {item.addons?.length ? <p className="text-[10px] font-bold">+ {item.addons.map((a) => a.name).join(', ')}</p> : null}
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => onQty(item.productId, -1)}><Minus className="w-3 h-3" /></Button>
              <span className="font-black">{item.quantity}</span>
              <Button size="sm" variant="outline" onClick={() => onQty(item.productId, 1)}><Plus className="w-3 h-3" /></Button>
              <Button size="sm" variant="danger" onClick={() => onRemove(item.productId)}><Trash2 className="w-3 h-3" /></Button>
            </div>
            <input className="brutal-input w-full text-xs mt-2" placeholder="Notes" value={item.note} onChange={(e) => onNote(item.productId, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="border-t-3 border-black pt-2 flex flex-col gap-1 text-xs font-black uppercase">
        <div className="flex justify-between"><span>Subtotal</span><span>PKR {subtotal.toFixed(0)}</span></div>
        <div className="flex justify-between"><span>Tax {(taxRate * 100).toFixed(0)}%</span><span>PKR {tax.toFixed(0)}</span></div>
        {service > 0 && <div className="flex justify-between"><span>Service</span><span>PKR {service.toFixed(0)}</span></div>}
        <div className="flex justify-between items-center">
          <span>Discount</span>
          <input className="brutal-input w-20 text-xs" type="number" value={discount} onChange={(e) => onDiscount(Number(e.target.value) || 0)} />
        </div>
        <div className="flex justify-between text-base"><span>Total</span><span>PKR {total.toFixed(0)}</span></div>
      </div>
      <div className="flex gap-2">
        <Button variant="danger" size="sm" onClick={onClear}>Clear</Button>
        <Button variant="warning" size="sm" onClick={onHold}>Hold</Button>
        <Button variant="info" size="sm" onClick={onRecall}>Recall</Button>
        <Button variant="info" size="sm" onClick={onTaxToggle}>Tax</Button>
        <Button variant="success" className="flex-1" onClick={onCheckout} disabled={items.length === 0}>Checkout</Button>
      </div>
    </div>
  );
};
