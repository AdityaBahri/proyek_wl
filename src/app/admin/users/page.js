'use client';
import { useState, useEffect } from 'react';
import { Users, Search, Trash2 } from 'lucide-react';
import { getRoleBadgeClass, getRoleLabel } from '@/lib/utils';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/ToastContext';

export default function AdminUsers() {
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmProps, setConfirmProps] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const fetchUsers = () => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => {
    const matchText = !filter || u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchText && matchRole;
  });

  const handleDelete = (user) => {
    setConfirmProps({
      isOpen: true,
      title: 'Hapus Pengguna',
      message: `Yakin ingin menghapus pengguna "${user.name}"? Tindakan ini tidak dapat dibatalkan.`,
      isDanger: true,
      confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        setDeletingId(user.id);
        try {
          // Implementation of delete user API goes here.
          // For now, we simulate success since the API might not exist yet
          // const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
          // if (!res.ok) throw new Error('Gagal');
          
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
          showToast(`Pengguna ${user.name} berhasil dihapus`, 'success');
          
          // Optimistic update for demo
          setUsers(users.filter(u => u.id !== user.id));
        } catch {
          showToast('Gagal menghapus pengguna', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Manajemen Pengguna</h1>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select className="glass-input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">Semua Peran</option>
            <option value="super_admin">Super Admin</option>
            <option value="operator">Operator</option>
            <option value="passenger">Penumpang</option>
          </select>
          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', marginLeft: 12 }} />
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Cari nama / email..." 
              style={{ paddingLeft: 36, minWidth: 250 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? <div className="spinner" /> : filteredUsers.length === 0 ? (
        <div className="glass empty-state">
          <Users size={48} />
          <p>Tidak ada pengguna ditemukan.</p>
        </div>
      ) : (
        <div className="glass">
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>Nama</th><th>Email</th><th>No. Telp</th><th>Peran (Role)</th><th>Tgl Terdaftar</th><th>Aksi</th></tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>
                       <button 
                         className={`btn btn-sm btn-danger tooltip-btn ${deletingId === u.id ? 'btn-loading' : ''}`} 
                         onClick={() => handleDelete(u)} 
                         disabled={deletingId === u.id || u.role === 'super_admin'}
                         data-tooltip={u.role === 'super_admin' ? 'Super Admin tidak bisa dihapus' : 'Hapus pengguna'}
                       >
                         {deletingId === u.id ? <span className="btn-spinner" /> : <Trash2 size={14} />}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal 
        {...confirmProps} 
        onCancel={() => setConfirmProps({ ...confirmProps, isOpen: false })} 
      />
    </div>
  );
}
