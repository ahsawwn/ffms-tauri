import React, { useEffect, useState } from 'react';
import { fetchOrders, fetchOrderItems, fetchUsersMap } from '../db/invoiceQueries';
import { fetchProducts } from '../db/posQueries';
import { fetchReceiptSettings } from '../db/userQueries';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ReceiptPreviewModal } from '../components/receipts/ReceiptPreviewModal';
import { exportCsv, exportXlsx, exportPdf } from '../utils/exportInvoices';

export const InvoicesView: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [receipt, setReceipt] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState('');
  const [type, setType] = useState('');

  const load = async () => {
    const [o, u, p, s] = await Promise.all([fetchOrders(), fetchUsersMap(), fetchProducts(), fetchReceiptSettings()]);
    setOrders(o); setUsers(u); setProducts(Object.fromEntries(p.map((x: any) => [x.id, x.name]))); setSettings(s);
  };
  useEffect(() => { void load(); }, []);

  const filtered = orders.filter((o) => {
    const searchOk = search ? String(o.orderNumber).toLowerCase().includes(search.toLowerCase()) : true;
    const statusOk = status ? o.status === status : true;
    const paymentOk = payment ? o.paymentMethod === payment : true;
    const typeOk = type ? o.orderType === type : true;
    return searchOk && statusOk && paymentOk && typeOk;
  });

  const openDetail = async (o: any) => {
    setDetail(o);
    setItems(await fetchOrderItems(o.id));
  };

  const reprint = async (o: any) => {
    const its = await fetchOrderItems(o.id);
    const rItems = its.map((it: any) => ({ name: products[it.productId] ?? it.productId, quantity: it.quantity, unitPrice: it.unitPrice, note: '' }));
    const subtotal = rItems.reduce((s: number, i: any) => s + i.unitPrice * i.quantity, 0);
    const printSettings = { ...settings };
    if (settings?.raast?.raastOnReceipt && settings?.raast?.iban && settings?.raast?.accountTitle) {
      try {
        const m = (await import('sendkardo-qr')) as any;
        printSettings.raastQrDataUrl = await m.createRaastQrDataUrl({ iban: settings.raast.iban, amount: Number(o.totalAmount) }, { width: 200, margin: 1 });
      } catch (e) { console.error('raast qr gen failed', e); }
    }
    setReceipt({
      orderNumber: o.orderNumber,
      orderType: o.orderType,
      items: rItems,
      subtotal,
      tax: 0,
      discount: 0,
      total: o.totalAmount,
      cashReceived: o.totalAmount,
      change: 0,
      cashier: users[o.userId] ?? o.userId,
      settings: printSettings,
      tableNumber: o.tableNumber,
      customerName: o.customerName,
    });
  };

  const fmtDate = (d: any) => {
    if (!d || d === 'CURRENT_TIMESTAMP') return '—';
    try { return new Date(d).toLocaleString(); } catch { return String(d); }
  };

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <h2 className="font-black uppercase text-2xl">Invoices</h2>
      <div className="flex gap-2 flex-wrap">
        <input className="brutal-input flex-1 min-w-[160px]" placeholder="Search order #" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="brutal-input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All Status</option><option value="COMPLETED">Completed</option><option value="PENDING">Pending</option><option value="CANCELLED">Cancelled</option></select>
        <select className="brutal-input" value={payment} onChange={(e) => setPayment(e.target.value)}><option value="">All Payments</option><option value="CASH">Cash</option><option value="CARD">Card</option><option value="ONLINE">Online</option><option value="RAAST">Raast</option></select>
        <select className="brutal-input" value={type} onChange={(e) => setType(e.target.value)}><option value="">All Types</option><option value="DINE_IN">Dine In</option><option value="TAKEAWAY">Takeaway</option><option value="DELIVERY">Delivery</option></select>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => exportCsv(filtered, users, products)}>Export CSV</Button>
        <Button variant="outline" size="sm" onClick={() => exportXlsx(filtered, users, products)}>Export XLSX</Button>
        <Button variant="outline" size="sm" onClick={() => exportPdf(filtered, users, products)}>Export PDF</Button>
      </div>
      <div className="brutal-card p-4 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b-3 border-black">
            <th className="p-2 text-left font-black uppercase">Order #</th>
            <th className="p-2 text-left font-black uppercase">Date</th>
            <th className="p-2 text-left font-black uppercase">Cashier</th>
            <th className="p-2 text-left font-black uppercase">Type</th>
            <th className="p-2 text-left font-black uppercase">Payment</th>
            <th className="p-2 text-left font-black uppercase">Total</th>
            <th className="p-2 text-left font-black uppercase">Status</th>
            <th className="p-2 text-left font-black uppercase">Action</th>
          </tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b-2 border-black/20">
                <td className="p-2 font-bold">{o.orderNumber}</td>
                <td className="p-2">{fmtDate(o.createdAt)}</td>
                <td className="p-2">{users[o.userId] ?? o.userId}</td>
                <td className="p-2">{o.orderType}</td>
                <td className="p-2">{o.paymentMethod}</td>
                <td className="p-2 font-black">PKR {o.totalAmount}</td>
                <td className="p-2"><Badge variant={o.status === 'COMPLETED' ? 'lime' : 'orange'}>{o.status}</Badge></td>
                <td className="p-2 flex gap-1">
                  <Button size="sm" variant="info" onClick={() => openDetail(o)}>View</Button>
                  <Button size="sm" variant="success" onClick={() => reprint(o)}>Reprint</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
            <h2 className="font-black uppercase text-xl">{detail.orderNumber}</h2>
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm font-bold border-b border-black/20 pb-1">
                <span>{it.quantity}x {products[it.productId] ?? it.productId}</span>
                <span>PKR {it.unitPrice * it.quantity}</span>
              </div>
            ))}
            <div className="font-black">Total: PKR {detail.totalAmount}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
              <Button variant="success" onClick={() => reprint(detail)}>Reprint</Button>
            </div>
          </div>
        </div>
      )}
      <ReceiptPreviewModal open={!!receipt} data={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
};
