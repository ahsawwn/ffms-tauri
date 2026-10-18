import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, fetchProducts, fetchInventory, fetchRecipes, fetchVariants, fetchAddons, submitOrder } from '../db/posQueries';
import { fetchReceiptSettings } from '../db/userQueries';
import { broadcastCustomerDisplay } from '../utils/customerDisplay';
import { fetchTables, setTableStatus } from '../db/tableQueries';
import type { CartItem, OrderMetadata } from '../types/pos';
import type { products, inventoryItems, productRecipes } from '../db/schema';
import type { ReceiptData } from '../components/receipts/ThermalReceipt';
type Product = typeof products.$inferSelect;
type Inv = typeof inventoryItems.$inferSelect;
type Rec = typeof productRecipes.$inferSelect;
export function usePosTerminal() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inv[]>([]);
  const [recipes, setRecipes] = useState<Rec[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(0.05);
  const [discount, setDiscount] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [metadata, setMetadata] = useState<OrderMetadata>({} as OrderMetadata);
  const load = async () => {
    const [c, p, i, r, v, a, s] = await Promise.all([fetchCategories(), fetchProducts(), fetchInventory(), fetchRecipes(), fetchVariants(), fetchAddons(), fetchReceiptSettings()]);
    setCategories(c); setProducts(p); setInventory(i); setRecipes(r); setVariants(v); setAddons(a); setSettings(s);
    if (s?.printerName) localStorage.setItem('nerve_printer_name', s.printerName);
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (orderType !== 'DINE_IN' || !metadata.tableNumber || cart.length === 0) return;
    fetchTables().then((tbls) => {
      const tbl = tbls.find((t:any) => t.name === metadata.tableNumber);
      if (tbl && tbl.status === 'AVAILABLE') void setTableStatus(tbl.id, 'OCCUPIED');
    });
  }, [orderType, metadata.tableNumber, cart.length]);

  // Broadcast current cart to customer display
  useEffect(() => {
    const items = cart.map((i: any) => ({ name: i.name + (i.variantName ? ' (' + i.variantName + ')' : ''), quantity: i.quantity, price: i.price }));
    const subtotal = cart.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const tax = subtotal * taxRate;
    const service = metadata.serviceCharge ? subtotal * 0.1 : 0;
    const total = Math.max(0, subtotal + tax + service - discount);
    if (cart.length === 0) {
      broadcastCustomerDisplay({ status: 'idle', items: [], total: 0, restaurantName: settings?.restaurantName, logoUrl: settings?.logoUrl });
    } else {
      broadcastCustomerDisplay({ status: 'ordering', items, subtotal, tax, total, restaurantName: settings?.restaurantName, logoUrl: settings?.logoUrl });
    }
  }, [cart, taxRate, discount, metadata.serviceCharge, settings]);
  const available = (p: Product) => {
    const recs = recipes.filter((r) => r.productId === p.id && !r.variantId);
    if (recs.length === 0) return !!p.isAvailable && p.status === 'AVAILABLE';
    return recs.every((r) => { const inv = inventory.find((i) => i.id === r.inventoryItemId); return !!inv && inv.quantity >= r.requiredQuantity; }) && !!p.isAvailable && p.status === 'AVAILABLE';
  };
  const warning = (p: Product) => {
    const recs = recipes.filter((r) => r.productId === p.id && !r.variantId);
    if (recs.some((r) => { const inv = inventory.find((i) => i.id === r.inventoryItemId); return !!inv && inv.quantity < inv.minStockLevel; })) return 'Low Stock';
    return undefined;
  };
  const addToCartBase = (p: Product, variantId: string | null, addonIds: string[]) => {
    const variant = variants.find((v) => v.id === variantId);
    const selectedAddons = addons.filter((a) => addonIds.includes(a.id));
    const price = p.price + (variant?.priceDelta ?? 0) + selectedAddons.reduce((s, a) => s + a.price, 0);
    setCart((prev) => {
      const vid = variantId ?? undefined;
      const ex = prev.find((i) => i.productId === p.id && i.variantId === vid && JSON.stringify((i.addons ?? []).map((a:any) => a.id)) === JSON.stringify(addonIds));
      if (ex) return prev.map((i) => i === ex ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: p.id, name: p.name, price, quantity: 1, note: '', variantId: variantId ?? undefined, variantName: variant?.name, addons: selectedAddons.map((a) => ({ id: a.id, name: a.name, price: a.price, inventoryItemId: a.inventoryItemId, requiredQuantity: a.requiredQuantity })) }];
    });
  };
  const handleProductClick = (p: Product) => {
    const hasVariants = variants.some((v) => v.productId === p.id && v.isAvailable);
    const hasAddons = addons.some((a) => (!a.productId || a.productId === p.id) && a.isAvailable);
    if (hasVariants || hasAddons) setVariantProduct(p);
    else addToCartBase(p, null, []);
  };
  const updateQty = (id: string, delta: number) => setCart((prev) => prev.map((i) => i.productId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.productId !== id));
  const setNote = (id: string, note: string) => setCart((prev) => prev.map((i) => i.productId === id ? { ...i, note } : i));
  const filtered = products.filter((p) => {
    const catOk = selectedCat ? p.categoryId === selectedCat : true;
    const searchOk = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true;
    return catOk && searchOk;
  });
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * taxRate;
  const service = metadata.serviceCharge ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + tax + service - discount);
  const confirmPayment = async (method: 'CASH' | 'CARD' | 'ONLINE' | 'RAAST', cash: number) => {
    if (!user) return;
    const tbls = await fetchTables();
    const tbl = tbls.find((t:any) => t.name === metadata.tableNumber);
    const orderId = await submitOrder({
      userId: user.id,
      orderType: orderType as any,
      paymentMethod: method,
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.price, variantId: i.variantId, variantName: i.variantName, addons: i.addons })),
      totalAmount: total,
      tableNumber: metadata.tableNumber,
      serviceCharge: service,
      customerName: metadata.customerName,
      customerPhone: metadata.customerPhone,
      deliveryAddress: metadata.deliveryAddress,
    });
    setReceipt({
      orderNumber: `ORD-${Date.now()}`,
      orderType,
      items: cart.map((i) => ({ name: i.name + (i.variantName ? ` (${i.variantName})` : ''), quantity: i.quantity, unitPrice: i.price, note: i.note })),
      subtotal,
      tax,
      discount,
      total,
      cashReceived: cash || total,
      change: (cash || total) - total,
      cashier: user.name,
      settings,
      tableNumber: metadata.tableNumber,
      customerName: metadata.customerName,
    });
    if (tbl) await setTableStatus(tbl.id, 'OCCUPIED', undefined);
    if (tbl) await setTableStatus(tbl.id, 'OCCUPIED', orderId);
    try { await fetch('/api/kitchen/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: { id: orderId, orderNumber: `ORD-${Date.now()}`, orderType, tableNumber: metadata.tableNumber, customerName: metadata.customerName, kitchenStatus: 'NEW', items: cart.map((i:any) => ({ name: i.name + (i.variantName ? ` (${i.variantName})` : ''), quantity: i.quantity })) } }) }); } catch (e) {}
    setCart([]);
    setPayOpen(false);
    broadcastCustomerDisplay({ status: 'paid', items: [], total: 0, restaurantName: settings?.restaurantName });
    setTimeout(() => broadcastCustomerDisplay({ status: 'idle', items: [], total: 0, restaurantName: settings?.restaurantName }), 4000);
    await load();
  };
  return {
    user, categories, products, inventory, recipes, variants, addons, settings, cart, setCart, search, setSearch, selectedCat, setSelectedCat, taxRate, setTaxRate, discount, setDiscount, payOpen, setPayOpen, receipt, setReceipt, variantProduct, setVariantProduct, customOpen, setCustomOpen, orderType, setOrderType, metadata, setMetadata, available, warning, handleProductClick, addToCartBase, updateQty, removeItem, setNote, filtered, subtotal, tax, service, total, confirmPayment, load,
  };
}
