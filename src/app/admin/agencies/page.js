'use client';
import { useState, useEffect } from 'react';
import { Building, Plus, X } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminAgencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    agencyName: '', contactNumber: '', address: '', description: '', userId: '' // Needs a proper user assignment in real scenario
  });
  const [confirmProps, setConfirmProps] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const fetchAgencies = () => {
    fetch('/api/agencies')
      .then(r => r.json())
      .then(d => { setAgencies(d.agencies || []); setLoading(false); });
  };

  useEffect(() => { fetchAgencies(); }, []);

  const handleToggleStatus = async (agency) => {
    setConfirmProps({
      isOpen: true,
      title: 'Konfirmasi Perubahan Status',
      message: `Yakin ingin ${agency.isActive ? 'menonaktifkan' : 'mengaktifkan'} mitra ini?`,
      isDanger: agency.isActive,
      confirmText: agency.isActive ? 'Nonaktifkan' : 'Ya, Aktifkan',
      onConfirm: async () => {
        await fetch(`/api/agencies/${agency.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !agency.isActive })
        });
        fetchAgencies();
      }
    });
  };

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Mitra Travel</h1>
        {/* Placeholder for Add Agency - In real app, requires creating User first or assigning existing */}
        <button className="btn btn-primary" onClick={() => alert('Fitur tambah mitra akan tersedia segera.')}><Plus size={16} /> Tambah Mitra</button>
      </div>

      {loading ? <div className="spinner" /> : agencies.length === 0 ? (
        <div className="glass empty-state"><Building size={48} /><p>Belum ada mitra terdaftar.</p></div>
      ) : (
        <div className="glass">
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>Nama Travel</th><th>Kontak</th><th>Pengelola</th><th>Total Armada</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {agencies.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.agencyName}</td>
                    <td>{a.contactNumber}</td>
                    <td>{a.user?.name} <br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.user?.email}</span></td>
                    <td>{a.vehicles?.length || 0}</td>
                    <td><span className={`badge ${a.isActive ? 'badge-success' : 'badge-warning'}`}>{a.isActive ? 'Aktif' : 'Menunggu / Nonaktif'}</span></td>
                    <td>
                      <button 
                        className={`btn btn-sm ${a.isActive ? 'btn-danger' : 'btn-success'}`}
                        style={!a.isActive ? { background: 'var(--success)' } : {}}
                        onClick={() => handleToggleStatus(a)}
                      >
                        {a.isActive ? 'Nonaktifkan' : 'Setujui / Aktifkan'}
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
