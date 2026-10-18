import React, { useEffect, useState } from 'react';
import { fetchCategories, fetchProducts, addProduct, deleteProduct } from '../db/posQueries';
import { fetchDealItems, addDealItem, deleteDealItem } from '../db/dealQueries';
import { DealItemsModal } from '../components/deals/DealItemsModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DealsView: React.FC = () => {
  const [cats, setCats] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dealItems, setDealItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [editingDeal, setEditingDeal] = useState<any>(null);

  const load = async () => {
    const [c, p, d] = await Promise.all([fetchCategories(), fetchProducts(), fetchDealItems()]);
    setCats(c); setProducts(p); setDealItems(d);
  };
  useEffect(() => { void load(); }, []);

  const dealCatId = cats.find((x: any) => x.slug === 'deals')?.id;
  const deals = products.filter((p: any) => p.categoryId === dealCatId);

  const handleAdd = async () => {
    if (!dealCatId || !name) return;
    await addProduct({ categoryId: dealCatId, name, description: 'Deal package', price: Number(price), costPrice: Number(cost), isAvailable: true, status: 'AVAILABLE' });
    setName(''); setPrice(''); setCost('');
    await load();
  };

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <h2 className="font-black uppercase text-2xl">Deals & Packages</h2>
      <div className="brutal-card p-4 bg-white flex gap-2 flex-wrap">
        <input className="brutal-input flex-1" placeholder="Deal name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="brutal-input w-24" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="brutal-input w-24" type="number" placeholder="Cost" value={cost} onChange={(e) => setCost(e.target.value)} />
        <Button variant="success" onClick={handleAdd}>Add Deal</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {deals.map((d) => {
          const comps = dealItems.filter((i) => i.dealId === d.id);
          return (
            <div key={d.id} className="brutal-card p-3 bg-white flex flex-col gap-2">
              <h3 className="font-black uppercase">{d.name}</h3>
              <Badge variant="yellow">PKR {d.price}</Badge>
              <span className="text-xs font-bold">{comps.length} items</span>
              <div className="flex gap-2">
                <Button size="sm" variant="info" onClick={() => setEditingDeal(d)}>Edit Items</Button>
                <Button size="sm" variant="danger" onClick={() => void deleteProduct(d.id).then(load)}>Delete</Button>
              </div>
            </div>
          );
        })}
      </div>
      <DealItemsModal open={!!editingDeal} deal={editingDeal} products={products} items={dealItems} onClose={() => setEditingDeal(null)}
        onAdd={(pid, qty) => void addDealItem(editingDeal.id, pid, qty).then(load)}
        onDelete={(id) => void deleteDealItem(id).then(load)} />
    </div>
  );
};
