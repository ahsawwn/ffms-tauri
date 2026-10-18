import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { fetchPermissions, savePermissions } from '../../db/userQueries';

const keys = [
  ['canAccessPos', 'POS Terminal'],
  ['canAccessInventory', 'Inventory & Recipes'],
  ['canAccessReports', 'Reports & Z-Out'],
  ['canAccessUsers', 'User Management'],
  ['canApplyDiscounts', 'Apply Discount'],
  ['canVoidOrders', 'Void Order'],
  ['canOpenDrawer', 'Manual Cash Drawer Open'],
] as const;

export interface PermissionsEditorProps {
  open: boolean;
  userId: string;
  onClose: () => void;
}

export const PermissionsEditor: React.FC<PermissionsEditorProps> = ({ open, userId, onClose }) => {
  const [perms, setPerms] = useState<any>({});
  useEffect(() => {
    if (open) fetchPermissions(userId).then((p) => setPerms(p ?? {}));
  }, [open, userId]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
        <h2 className="font-black uppercase text-xl">Permissions</h2>
        {keys.map(([key, label]) => (
          <label key={key} className="flex items-center justify-between font-bold text-sm">
            <span>{label}</span>
            <input type="checkbox" checked={!!perms[key]} onChange={(e) => setPerms((p:any) => ({ ...p, [key]: e.target.checked }))} />
          </label>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => { void savePermissions(userId, perms); onClose(); }}>Save</Button>
        </div>
      </div>
    </div>
  );
};
