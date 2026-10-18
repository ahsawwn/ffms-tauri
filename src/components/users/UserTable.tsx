import React from 'react';
import type { users } from '../../db/schema';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

type User = typeof users.$inferSelect;

export interface UserTableProps {
  users: User[];
  onEdit: (u: User) => void;
  onPermissions: (u: User) => void;
  onDelete: (id: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onPermissions, onDelete }) => (
  <div className="brutal-card p-4 bg-white overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-3 border-black">
          <th className="p-2 text-left font-black uppercase">Name</th>
          <th className="p-2 text-left font-black uppercase">Username</th>
          <th className="p-2 text-left font-black uppercase">Role</th>
          <th className="p-2 text-left font-black uppercase">PIN</th>
          <th className="p-2 text-left font-black uppercase">Status</th>
          <th className="p-2 text-left font-black uppercase">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-b-2 border-black/20">
            <td className="p-2 font-bold">{u.name}</td>
            <td className="p-2">{u.username}</td>
            <td className="p-2"><Badge variant={u.role === 'OWNER' ? 'pink' : u.role === 'MANAGER' ? 'cyan' : 'lime'}>{u.role}</Badge></td>
            <td className="p-2 font-mono">{u.pinCode}</td>
            <td className="p-2"><Badge variant={u.status === 'ACTIVE' ? 'lime' : 'orange'}>{u.status}</Badge></td>
            <td className="p-2 flex gap-2">
              <Button size="sm" variant="info" onClick={() => onEdit(u)}>Edit</Button>
              <Button size="sm" variant="warning" onClick={() => onPermissions(u)}>Perms</Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(u.id)}>Del</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
