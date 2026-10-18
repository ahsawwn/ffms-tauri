import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { orders, orderItems } from './schema';
import { deductBaseRecipes, deductAddons } from '../services/inventoryDeductionService';
import { fetchRecipes } from './posQueries';

export async function holdCart(input: any) {
  const db = await getDb();
  const orderId = crypto.randomUUID();
  await db.insert(orders).values({
    id: orderId,
    orderNumber: `HOLD-${Date.now()}`,
    userId: input.userId,
    orderType: input.orderType,
    tableNumber: input.tableNumber ?? null,
    serviceCharge: input.serviceCharge ?? 0,
    customerName: input.customerName ?? null,
    customerPhone: input.customerPhone ?? null,
    deliveryAddress: input.deliveryAddress ?? null,
    totalAmount: input.totalAmount,
    paymentMethod: null,
    status: 'HELD',
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
  }
  return orderId;
}

export async function fetchHeldOrders() {
  const db = await getDb();
  return db.select().from(orders).where(eq(orders.status, 'HELD'));
}

export async function fetchHeldItems(orderId: string) {
  const db = await getDb();
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function cancelHeldOrder(orderId: string) {
  const db = await getDb();
  await db.update(orders).set({ status: 'CANCELLED' }).where(eq(orders.id, orderId));
}

export async function completeHeldOrder(orderId: string, paymentMethod: string) {
  const db = await getDb();
  const recipes = await fetchRecipes();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  await db.update(orders).set({ status: "COMPLETED", paymentMethod: paymentMethod as any, kitchenStatus: "NEW" }).where(eq(orders.id, orderId));
  for (const item of items) {
    const recs = recipes.filter((r: any) => r.productId === item.productId && (!r.variantId || r.variantId === item.variantId));
    await deductBaseRecipes(db, item.productId, item.variantId, item.quantity, recs);
    const addons = item.addonsJson ? JSON.parse(item.addonsJson) : [];
    await deductAddons(db, addons, item.quantity);
  }
}
