import React from 'react';
import { usePosTerminal } from '../hooks/usePosTerminal';
import { CategoryBar } from '../components/pos/CategoryBar';
import { ProductCard } from '../components/pos/ProductCard';
import { CartSidebar } from '../components/pos/CartSidebar';
import { PaymentModal } from '../components/pos/PaymentModal';
import { VariantSelectorModal } from '../components/pos/VariantSelectorModal';
import { CustomProductModal } from '../components/pos/CustomProductModal';
import { ReceiptPreviewModal } from '../components/receipts/ReceiptPreviewModal';
import { Button } from '../components/ui/Button';
import { fetchTables, freeTable } from '../db/tableQueries';
import { holdCart, fetchHeldOrders, fetchHeldItems, cancelHeldOrder } from '../db/cartQueries';
import { fetchProducts } from '../db/posQueries';

export const POSTerminal: React.FC = () => {
  const h = usePosTerminal();
  const [tables, setTables] = React.useState<any[]>([]);
  React.useEffect(() => { void fetchTables().then(setTables); }, []);
  const [heldOpen, setHeldOpen] = React.useState(false);
  const [heldOrders, setHeldOrders] = React.useState<any[]>([]);
  const loadHeld = async () => setHeldOrders(await fetchHeldOrders());
  const handleHold = async () => { if (h.cart.length === 0 || !h.user) return; await holdCart({ userId: h.user.id, orderType: h.orderType, tableNumber: h.metadata.tableNumber, serviceCharge: h.metadata.serviceCharge ? h.subtotal * 0.1 : 0, customerName: h.metadata.customerName, customerPhone: h.metadata.customerPhone, deliveryAddress: h.metadata.deliveryAddress, totalAmount: h.total, items: h.cart.map((i:any) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.price, variantId: i.variantId, variantName: i.variantName, addons: i.addons })) }); h.setCart([]); await loadHeld(); };
  const handleRecall = async (order: any) => { const items = await fetchHeldItems(order.id); const products = await fetchProducts(); const cartItems = items.map((it:any) => ({ productId: it.productId, name: products.find((p:any) => p.id === it.productId)?.name ?? it.productId, price: it.unitPrice, quantity: it.quantity, note: '', variantId: it.variantId, variantName: it.variantName, addons: it.addonsJson ? JSON.parse(it.addonsJson) : [] })); h.setCart(cartItems); await cancelHeldOrder(order.id); setHeldOpen(false); await loadHeld(); };
  return (
    <div className="grid grid-cols-12 gap-4 h-full p-4">
      <div className="col-span-8 flex flex-col gap-3">
        <div className="flex gap-2">
          <input className="brutal-input flex-1" placeholder="Search items..." value={h.search} onChange={(e) => h.setSearch(e.target.value)} />
          <Button variant="outline" size="sm" onClick={() => h.setCustomOpen(true)}>Custom</Button>
        </div>
        <CategoryBar categories={h.categories} selected={h.selectedCat} onSelect={h.setSelectedCat} />
        <div className="grid grid-cols-3 gap-3 overflow-y-auto">
          {h.filtered.map((p: any) => (
            <ProductCard key={p.id} product={p} available={h.available(p)} warning={h.warning(p)} onAdd={h.handleProductClick} />
          ))}
        </div>
      </div>
      <div className="col-span-4 min-h-0 overflow-hidden">
        <CartSidebar items={h.cart} onQty={h.updateQty} onRemove={h.removeItem} onNote={h.setNote} taxRate={h.taxRate}
          onTaxToggle={() => h.setTaxRate((t: number) => (t === 0.05 ? 0.16 : 0.05))} discount={h.discount} onDiscount={h.setDiscount}
          onCheckout={() => h.setPayOpen(true)} onClear={() => { void (async () => { const tbls = await fetchTables(); const tbl = tbls.find((t:any) => t.name === h.metadata.tableNumber); if (tbl && !tbl.currentOrderId) await freeTable(tbl.id); h.setCart([]); })(); }} onHold={handleHold} onRecall={() => { loadHeld(); setHeldOpen(true); }} orderType={h.orderType} setOrderType={h.setOrderType} metadata={h.metadata} setMetadata={h.setMetadata} tables={tables} />
      </div>
      <PaymentModal open={h.payOpen} total={h.total} settings={h.settings} onClose={() => h.setPayOpen(false)} onConfirm={h.confirmPayment} />
      <VariantSelectorModal open={!!h.variantProduct} product={h.variantProduct} variants={h.variants} addons={h.addons} onClose={() => h.setVariantProduct(null)} onConfirm={(v, a) => { if (h.variantProduct) h.addToCartBase(h.variantProduct, v, a); h.setVariantProduct(null); }} />
      <CustomProductModal open={h.customOpen} onClose={() => h.setCustomOpen(false)} onAdd={(item) => h.setCart((prev: any) => [...prev, { productId: crypto.randomUUID(), name: item.name, price: item.price, quantity: item.quantity, note: '' }])} />
      <ReceiptPreviewModal open={!!h.receipt} data={h.receipt} onClose={() => h.setReceipt(null)} />
      {heldOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="brutal-card p-4 bg-white w-full max-w-md flex flex-col gap-2 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center"><h2 className="font-black uppercase text-xl">Held Carts</h2><Button size="sm" variant="danger" onClick={() => setHeldOpen(false)}>Close</Button></div>
            {heldOrders.map((o:any) => (
              <div key={o.id} className="border-2 border-black p-2 flex justify-between items-center">
                <div className="text-xs font-bold">{o.orderNumber} - PKR {o.totalAmount}</div>
                <Button size="sm" variant="success" onClick={() => handleRecall(o)}>Recall</Button>
              </div>
            ))}
            {heldOrders.length === 0 && <p className="text-xs font-bold">No held carts</p>}
          </div>
        </div>
      )}
    </div>
  );
};
