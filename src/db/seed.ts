import { users, categories, products, inventoryItems, productRecipes, userPermissions, receiptSettings, tables } from './schema';

type Db = any;

export async function seedDatabase(db: Db) {
  const u = await db.select().from(users);
  if (u.length === 0) {
    await db.insert(users).values([
      { id: 'usr_owner_1', name: 'Owner', username: 'owner', pinCode: '9999', role: 'OWNER', status: 'ACTIVE' },
      { id: 'usr_mgr_1', name: 'Manager', username: 'manager', pinCode: '8888', role: 'MANAGER', status: 'ACTIVE' },
      { id: 'usr_cashier_1', name: 'Cashier', username: 'cashier1', pinCode: '1234', role: 'CASHIER', status: 'ACTIVE' },
      { id: 'usr_kitchen_1', name: 'Kitchen Staff', username: 'kitchen', pinCode: '5555', role: 'KITCHEN', status: 'ACTIVE' },
    ]);
  }

  const perms = await db.select().from(userPermissions);
  if (perms.length === 0) {
    const allUsers = await db.select().from(users);
    await db.insert(userPermissions).values(allUsers.map((u:any) => ({
      id: crypto.randomUUID(),
      userId: u.id,
      canAccessPos: true,
      canAccessInventory: u.role !== 'CASHIER',
      canAccessReports: u.role === 'OWNER',
      canAccessUsers: u.role === 'OWNER',
      canApplyDiscounts: u.role !== 'CASHIER',
      canVoidOrders: u.role === 'OWNER',
      canOpenDrawer: true,
      canAccessKitchen: u.role === 'KITCHEN',
    })));
  }
  const rs = await db.select().from(receiptSettings);
  if (rs.length === 0) {
    await db.insert(receiptSettings).values({ id: 'default' });
  }

  const allUsers = await db.select().from(users);
  if (!allUsers.some((u:any) => u.username === 'kitchen')) {
    await db.insert(users).values({ id: 'usr_kitchen_1', name: 'Kitchen Staff', username: 'kitchen', pinCode: '5555', role: 'KITCHEN', status: 'ACTIVE' });
    await db.insert(userPermissions).values({ id: crypto.randomUUID(), userId: 'usr_kitchen_1', canAccessKitchen: true });
  }

  const c = await db.select().from(categories);
  if (c.length === 0) {
    await db.insert(categories).values([
      { id: 'cat_burgers', name: 'Burgers', slug: 'burgers', icon: '🍔', displayOrder: 1 },
      { id: 'cat_wraps', name: 'Wraps', slug: 'wraps', icon: '🌯', displayOrder: 2 },
      { id: 'cat_chicken', name: 'Fried Chicken', slug: 'fried-chicken', icon: '🍗', displayOrder: 3 },
      { id: 'cat_fries', name: 'Fries', slug: 'fries', icon: '🍟', displayOrder: 4 },
      { id: 'cat_drinks', name: 'Beverages', slug: 'beverages', icon: '🥤', displayOrder: 5 },
      { id: 'cat_deals', name: 'Deals', slug: 'deals', icon: '🎯', displayOrder: 6 },
    ]);
  }

  const inv = await db.select().from(inventoryItems);
  if (inv.length === 0) {
    await db.insert(inventoryItems).values([
      { id: 'inv_patty', name: 'Chicken Patty', unit: 'pcs', quantity: 100, minStockLevel: 20, costPerUnit: 120 },
      { id: 'inv_bun', name: 'Burger Bun', unit: 'pcs', quantity: 120, minStockLevel: 30, costPerUnit: 30 },
      { id: 'inv_sauce', name: 'Zinger Sauce', unit: 'grams', quantity: 2000, minStockLevel: 300, costPerUnit: 2 },
      { id: 'inv_cheese', name: 'Cheese Slice', unit: 'pcs', quantity: 80, minStockLevel: 15, costPerUnit: 25 },
      { id: 'inv_fries', name: 'Frozen Fries', unit: 'grams', quantity: 5000, minStockLevel: 1000, costPerUnit: 1 },
      { id: 'inv_oil', name: 'Cooking Oil', unit: 'liters', quantity: 20, minStockLevel: 5, costPerUnit: 400 },
      { id: 'inv_coke', name: 'Coke Syrup', unit: 'liters', quantity: 10, minStockLevel: 2, costPerUnit: 800 },
      { id: 'inv_wrap', name: 'Tortilla Wrap', unit: 'pcs', quantity: 60, minStockLevel: 15, costPerUnit: 20 },
    ]);
  }

  const p = await db.select().from(products);
  if (p.length === 0) {
    await db.insert(products).values([
      { id: 'prod_zinger', categoryId: 'cat_burgers', name: 'Zinger Burger', description: 'Crispy chicken zinger', price: 650, costPrice: 220, isAvailable: true },
      { id: 'prod_beef', categoryId: 'cat_burgers', name: 'Beef Burger', description: 'Juicy beef patty', price: 750, costPrice: 300, isAvailable: true },
      { id: 'prod_wrap', categoryId: 'cat_wraps', name: 'Chicken Wrap', description: 'Grilled chicken wrap', price: 550, costPrice: 180, isAvailable: true },
      { id: 'prod_fries', categoryId: 'cat_fries', name: 'Regular Fries', description: 'Crispy fries', price: 250, costPrice: 80, isAvailable: true },
      { id: 'prod_coke', categoryId: 'cat_drinks', name: 'Coke', description: 'Chilled coke', price: 150, costPrice: 60, isAvailable: true },
      { id: 'prod_deal', categoryId: 'cat_deals', name: 'Zinger Deal', description: 'Zinger + Fries + Coke', price: 950, costPrice: 360, isAvailable: true },
    ]);
  }

  const allUsersNow = await db.select().from(users);
  const allPermsNow = await db.select().from(userPermissions);
  for (const u of allUsersNow) {
    if (!allPermsNow.some((p:any) => p.userId === u.id)) {
      await db.insert(userPermissions).values({ id: crypto.randomUUID(), userId: u.id, canAccessKitchen: u.role === 'KITCHEN', canAccessPos: true });
    }
  }
  const kPerm = allPermsNow.find((p:any) => p.userId === 'usr_kitchen_1');
  if (!kPerm) {
    await db.insert(userPermissions).values({ id: crypto.randomUUID(), userId: 'usr_kitchen_1', canAccessKitchen: true });
  }

  const t = await db.select().from(tables);
  if (t.length === 0) {
    await db.insert(tables).values([
      { id: 'tbl_1', name: 'Table 1', capacity: 2, status: 'AVAILABLE' },
      { id: 'tbl_2', name: 'Table 2', capacity: 4, status: 'AVAILABLE' },
      { id: 'tbl_3', name: 'Table 3', capacity: 4, status: 'AVAILABLE' },
      { id: 'tbl_4', name: 'Table 4', capacity: 6, status: 'AVAILABLE' },
    ]);
  }

  const r = await db.select().from(productRecipes);
  if (r.length === 0) {
    await db.insert(productRecipes).values([
      { id: 'rec_1', productId: 'prod_zinger', inventoryItemId: 'inv_patty', requiredQuantity: 1 },
      { id: 'rec_2', productId: 'prod_zinger', inventoryItemId: 'inv_bun', requiredQuantity: 1 },
      { id: 'rec_3', productId: 'prod_zinger', inventoryItemId: 'inv_sauce', requiredQuantity: 20 },
      { id: 'rec_4', productId: 'prod_zinger', inventoryItemId: 'inv_cheese', requiredQuantity: 1 },
      { id: 'rec_5', productId: 'prod_fries', inventoryItemId: 'inv_fries', requiredQuantity: 200 },
      { id: 'rec_6', productId: 'prod_fries', inventoryItemId: 'inv_oil', requiredQuantity: 0.05 },
      { id: 'rec_7', productId: 'prod_coke', inventoryItemId: 'inv_coke', requiredQuantity: 0.3 },
      { id: 'rec_8', productId: 'prod_wrap', inventoryItemId: 'inv_wrap', requiredQuantity: 1 },
      { id: 'rec_9', productId: 'prod_wrap', inventoryItemId: 'inv_patty', requiredQuantity: 1 },
    ]);
  }
}
