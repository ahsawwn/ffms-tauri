import { getDb } from './client';
import { kitchenHistory } from './schema';

export async function logKitchenStatus(orderId: string, status: string) {
  const db = await getDb();
  await db.insert(kitchenHistory).values({ id: crypto.randomUUID(), orderId, status });
}

export async function fetchKitchenHistory() {
  const db = await getDb();
  return db.select().from(kitchenHistory);
}
