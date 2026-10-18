import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  pinCode: text('pin_code').notNull(),
  role: text('role', { enum: ['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN'] }).notNull(),
  status: text('status').default('ACTIVE'),
});

export const userPermissions = sqliteTable('user_permissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  canAccessPos: integer('can_access_pos', { mode: 'boolean' }).default(true),
  canAccessInventory: integer('can_access_inventory', { mode: 'boolean' }).default(false),
  canAccessReports: integer('can_access_reports', { mode: 'boolean' }).default(false),
  canAccessUsers: integer('can_access_users', { mode: 'boolean' }).default(false),
  canApplyDiscounts: integer('can_apply_discounts', { mode: 'boolean' }).default(false),
  canVoidOrders: integer('can_void_orders', { mode: 'boolean' }).default(false),
  canOpenDrawer: integer('can_open_drawer', { mode: 'boolean' }).default(true),
  canAccessKitchen: integer('can_access_kitchen', { mode: 'boolean' }).default(false),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const receiptSettings = sqliteTable('receipt_settings', {
  id: text('id').primaryKey(),
  restaurantName: text('restaurant_name').default('Nerve Fast Food'),
  tagline: text('tagline').default('Fresh & Crispy!'),
  address: text('address'),
  phone: text('phone'),
  taxRegistrationNumber: text('tax_registration_number'),
  footerMessage: text('footer_message').default('Thank you for dining with us!'),
  showLogo: integer('show_logo', { mode: 'boolean' }).default(true),
  printerWidth: text('printer_width').default('80mm'),
  kitchenPin: text('kitchen_pin').default('1234'),
  mobileKitchenUrl: text('mobile_kitchen_url').default(''),
  raast: text('raast'),
  logoUrl: text('logo_url'),
  printerName: text('printer_name'),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  icon: text('icon'),
  displayOrder: integer('display_order'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => categories.id),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  costPrice: real('cost_price').notNull(),
  status: text('status').default('AVAILABLE'),
  isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
  imageUrl: text('image_url'),
});

export const productVariants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  name: text('name').notNull(),
  priceDelta: real('price_delta').default(0),
  isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
});

export const productAddons = sqliteTable('product_addons', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id),
  name: text('name').notNull(),
  price: real('price').default(0),
  inventoryItemId: text('inventory_item_id').references(() => inventoryItems.id),
  requiredQuantity: real('required_quantity').default(0),
  isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
});

export const inventoryItems = sqliteTable('inventory_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  unit: text('unit').notNull(),
  quantity: real('quantity').notNull(),
  minStockLevel: real('min_stock_level').notNull(),
  costPerUnit: real('cost_per_unit').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const productRecipes = sqliteTable('product_recipes', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  variantId: text('variant_id').references(() => productVariants.id),
  inventoryItemId: text('inventory_item_id').notNull().references(() => inventoryItems.id),
  requiredQuantity: real('required_quantity').notNull(),
});

export const tables = sqliteTable('tables', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').default(2),
  status: text('status').default('AVAILABLE'),
  currentOrderId: text('current_order_id'),
  reservedName: text('reserved_name'),
  reservedPhone: text('reserved_phone'),
  reservedAt: text('reserved_at'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const dealItems = sqliteTable('deal_items', {
  id: text('id').primaryKey(),
  dealId: text('deal_id').notNull().references(() => products.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').default(1),
});

export const kitchenHistory = sqliteTable('kitchen_history', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').unique(),
  userId: text('user_id').references(() => users.id),
  orderType: text('order_type').notNull(),
  tableNumber: text('table_number'),
  serviceCharge: real('service_charge').default(0),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  deliveryAddress: text('delivery_address'),
  totalAmount: real('total_amount').notNull(),
  paymentMethod: text('payment_method', { enum: ['CASH', 'CARD', 'ONLINE', 'RAAST'] }),
  status: text('status').default('PENDING'),
  kitchenStatus: text('kitchen_status').default('NEW'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  variantId: text('variant_id'),
  variantName: text('variant_name'),
  addonsJson: text('addons_json'),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
});
