import { drizzle } from 'drizzle-orm/sqlite-proxy';
import Database from '@tauri-apps/plugin-sql';
import * as schema from './schema';
import { seedDatabase } from './seed';

let dbPromise: Promise<ReturnType<typeof drizzle>> | null = null;

export function getDb() {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const sqlitePlugin = await Database.load('sqlite:nerve_ffms.db');
    const dbInstance = drizzle(
      async (sql: string, params: unknown[], method: 'values' | 'run' | 'all' | 'get') => {
        try {
          if (method === 'run') {
            await sqlitePlugin.execute(sql, params);
            return { rows: [] };
          }
          const rows = await sqlitePlugin.select<Record<string, unknown>[]>(sql, params);
          const arrays = (rows ?? []).map((row) => Object.values(row));
          if (method === 'get') return { rows: arrays[0] ?? [] };
          return { rows: arrays };
        } catch (error) {
          console.error('Drizzle Query Error:', error);
          throw error;
        }
      },
      { schema }
    );
    await initializeTables(sqlitePlugin);
    await seedDatabase(dbInstance);
    return dbInstance;
  })();
  return dbPromise;
}

async function initializeTables(db: Database) {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, username TEXT UNIQUE NOT NULL, pin_code TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('OWNER','MANAGER','CASHIER','KITCHEN')), status TEXT DEFAULT 'ACTIVE');`,
    `CREATE TABLE IF NOT EXISTS user_permissions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), can_access_pos INTEGER DEFAULT 1, can_access_inventory INTEGER DEFAULT 0, can_access_reports INTEGER DEFAULT 0, can_access_users INTEGER DEFAULT 0, can_apply_discounts INTEGER DEFAULT 0, can_void_orders INTEGER DEFAULT 0, can_open_drawer INTEGER DEFAULT 1, can_access_kitchen INTEGER DEFAULT 0, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS receipt_settings (id TEXT PRIMARY KEY, restaurant_name TEXT DEFAULT 'Nerve Fast Food', tagline TEXT DEFAULT 'Fresh & Crispy!', address TEXT, phone TEXT, tax_registration_number TEXT, footer_message TEXT DEFAULT 'Thank you for dining with us!', show_logo INTEGER DEFAULT 1, printer_width TEXT DEFAULT '80mm', kitchen_pin TEXT DEFAULT '1234', mobile_kitchen_url TEXT DEFAULT '');`,
    `CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE, icon TEXT, display_order INTEGER, is_active INTEGER DEFAULT 1);`,
    `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, category_id TEXT REFERENCES categories(id), name TEXT NOT NULL, description TEXT, price REAL NOT NULL, cost_price REAL NOT NULL, status TEXT DEFAULT 'AVAILABLE', is_available INTEGER DEFAULT 1, image_url TEXT);`,
    `CREATE TABLE IF NOT EXISTS product_variants (id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id), name TEXT NOT NULL, price_delta REAL DEFAULT 0, is_available INTEGER DEFAULT 1);`,
    `CREATE TABLE IF NOT EXISTS product_addons (id TEXT PRIMARY KEY, product_id TEXT REFERENCES products(id), name TEXT NOT NULL, price REAL DEFAULT 0, inventory_item_id TEXT REFERENCES inventory_items(id), required_quantity REAL DEFAULT 0, is_available INTEGER DEFAULT 1);`,
    `CREATE TABLE IF NOT EXISTS inventory_items (id TEXT PRIMARY KEY, name TEXT NOT NULL, unit TEXT NOT NULL, quantity REAL NOT NULL, min_stock_level REAL NOT NULL, cost_per_unit REAL NOT NULL, is_active INTEGER DEFAULT 1);`,
    `CREATE TABLE IF NOT EXISTS product_recipes (id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id), variant_id TEXT REFERENCES product_variants(id), inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id), required_quantity REAL NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS tables (id TEXT PRIMARY KEY, name TEXT NOT NULL, capacity INTEGER DEFAULT 2, status TEXT DEFAULT 'AVAILABLE', current_order_id TEXT, reserved_name TEXT, reserved_phone TEXT, reserved_at TEXT, is_active INTEGER DEFAULT 1);`,
    `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, order_number TEXT UNIQUE, user_id TEXT REFERENCES users(id), order_type TEXT NOT NULL, table_number TEXT, service_charge REAL DEFAULT 0, customer_name TEXT, customer_phone TEXT, delivery_address TEXT, total_amount REAL NOT NULL, payment_method TEXT, status TEXT DEFAULT 'PENDING', kitchen_status TEXT DEFAULT 'NEW', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS deal_items (id TEXT PRIMARY KEY, deal_id TEXT NOT NULL REFERENCES products(id), product_id TEXT NOT NULL REFERENCES products(id), quantity INTEGER DEFAULT 1);`,
    `CREATE TABLE IF NOT EXISTS kitchen_history (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, status TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS order_items (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), product_id TEXT NOT NULL REFERENCES products(id), variant_id TEXT, variant_name TEXT, addons_json TEXT, quantity INTEGER NOT NULL, unit_price REAL NOT NULL);`,
  ];
  for (const sql of stmts) await db.execute(sql);
  const alters = [
    'ALTER TABLE categories ADD COLUMN is_active INTEGER DEFAULT 1;',
    'ALTER TABLE products ADD COLUMN status TEXT DEFAULT "AVAILABLE";',
    'ALTER TABLE products ADD COLUMN image_url TEXT;',
    'ALTER TABLE inventory_items ADD COLUMN is_active INTEGER DEFAULT 1;',
    'ALTER TABLE product_recipes ADD COLUMN variant_id TEXT;',
    'ALTER TABLE orders ADD COLUMN table_number TEXT;',
    'ALTER TABLE orders ADD COLUMN service_charge REAL DEFAULT 0;',
    'ALTER TABLE orders ADD COLUMN customer_name TEXT;',
    'ALTER TABLE orders ADD COLUMN customer_phone TEXT;',
    'ALTER TABLE orders ADD COLUMN delivery_address TEXT;',
    'ALTER TABLE order_items ADD COLUMN variant_id TEXT;',
    'ALTER TABLE order_items ADD COLUMN variant_name TEXT;',
    'ALTER TABLE order_items ADD COLUMN addons_json TEXT;',
    'ALTER TABLE user_permissions ADD COLUMN can_access_kitchen INTEGER DEFAULT 0;',
    'ALTER TABLE receipt_settings ADD COLUMN kitchen_pin TEXT DEFAULT "1234";',
    'ALTER TABLE receipt_settings ADD COLUMN mobile_kitchen_url TEXT DEFAULT "";',
    'ALTER TABLE receipt_settings ADD COLUMN raast TEXT;',
  ];
  for (const sql of alters) { try { await db.execute(sql); } catch (e) {} }
  // Migrate legacy users role CHECK constraint if needed
  try {
    const urows: any[] = await db.select('SELECT sql FROM sqlite_master WHERE type="table" AND name="users"');
    const usql = urows?.[0]?.sql ?? '';
    if (usql.includes("CHECK(role IN ('OWNER', 'MANAGER', 'CASHIER'))") && !usql.includes('KITCHEN')) {
      await db.execute('PRAGMA foreign_keys=OFF');
      await db.execute(`CREATE TABLE users_new (id TEXT PRIMARY KEY, name TEXT NOT NULL, username TEXT UNIQUE NOT NULL, pin_code TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('OWNER','MANAGER','CASHIER','KITCHEN')), status TEXT DEFAULT 'ACTIVE');`);
      await db.execute(`INSERT INTO users_new (id, name, username, pin_code, role, status) SELECT id, name, username, pin_code, role, status FROM users;`);
      await db.execute('DROP TABLE users;');
      await db.execute('ALTER TABLE users_new RENAME TO users;');
      await db.execute('PRAGMA foreign_keys=ON;');
    }
  } catch (e) { console.error('users migration failed', e); }
  // Migrate legacy orders status CHECK constraint if needed
  try {
    const rows: any[] = await db.select('SELECT sql FROM sqlite_master WHERE type="table" AND name="orders"');
    const sqlText = rows?.[0]?.sql ?? '';
    if (sqlText.includes("CHECK(status IN")) {
      await db.execute('PRAGMA foreign_keys=OFF');
      await db.execute(`CREATE TABLE orders_new (id TEXT PRIMARY KEY, order_number TEXT UNIQUE, user_id TEXT REFERENCES users(id), order_type TEXT NOT NULL, table_number TEXT, service_charge REAL DEFAULT 0, customer_name TEXT, customer_phone TEXT, delivery_address TEXT, total_amount REAL NOT NULL, payment_method TEXT, status TEXT DEFAULT 'PENDING', kitchen_status TEXT DEFAULT 'NEW', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
      await db.execute(`INSERT INTO orders_new (id, order_number, user_id, order_type, table_number, service_charge, customer_name, customer_phone, delivery_address, total_amount, payment_method, status, kitchen_status, created_at) SELECT id, order_number, user_id, order_type, table_number, service_charge, customer_name, customer_phone, delivery_address, total_amount, payment_method, status, 'NEW', created_at FROM orders;`);
      await db.execute('DROP TABLE orders;');
      await db.execute('ALTER TABLE orders_new RENAME TO orders;');
      await db.execute('PRAGMA foreign_keys=ON;');
    }
  } catch (e) { console.error('orders migration failed', e); }
}
