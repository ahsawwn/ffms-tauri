# Nerve FFMS — Neo-Brutalist POS Terminal

Tauri v2 + React + Bun POS application with Neo-Brutalist UI, SQLite/Drizzle data layer, auth/RBAC, POS cart/checkout, inventory/recipes, deals, kitchen workflow, table management, held carts, and mobile/web kitchen access.

## Demo PINs

| Role | PIN |
|------|-----|
| Owner | 9999 |
| Manager | 8888 |
| Cashier | 1234 |
| Kitchen | 5555 |

## Key Features

- **Neo-Brutalist UI** — sharp 3px/4px black borders, hard shadows, high-contrast pastel badges, touch-friendly targets.
- **Themes** — multiple neo-brutalist lith tone color themes (Cream, Lemon, Lime, Mint, Peach, Lavender, Rose) selectable in Settings.
- **POS** — dynamic order types, variants/add-ons, recipe-linked inventory deduction, low-stock warnings, held carts, table assignment, scrollable cart.
- **Kitchen** — compact POS queue plus a separate mobile web screen with large touch controls.
- **Mobile Kitchen** — `http://<lan-ip>:1420/#/kitchen/mobile` (Kitchen PIN: 5555).
- **Printing** — thermal receipt & KOT printing (popup-blocker safe with iframe fallback), test print in Settings.
- **Raast Payments** — dynamic Raast QR (IBAN, account title, till, amount) with till options in Settings.
- **Auth/RBAC** — PIN login, exit-app button, role-based screen permissions.
- **Web/browser mode** — login and kitchen workflow without Tauri backend (demo-user PIN fallback, localStorage kitchen orders).

## Project Structure

```
src/
  App.tsx                 # routing, auth shell, navigation, mobile kitchen bypass
  hooks/
    usePosTerminal.ts     # POS state, cart, checkout, table status
    useThermalPrinter.ts  # receipt/KOT printing, test print, ESC/POS
  screens/
    POSTerminal.tsx       # POS layout & held-cart handling
    KitchenView.tsx       # compact kitchen queue
    MobileKitchenView.tsx # mobile kitchen workflow (web fallback)
    SettingsView.tsx      # full-screen settings: receipt, printer, kitchen, themes, Raast
    settings/
      ThemeSection.tsx    # neo-brutalist lith tone theme selector
      RaastSection.tsx    # Raast account title, IBAN, till, dynamic QR
  components/
    ui/                   # Button, Badge, Card, Input (theme-aware CSS variables)
    receipts/             # ThermalReceipt, KitchenTicket, ReceiptPreviewModal
    auth/                 # LoginScreen, PinKeypad, ProtectedScreen
  db/
    client.ts             # DB init, migrations, transaction-safe ops
    schema.ts             # relational schema (incl. receipt_settings.raast)
    seed.ts               # demo users, products, inventory, recipes, tables
    userQueries.ts        # receipt settings CRUD
    kitchenQueries.ts     # kitchen orders & status
    posQueries.ts         # categories, products, recipes, variants, addons
    tableQueries.ts       # table CRUD & status
    cartQueries.ts        # held carts & completion
    dealQueries.ts        # deal item composition
  services/
    inventoryDeductionService.ts
```

## Getting Started

```bash
# install
bun install

# dev (binds to 0.0.0.0:1420 for mobile LAN access)
bun run dev

# production build
bun run build

# preview
bun run preview
```

### Mobile Kitchen (LAN)

1. Run `bun run dev` on the host machine.
2. On a mobile device on the same network, open:
   `http://<lan-ip>:1420/#/kitchen/mobile`
3. Unlock with Kitchen PIN `5555`.

### Web / Browser Mode

No Tauri backend required. Login with demo PINs and use the kitchen screen via localStorage-backed orders. Real-time POS↔kitchen sync in web mode requires a shared backend/API layer.

## Printing

Receipt and KOT printing open a dedicated print window (popup-blocker safe) with an iframe fallback. Use **Settings → Test Print Receipt** to verify the thermal printer output.

## Raast (Payments)

Configure in Settings:
- Account Title
- IBAN
- Till / Till ID
- Amount

Tap **Show Raast QR** to generate a dynamic scannable payment QR.

## Notes

- SQLite DB: `~/.config/pk.nerve.ffms/nerve_ffms.db`
- Existing SQLite DBs are migrated via `ALTER TABLE` and table rebuilds.
- The app is not a git repository by default; initialize and push as needed.
- Web kitchen data is demo/localStorage only and does not sync with the Tauri SQLite POS database.
