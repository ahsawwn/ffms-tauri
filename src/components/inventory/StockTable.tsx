import React from 'react';
import type { inventoryItems } from '../../db/schema';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

type Item = typeof inventoryItems.$inferSelect;

export interface StockTableProps {
  items: Item[];
  onRestock: (item: Item) => void;
  onDelete: (id: string) => void;
}

export const StockTable: React.FC<StockTableProps> = ({ items, onRestock, onDelete }) => (
  <div className="brutal-card p-4 bg-white overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-3 border-black">
          <th className="text-left font-black uppercase p-2">Ingredient</th>
          <th className="text-left font-black uppercase p-2">Unit</th>
          <th className="text-left font-black uppercase p-2">Qty</th>
          <th className="text-left font-black uppercase p-2">Min</th>
          <th className="text-left font-black uppercase p-2">Cost/Unit</th>
          <th className="text-left font-black uppercase p-2">Status</th>
          <th className="text-left font-black uppercase p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const low = item.quantity < item.minStockLevel;
          return (
            <tr key={item.id} className="border-b-2 border-black/20">
              <td className="p-2 font-bold">{item.name}</td>
              <td className="p-2">{item.unit}</td>
              <td className="p-2 font-black">{item.quantity}</td>
              <td className="p-2">{item.minStockLevel}</td>
              <td className="p-2">PKR {item.costPerUnit}</td>
              <td className="p-2"><Badge variant={low ? 'pink' : 'lime'}>{low ? 'Low' : 'OK'}</Badge></td>
              <td className="p-2 flex gap-2">
                <Button size="sm" variant="info" onClick={() => onRestock(item)}>Restock</Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(item.id)}>Del</Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
