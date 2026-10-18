import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { inventoryItems, productRecipes } from './schema';

export async function addIngredient(data: { name: string; unit: string; quantity: number; minStockLevel: number; costPerUnit: number }) {
  const db = await getDb();
  await db.insert(inventoryItems).values({ id: crypto.randomUUID(), ...data });
}

export async function updateIngredient(id: string, data: Partial<{ name: string; unit: string; quantity: number; minStockLevel: number; costPerUnit: number }>) {
  const db = await getDb();
  await db.update(inventoryItems).set(data).where(eq(inventoryItems.id, id));
}

export async function restockIngredient(id: string, amount: number) {
  const db = await getDb();
  const rows = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
  if (rows[0]) await db.update(inventoryItems).set({ quantity: rows[0].quantity + amount }).where(eq(inventoryItems.id, id));
}

export async function deleteIngredient(id: string) {
  const db = await getDb();
  await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
}

export async function addRecipeLine(data: { productId: string; inventoryItemId: string; requiredQuantity: number }) {
  const db = await getDb();
  await db.insert(productRecipes).values({ id: crypto.randomUUID(), ...data });
}

export async function deleteRecipeLine(id: string) {
  const db = await getDb();
  await db.delete(productRecipes).where(eq(productRecipes.id, id));
}

export async function updateRecipeLine(id: string, requiredQuantity: number) {
  const db = await getDb();
  await db.update(productRecipes).set({ requiredQuantity }).where(eq(productRecipes.id, id));
}
