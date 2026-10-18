import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchPermissions } from '../../db/userQueries';

type PermKey = 'canAccessPos' | 'canAccessInventory' | 'canAccessReports' | 'canAccessUsers' | 'canApplyDiscounts' | 'canVoidOrders' | 'canOpenDrawer' | 'canAccessKitchen';

export interface ProtectedScreenProps {
  permission: PermKey;
  children: React.ReactNode;
}

export const ProtectedScreen: React.FC<ProtectedScreenProps> = ({ permission, children }) => {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setAllowed(false); return; }
    const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
    if (!isTauri) {
      const rolePerms: Record<string, string[]> = {
        OWNER: ['canAccessPos','canAccessInventory','canAccessReports','canAccessUsers','canApplyDiscounts','canVoidOrders','canOpenDrawer','canAccessKitchen'],
        MANAGER: ['canAccessPos','canAccessInventory','canAccessReports','canApplyDiscounts','canVoidOrders','canOpenDrawer','canAccessKitchen'],
        CASHIER: ['canAccessPos','canOpenDrawer'],
        KITCHEN: ['canAccessKitchen'],
      };
      setAllowed(rolePerms[user.role]?.includes(permission) ?? false);
      return;
    }
    fetchPermissions(user.id).then((p) => setAllowed(!!p?.[permission])).catch(() => setAllowed(false));
  }, [user, permission]);

  if (allowed === null) return <div className="p-8 font-black uppercase">Checking permissions...</div>;
  if (!allowed) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="brutal-card p-6 bg-[#FF6B8B]">
          <h2 className="text-2xl font-black uppercase">Access Denied</h2>
          <p className="text-sm font-bold mt-2">You do not have permission for this screen.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};
