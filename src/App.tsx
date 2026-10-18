import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { ProtectedScreen } from './components/auth/ProtectedScreen';
import { POSTerminal } from './screens/POSTerminal';
import { InventoryView } from './screens/InventoryView';
import { UserManagementView } from './screens/UserManagementView';
import { DealsView } from './screens/DealsView';
import { MenuManagementView } from './screens/MenuManagementView';
import { SettingsView } from './screens/SettingsView';
import { KitchenView } from './screens/KitchenView';
import { MobileKitchenView } from './screens/MobileKitchenView';
import { TableManagementView } from './screens/TableManagementView';
import { InvoicesView } from './screens/InvoicesView';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';
import './App.css';

function MainTerminalApp() {
  const { user, logout, isLoading } = useAuth();
  const [view, setView] = useState<'pos' | 'inventory' | 'menu' | 'users' | 'deals' | 'invoices' | 'kitchen' | 'mobileKitchen' | 'tables' | 'settings'>('pos');
  useEffect(() => { if (window.location.hash === '#/kitchen/mobile') setView('mobileKitchen' as any); else if (window.location.hash === '#/kitchen') setView('kitchen'); }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-[#FFE600] border-4 border-black shadow-[6px_6px_0px_#000] animate-bounce">
          <ShieldCheck className="w-12 h-12 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight">Initializing Nerve FFMS SQLite DB...</h2>
      </div>
    );
  }
  if (!user) return <LoginScreen />;

  const screens = {
    pos: <ProtectedScreen permission="canAccessPos"><POSTerminal /></ProtectedScreen>,
    inventory: <ProtectedScreen permission="canAccessInventory"><InventoryView /></ProtectedScreen>,
    users: <ProtectedScreen permission="canAccessUsers"><UserManagementView /></ProtectedScreen>,
    deals: <ProtectedScreen permission="canAccessPos"><DealsView /></ProtectedScreen>,
    menu: <ProtectedScreen permission="canAccessInventory"><MenuManagementView /></ProtectedScreen>,
    invoices: <ProtectedScreen permission="canAccessReports"><InvoicesView /></ProtectedScreen>,
    kitchen: <ProtectedScreen permission="canAccessPos"><KitchenView /></ProtectedScreen>,
    mobileKitchen: <ProtectedScreen permission="canAccessKitchen"><MobileKitchenView /></ProtectedScreen>,
    tables: <ProtectedScreen permission="canAccessPos"><TableManagementView /></ProtectedScreen>,
    settings: <ProtectedScreen permission="canAccessUsers"><SettingsView /></ProtectedScreen>,
  };

  return (
    <div className="h-screen bg-[var(--bg-app)] flex flex-col">
      <header className="brutal-card p-4 flex items-center justify-between bg-[#FFE600]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border-3 border-black shadow-[3px_3px_0px_#000]">
            <ShoppingBag className="w-6 h-6 stroke-[2.5] text-[#A3E635]" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Nerve FFMS Terminal</h1>
            <p className="text-xs font-extrabold uppercase tracking-wider text-black/70">
              Active Operator: <span className="text-black font-black">{user.name}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button variant={view === 'pos' ? 'primary' : 'outline'} size="sm" onClick={() => setView('pos')}>POS</Button>
          <Button variant={view === 'inventory' ? 'primary' : 'outline'} size="sm" onClick={() => setView('inventory')}>Inventory</Button>
          <Button variant={view === 'menu' ? 'primary' : 'outline'} size="sm" onClick={() => setView('menu')}>Menu</Button>
          <Button variant={view === 'users' ? 'primary' : 'outline'} size="sm" onClick={() => setView('users')}>Users</Button>
          <Button variant={view === 'deals' ? 'primary' : 'outline'} size="sm" onClick={() => setView('deals')}>Deals</Button>
          <Button variant={view === 'invoices' ? 'primary' : 'outline'} size="sm" onClick={() => setView('invoices')}>Invoices</Button>
          <Button variant={view === 'kitchen' ? 'primary' : 'outline'} size="sm" onClick={() => setView('kitchen')}>Kitchen</Button>
          <Button variant={view === 'tables' ? 'primary' : 'outline'} size="sm" onClick={() => setView('tables')}>Tables</Button>
          <Button variant={view === 'settings' ? 'primary' : 'outline'} size="sm" onClick={() => setView('settings')}>Settings</Button>
          <Badge variant={user.role === 'OWNER' ? 'pink' : user.role === 'MANAGER' ? 'cyan' : 'lime'}>Role: {user.role}</Badge>
          <Button variant="danger" size="sm" onClick={logout}><LogOut className="w-4 h-4 stroke-[2.5]" /> LOCK</Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{screens[view]}</main>
    </div>
  );
}

export default function App() {
  if (typeof window !== 'undefined' && window.location.hash === '#/kitchen/mobile') {
    return <MobileKitchenView />;
  }
  return (
    <AuthProvider>
      <MainTerminalApp />
    </AuthProvider>
  );
}
