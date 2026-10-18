import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { users, userPermissions, receiptSettings } from './schema';

export async function fetchUsers() {
  const db = await getDb();
  return db.select().from(users);
}

export async function addUser(data: { name: string; username: string; pinCode: string; role: 'OWNER' | 'MANAGER' | 'CASHIER'; status?: string }) {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.insert(users).values({ id, status: 'ACTIVE', ...data });
  await db.insert(userPermissions).values({ id: crypto.randomUUID(), userId: id });
  return id;
}

export async function updateUser(id: string, data: Partial<{ name: string; username: string; pinCode: string; role: any; status: string }>) {
  const db = await getDb();
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function deleteUser(id: string) {
  const db = await getDb();
  await db.delete(userPermissions).where(eq(userPermissions.userId, id));
  await db.delete(users).where(eq(users.id, id));
}

export async function fetchPermissions(userId: string) {
  const db = await getDb();
  const rows = await db.select().from(userPermissions).where(eq(userPermissions.userId, userId));
  return rows[0] ?? null;
}

export async function savePermissions(userId: string, data: any) {
  const db = await getDb();
  const rows = await db.select().from(userPermissions).where(eq(userPermissions.userId, userId));
  if (rows.length) {
    await db.update(userPermissions).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(userPermissions.userId, userId));
  } else {
    await db.insert(userPermissions).values({ id: crypto.randomUUID(), userId, ...data });
  }
}

export async function fetchReceiptSettings() {
  const db = await getDb();
  const rows = await db.select().from(receiptSettings);
  return rows[0] ?? null;
}

export async function saveReceiptSettings(data: any) {
  const db = await getDb();
  const rows = await db.select().from(receiptSettings);
  if (rows.length) {
    await db.update(receiptSettings).set(data).where(eq(receiptSettings.id, rows[0].id));
  } else {
    await db.insert(receiptSettings).values({ id: 'default', ...data });
  }
}
