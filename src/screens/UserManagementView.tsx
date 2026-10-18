import React, { useEffect, useState } from 'react';
import { fetchUsers, addUser, updateUser, deleteUser } from '../db/userQueries';
import { UserTable } from '../components/users/UserTable';
import { AddUserModal } from '../components/users/AddUserModal';
import { PermissionsEditor } from '../components/users/PermissionsEditor';
import type { users } from '../db/schema';

type User = typeof users.$inferSelect;

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [permUser, setPermUser] = useState<User | null>(null);

  const load = async () => setUsers(await fetchUsers());
  useEffect(() => { void load(); }, []);

  const handleSave = async (data: any) => {
    if (data.id) await updateUser(data.id, data);
    else await addUser(data);
    await load();
  };

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <h2 className="font-black uppercase text-2xl">User Management</h2>
        <button className="brutal-btn px-4 py-2 bg-[#A3E635]" onClick={() => { setEditing(null); setAddOpen(true); }}>Add User</button>
      </div>
      <UserTable users={users} onEdit={(u) => { setEditing(u); setAddOpen(true); }} onPermissions={(u) => setPermUser(u)} onDelete={(id) => void deleteUser(id).then(load)} />
      <AddUserModal open={addOpen} initial={editing} onClose={() => setAddOpen(false)} onSave={handleSave} />
      {permUser && <PermissionsEditor open={!!permUser} userId={permUser.id} onClose={() => setPermUser(null)} />}
    </div>
  );
};
