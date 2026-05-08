'use client';
import { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchUsers = () => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => {
    if (!filter) return true;
    return u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Manajemen Pengguna</h1>
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

      {loading ? <div className="spinner" /> : (
        <div className="glass">
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>Nama</th><th>Email</th><th>No. Telp</th><th>Peran (Role)</th><th>Tgl Terdaftar</th></tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td>
                      <span className={`badge badge-${u.role === 'super_admin' ? 'danger' : u.role === 'operator' ? 'warning' : 'info'}`}>
                        {u.role === 'super_admin' ? 'Super Admin' : u.role === 'operator' ? 'Operator' : 'Penumpang'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
