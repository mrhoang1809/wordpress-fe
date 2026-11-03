'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menusApi } from '@/lib/api-client';
import type { Menu } from '@/types';
import { Plus } from 'lucide-react';

export default function MenusPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('HEADER');

  const qc = useQueryClient();
  const { data: menus, isLoading } = useQuery<Menu[]>({
    queryKey: ['menus'],
    queryFn: () => menusApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; location: string }) => menusApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menus'] }); setShowForm(false); setName(''); },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Menu</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Menu mới
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name, location }); }} className="mb-6 rounded-lg border bg-card p-4 space-y-3 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Tên menu</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="Menu đầu trang" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Vị trí</label>
            <select className="form-input" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="HEADER">Đầu trang</option>
              <option value="FOOTER">Chân trang</option>
              <option value="SIDEBAR">Thanh bên</option>
              <option value="CUSTOM">Tùy chỉnh</option>
            </select>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Tạo menu</button>
        </form>
      )}

      <div className="grid gap-4">
        {isLoading && <p className="text-muted-foreground">Đang tải...</p>}
        {menus?.map((menu) => (
          <div key={menu.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{menu.name}</h3>
                <p className="text-sm text-muted-foreground">Vị trí: {menu.location}</p>
              </div>
              <span className="text-sm text-muted-foreground">{menu.isActive ? 'Đang dùng' : 'Tắt'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
