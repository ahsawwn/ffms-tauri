import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { tables } from './schema';

export async function fetchTables() {
  const db = await getDb();
  return db.select().from(tables);
}

export async function addTable(data: { name: string; capacity: number }) {
  const db = await getDb();
  await db.insert(tables).values({ id: crypto.randomUUID(), ...data, status: 'AVAILABLE' });
}

export async function updateTable(id: string, data: any) {
  const db = await getDb();
  await db.update(tables).set(data).where(eq(tables.id, id));
}

export async function deleteTable(id: string) {
  const db = await getDb();
  await db.delete(tables).where(eq(tables.id, id));
}

export async function reserveTable(id: string, name: string, phone: string) {
  const db = await getDb();
  await db.update(tables).set({ status: 'RESERVED', reservedName: name, reservedPhone: phone, reservedAt: new Date().toISOString() }).where(eq(tables.id, id));
}

export async function setTableStatus(id: string, status: string, orderId?: string) {
  const db = await getDb();
  await db.update(tables).set({ status, currentOrderId: orderId ?? null }).where(eq(tables.id, id));
}

export async function freeTable(id: string) {
  const db = await getDb();
  await db.update(tables).set({ status: 'AVAILABLE', currentOrderId: null, reservedName: null, reservedPhone: null, reservedAt: null }).where(eq(tables.id, id));
}
