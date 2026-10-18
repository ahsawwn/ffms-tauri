import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';

const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
const KEY = 'nerve_web_kitchen_orders';
const DEMO_KITCHEN_PIN = '5555';
const seed = [
  { id: 'w1', orderNumber: 'WEB-001', orderType: 'DINE_IN', tableNumber: 'Table 1', kitchenStatus: 'NEW', items: [{ name: 'Zinger Burger', quantity: 2 }] },
  { id: 'w2', orderNumber: 'WEB-002', orderType: 'TAKEAWAY', kitchenStatus: 'PREPARING', items: [{ name: 'Fries', quantity: 1 }] },
];
function loadWeb() {
  const raw = localStorage.getItem(KEY);
  if (!raw) { localStorage.setItem(KEY, JSON.stringify(seed)); return seed; }
  try { return JSON.parse(raw); } catch { return seed; }
}
function saveWeb(data: any[]) { localStorage.setItem(KEY, JSON.stringify(data)); }

export const MobileKitchenView: React.FC = () => {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('kitchen_unlocked') === 'true');
  const [kitchenPin, setKitchenPin] = useState(DEMO_KITCHEN_PIN);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTauri) {
      import('../db/userQueries').then(({ fetchReceiptSettings }) => {
        fetchReceiptSettings().then((s: any) => setKitchenPin(s?.kitchenPin ?? DEMO_KITCHEN_PIN));
      });
    } else {
      setKitchenPin(localStorage.getItem('kitchen_pin') ?? DEMO_KITCHEN_PIN);
    }
  }, []);

  const load = async () => {
    if (!unlocked) return;
    setLoading(true);
    try {
      if (isTauri) {
        const { fetchKitchenOrders } = await import('../db/kitchenQueries');
        const { fetchProducts } = await import('../db/posQueries');
        const { fetchOrderItems } = await import('../db/invoiceQueries');
        const o = await fetchKitchenOrders();
        const p = await fetchProducts();
        const pm = Object.fromEntries(p.map((x: any) => [x.id, x.name]));
        const map: Record<string, any[]> = {};
        for (const ord of o) map[ord.id] = await fetchOrderItems(ord.id);
        setOrders(o.map((ord: any) => ({ ...ord, items: (map[ord.id] ?? []).map((it: any) => ({ name: pm[it.productId] ?? it.productId, quantity: it.quantity })) })));
      } else {
        try {
          const r = await fetch('/api/kitchen/orders');
          setOrders(await r.json());
        } catch {
          setOrders(loadWeb());
        }
      }
    } catch (e) {
      console.error('Mobile kitchen load failed', e);
      setOrders(loadWeb());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
    if (!unlocked) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [unlocked]);

  const submitPin = () => {
    if (pin === kitchenPin) {
      setUnlocked(true);
      sessionStorage.setItem('kitchen_unlocked', 'true');
      setError('');
    } else {
      setError('INVALID KITCHEN PIN');
      setPin('');
    }
  };

  const lock = () => {
    setUnlocked(false);
    sessionStorage.removeItem('kitchen_unlocked');
    setPin('');
    setError('');
  };

  const advance = async (id: string, status: string) => {
    if (isTauri) {
      const { updateKitchenStatus } = await import('../db/kitchenQueries');
      await updateKitchenStatus(id, status);
      const { logKitchenStatus } = await import('../db/kitchenHistoryQueries');
      await logKitchenStatus(id, status);
    } else {
      try {
        await fetch('/api/kitchen/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, kitchenStatus: status }) });
      } catch {
        const data = loadWeb().map((o: any) => o.id === id ? { ...o, kitchenStatus: status } : o);
        saveWeb(data);
        setOrders(data);
      }
    }
    await load();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-[#FF8800]';
      case 'PREPARING': return 'bg-[#22D3EE]';
      case 'READY': return 'bg-[#A3E635]';
      case 'SERVED': return 'bg-[#FFE600]';
      default: return 'bg-[#F4F0EA]';
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
        <div className="brutal-card p-6 bg-white w-full max-w-sm flex flex-col gap-4">
          <div className="text-center">
            <div className="p-2.5 bg-[#FFE600] border-3 border-black shadow-[3px_3px_0px_#000] inline-block">🍳</div>
            <h2 className="font-black uppercase text-2xl text-center">Kitchen Access</h2>
            <p className="text-[10px] font-bold text-black/60 uppercase">Mobile Kitchen Screen</p>
          </div>
          <input className="brutal-input text-center text-3xl tracking-widest" type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} />
          {error && <p className="text-xs font-black text-center text-[#FF6B8B] uppercase">{error}</p>}
          <button className={`brutal-btn py-3 ${statusColor(kitchenPin === '5555' ? '' : 'NEW')}`} onClick={submitPin}>Unlock</button>
          <p className="text-[10px] font-bold text-center text-black/40 uppercase">Demo Kitchen PIN: <span className="text-black">{DEMO_KITCHEN_PIN}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 flex flex-col gap-4 h-full overflow-y-auto bg-[var(--bg-app)]">
      <div className="flex items-center justify-between">
        <h2 className="font-black uppercase text-2xl">Mobile Kitchen</h2>
        <Button variant="danger" size="sm" onClick={lock}><span>🔒</span> Lock</Button>
      </div>
      {loading && <p className="text-center font-black text-xs uppercase">Syncing orders...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {orders.map((o) => (
          <div key={o.id} className="brutal-card p-4 bg-white flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-2xl uppercase">{o.orderNumber}</span>
              <span className={`font-black text-xs px-2 py-1 ${statusColor(o.kitchenStatus)}`}>{o.kitchenStatus}</span>
            </div>
            <div className="text-lg font-bold">{o.orderType} {o.tableNumber ? `• Table ${o.tableNumber}` : ''}</div>
            {(o.items ?? []).map((it: any, idx: number) => (
              <div key={idx} className="text-xl font-black border-b border-black/20 pb-1">{it.quantity}x {it.name}</div>
            ))}
            <div className="grid grid-cols-3 gap-2 mt-auto">
              {o.kitchenStatus !== 'READY' && <button className="brutal-btn py-3 text-lg bg-[#22D3EE]" onClick={() => advance(o.id, 'PREPARING')}>Preparing</button>}
              {o.kitchenStatus !== 'READY' && o.kitchenStatus !== 'SERVED' && <button className="brutal-btn py-3 text-lg bg-[#A3E635]" onClick={() => advance(o.id, 'READY')}>Ready</button>}
              <button className="brutal-btn py-3 text-lg bg-[#FFE600]" onClick={() => advance(o.id, 'SERVED')}>Served</button>
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="col-span-2 brutal-card p-8 bg-white text-center"><p className="font-black text-xl">No orders in queue</p></div>}
      </div>
    </div>
  );
}
