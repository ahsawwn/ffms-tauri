import { eq, sql } from 'drizzle-orm';
import { inventoryItems } from '../db/schema';

export async function deductBaseRecipes(tx: any, productId: string, variantId: string | null, quantity: number, recipes: any[]) {
  const recs = recipes.filter((r: any) => r.productId === productId && (!r.variantId || r.variantId === variantId));
  for (const rec of recs) {
    const amount = rec.requiredQuantity * quantity;
    await tx.update(inventoryItems).set({ quantity: sql`${inventoryItems.quantity} - ${amount}` }).where(eq(inventoryItems.id, rec.inventoryItemId));
  }
}

export async function deductAddons(tx: any, addons: any[], quantity: number) {
  for (const addon of addons ?? []) {
    if (addon.inventoryItemId && addon.requiredQuantity) {
      const amount = addon.requiredQuantity * quantity;
      await tx.update(inventoryItems).set({ quantity: sql`${inventoryItems.quantity} - ${amount}` }).where(eq(inventoryItems.id, addon.inventoryItemId));
    }
  }
}
