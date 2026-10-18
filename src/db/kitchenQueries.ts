import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { orders } from './schema';

export async function fetchKitchenOrders() {
  const db = await getDb();
  const rows = await db.select().from(orders);
  return rows.filter((o: any) => o.status === 'COMPLETED' && o.kitchenStatus !== 'SERVED');
}

export async function updateKitchenStatus(orderId: string, status: string) {
  const db = await getDb();
  await db.update(orders).set({ kitchenStatus: status }).where(eq(orders.id, orderId));
}
