import { eq, asc } from 'drizzle-orm';
import { getDb } from './client';
import { categories, products, inventoryItems, productRecipes, orders, orderItems, productVariants, productAddons } from './schema';
import { deductBaseRecipes, deductAddons } from '../services/inventoryDeductionService';

export async function fetchCategories() {
  const db = await getDb();
  return db.select().from(categories).orderBy(asc(categories.displayOrder));
}

export async function addCategory(data: { name: string; slug?: string; icon?: string; displayOrder?: number }) {
  const db = await getDb();
  await db.insert(categories).values({ id: crypto.randomUUID(), ...data });
}
export async function updateCategory(id: string, data: any) {
  const db = await getDb();
  await db.update(categories).set(data).where(eq(categories.id, id));
}
export async function deleteCategory(id: string) {
  const db = await getDb();
  await db.delete(categories).where(eq(categories.id, id));
}

export async function fetchProducts() {
  const db = await getDb();
  return db.select().from(products);
}

export async function fetchInventory() {
  const db = await getDb();
  return db.select().from(inventoryItems);
}

export async function fetchRecipes() {
  const db = await getDb();
  return db.select().from(productRecipes);
}

export async function fetchVariants() {
  const db = await getDb();
  return db.select().from(productVariants);
}
export async function fetchAddons() {
  const db = await getDb();
  return db.select().from(productAddons);
}

export async function submitOrder(input: {
  userId: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'PICKUP' | 'DELIVERY';
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE' | 'RAAST';
  items: { productId: string; quantity: number; unitPrice: number; variantId?: string; variantName?: string; addons?: any[] }[];
  totalAmount: number;
  tableNumber?: string;
  serviceCharge?: number;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
}) {
  const db = await getDb();
  const orderId = crypto.randomUUID();
  const orderNumber = `ORD-${Date.now()}`;
  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    userId: input.userId,
    orderType: input.orderType,
    tableNumber: input.tableNumber ?? null,
    serviceCharge: input.serviceCharge ?? 0,
    customerName: input.customerName ?? null,
    customerPhone: input.customerPhone ?? null,
    deliveryAddress: input.deliveryAddress ?? null,
    totalAmount: input.totalAmount,
    paymentMethod: input.paymentMethod,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
  });
  for (const item of input.items) {
    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId,
      productId: item.productId,
      variantId: item.variantId ?? null,
      variantName: item.variantName ?? null,
      addonsJson: JSON.stringify(item.addons ?? []),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
    const recs = await db.select().from(productRecipes).where(eq(productRecipes.productId, item.productId));
    await deductBaseRecipes(db, item.productId, item.variantId ?? null, item.quantity, recs);
    await deductAddons(db, item.addons ?? [], item.quantity);
  }
  return orderId;
}

export async function addProduct(data: any) {
  const db = await getDb();
  await db.insert(products).values({ id: crypto.randomUUID(), ...data });
}

export async function updateProduct(id: string, data: any) {
  const db = await getDb();
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: string) {
  const db = await getDb();
  await db.delete(products).where(eq(products.id, id));
}
