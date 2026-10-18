import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { orders, orderItems, users } from './schema';

export async function fetchOrders() {
  const db = await getDb();
  return db.select().from(orders);
}

export async function fetchOrderItems(orderId: string) {
  const db = await getDb();
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function fetchUsersMap() {
  const db = await getDb();
  const rows = await db.select().from(users);
  return Object.fromEntries(rows.map((u: any) => [u.id, u.name]));
}
