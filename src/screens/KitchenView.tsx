import React, { useEffect, useState } from 'react';
import { fetchKitchenOrders, updateKitchenStatus } from '../db/kitchenQueries';
import { logKitchenStatus } from '../db/kitchenHistoryQueries';
import { fetchProducts } from '../db/posQueries';
import { fetchOrderItems } from '../db/invoiceQueries';
import { fetchTables, setTableStatus } from '../db/tableQueries';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const KitchenView: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, string>>({});
  const [itemsMap, setItemsMap] = useState<Record<string, any[]>>({});

  const load = async () => {
    const dbOrders = await fetchKitchenOrders();
    const products = await fetchProducts();
    // Sync from mobile API
    try {
      const apiOrders = await (await fetch('/api/kitchen/orders')).json();
      for (const ao of apiOrders) {
        const dbOrder = dbOrders.find((o:any) => o.id === ao.id);
        if (dbOrder && ao.kitchenStatus && ao.kitchenStatus !== dbOrder.kitchenStatus) {
          await updateKitchenStatus(ao.id, ao.kitchenStatus);
          dbOrder.kitchenStatus = ao.kitchenStatus;
        }
        if (!dbOrder) {
          // push DB? skip unknown
        }
      }
      // push DB orders to API
      for (const dbo of dbOrders) {
        await fetch('/api/kitchen/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: { id: dbo.id, orderNumber: dbo.orderNumber, orderType: dbo.orderType, tableNumber: dbo.tableNumber, customerName: dbo.customerName, kitchenStatus: dbo.kitchenStatus, items: [] } }) });
      }
    } catch (e) {}
    const o = await fetchKitchenOrders();
    setOrders(o);
    setProducts(Object.fromEntries(products.map((x: any) => [x.id, x.name])));
    const map: Record<string, any[]> = {};
    for (const ord of o) map[ord.id] = await fetchOrderItems(ord.id);
    setItemsMap(map);
  };
  useEffect(() => { void load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  const advance = async (id: string, status: string) => {
    await updateKitchenStatus(id, status);
    await logKitchenStatus(id, status);
    try { await fetch('/api/kitchen/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, kitchenStatus: status }) }); } catch (e) {}
    if (status === 'SERVED') {
      const o = orders.find((x: any) => x.id === id);
      if (o?.tableNumber) {
        const tbls = await fetchTables();
        const tbl = tbls.find((t: any) => t.name === o.tableNumber);
        if (tbl) await setTableStatus(tbl.id, 'SERVED');
      }
    }
    await load();
  };

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <h2 className="font-black uppercase text-2xl">Kitchen Queue</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((o) => (
          <div key={o.id} className="brutal-card p-4 bg-white flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-black uppercase">{o.orderNumber}</span>
              <Badge variant={o.kitchenStatus === 'READY' ? 'lime' : o.kitchenStatus === 'PREPARING' ? 'cyan' : 'orange'}>{o.kitchenStatus}</Badge>
            </div>
            <div className="text-sm font-bold">{o.orderType} {o.tableNumber ? `Table ${o.tableNumber}` : ''} {o.customerName ? o.customerName : ''}</div>
            {(itemsMap[o.id] ?? []).map((it: any) => (
              <div key={it.id} className="text-sm font-bold border-b border-black/20 pb-1">
                {it.quantity}x {products[it.productId] ?? it.productId}
              </div>
            ))}
            <div className="flex gap-2">
              <Button size="sm" variant="info" onClick={() => advance(o.id, 'PREPARING')}>Preparing</Button>
              <Button size="sm" variant="success" onClick={() => advance(o.id, 'READY')}>Ready</Button>
              <Button size="sm" variant="outline" onClick={() => advance(o.id, 'SERVED')}>Served</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
