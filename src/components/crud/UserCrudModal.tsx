import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface UserCrudModalProps {
  open: boolean;
  initial?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const UserCrudModal: React.FC<UserCrudModalProps> = ({ open, initial, onClose, onSave }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [username, setUsername] = useState(initial?.username ?? '');
  const [pin, setPin] = useState(initial?.pinCode ?? '');
  const [role, setRole] = useState(initial?.role ?? 'CASHIER');
  const [status, setStatus] = useState(initial?.status ?? 'ACTIVE');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
        <h2 className="font-black uppercase text-xl">{initial ? 'Edit User' : 'Add User'}</h2>
        <input className="brutal-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="brutal-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="brutal-input" placeholder="4-digit PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
        <select className="brutal-input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="OWNER">OWNER</option><option value="MANAGER">MANAGER</option><option value="CASHIER">CASHIER</option>
        </select>
        <select className="brutal-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option>
        </select>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" className="flex-1" onClick={() => { onSave({ id: initial?.id, name, username, pinCode: pin, role, status }); onClose(); }}>Save</Button>
        </div>
      </div>
    </div>
  );
};
