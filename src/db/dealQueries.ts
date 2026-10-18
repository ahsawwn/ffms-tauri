import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { dealItems } from './schema';

export async function fetchDealItems(dealId?: string) {
  const db = await getDb();
  const rows = await db.select().from(dealItems);
  return dealId ? rows.filter((r: any) => r.dealId === dealId) : rows;
}

export async function addDealItem(dealId: string, productId: string, quantity: number) {
  const db = await getDb();
  await db.insert(dealItems).values({ id: crypto.randomUUID(), dealId, productId, quantity });
}

export async function updateDealItem(id: string, quantity: number) {
  const db = await getDb();
  await db.update(dealItems).set({ quantity }).where(eq(dealItems.id, id));
}

export async function deleteDealItem(id: string) {
  const db = await getDb();
  await db.delete(dealItems).where(eq(dealItems.id, id));
}
