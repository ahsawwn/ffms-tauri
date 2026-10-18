import React, { useEffect, useState } from 'react';
import { fetchTables, addTable, freeTable, reserveTable, setTableStatus } from '../db/tableQueries';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const TableManagementView: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [cap, setCap] = useState('2');
  const [reserveId, setReserveId] = useState<string | null>(null);
  const [rName, setRName] = useState('');
  const [rPhone, setRPhone] = useState('');

  const load = async () => setTables(await fetchTables());
  useEffect(() => { void load(); }, []);

  const statusColor = (s: string) => s === 'AVAILABLE' ? 'lime' : s === 'RESERVED' ? 'purple' : s === 'OCCUPIED' ? 'orange' : s === 'PROCESSING' ? 'cyan' : 'pink';

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <h2 className="font-black uppercase text-2xl">Table Management</h2>
      <div className="brutal-card p-4 bg-white flex gap-2">
        <input className="brutal-input flex-1" placeholder="Table name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="brutal-input w-20" type="number" placeholder="Cap" value={cap} onChange={(e) => setCap(e.target.value)} />
        <Button variant="success" onClick={() => { if (name) { void addTable({ name, capacity: Number(cap) }).then(load); setName(''); } }}>Add</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tables.map((t) => (
          <div key={t.id} className="brutal-card p-3 bg-white flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-black uppercase">{t.name}</span>
              <Badge variant={statusColor(t.status) as any}>{t.status}</Badge>
            </div>
            <span className="text-xs font-bold">Cap: {t.capacity}</span>
            {t.reservedName && <span className="text-xs font-bold">Res: {t.reservedName}</span>}
            <div className="flex gap-1 flex-wrap">
              <Button size="sm" variant="info" onClick={() => setReserveId(t.id)}>Reserve</Button>
              <Button size="sm" variant="warning" onClick={() => void setTableStatus(t.id, 'OCCUPIED').then(load)}>Occupy</Button>
              <Button size="sm" variant="success" onClick={() => void setTableStatus(t.id, 'SERVED').then(load)}>Served</Button>
              <Button size="sm" variant="outline" onClick={() => void freeTable(t.id).then(load)}>Free</Button>
            </div>
          </div>
        ))}
      </div>
      {reserveId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="brutal-card p-6 bg-white w-full max-w-md flex flex-col gap-3">
            <h2 className="font-black uppercase text-xl">Reserve Table</h2>
            <input className="brutal-input" placeholder="Customer Name" value={rName} onChange={(e) => setRName(e.target.value)} />
            <input className="brutal-input" placeholder="Phone" value={rPhone} onChange={(e) => setRPhone(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setReserveId(null)}>Cancel</Button>
              <Button variant="success" className="flex-1" onClick={() => { void reserveTable(reserveId, rName, rPhone).then(load); setReserveId(null); setRName(''); setRPhone(''); }}>Reserve</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
