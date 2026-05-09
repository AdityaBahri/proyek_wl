'use client';
import { useState, useEffect } from 'react';
import { Building, Plus, X, Info } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/ToastContext';

export default function AdminAgencies() {
  const showToast = useToast();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
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
      message: `Yakin ingin ${agency.isActive ? 'menonaktifkan' : 'menyetujui dan mengaktifkan'} mitra travel "${agency.agencyName}"?`,
      isDanger: agency.isActive,
      confirmText: agency.isActive ? 'Nonaktifkan' : 'Ya, Setujui & Aktifkan',
      onConfirm: async () => {
        setStatusUpdating(true);
        try {
          const res = await fetch(`/api/agencies/${agency.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !agency.isActive })
          });
          if (!res.ok) throw new Error('Failed to update');
          showToast(`Mitra travel berhasil ${agency.isActive ? 'dinonaktifkan' : 'diaktifkan'}`, 'success');
          fetchAgencies();
        } catch {
          showToast('Gagal mengubah status mitra travel', 'error');
        } finally {
          setStatusUpdating(false);
        }
      }
    });
  };

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Verifikasi Mitra Travel</h1>
        <button className="btn btn-primary" onClick={() => alert('Fitur tambah mitra akan tersedia segera.')}><Plus size={16} /> Tambah Mitra</button>
      </div>

      <div className="info-callout" style={{ marginBottom: 24 }}>
        <Info size={20} />
        <div>
          <h4>Persetujuan Mitra Travel</h4>
          <p>Mitra travel yang baru mendaftar (Status: Menunggu) tidak dapat beroperasi sebelum Anda menyetujuinya. Pastikan untuk memverifikasi dokumen mereka sebelum memberikan persetujuan.</p>
        </div>
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
                        className={`btn btn-sm ${a.isActive ? 'btn-danger' : 'btn-success'} ${statusUpdating ? 'btn-loading' : ''}`}
                        style={!a.isActive ? { background: 'var(--success)' } : {}}
                        onClick={() => handleToggleStatus(a)}
                        disabled={statusUpdating}
                      >
                        {statusUpdating ? <span className="btn-spinner" /> : (a.isActive ? 'Nonaktifkan' : 'Setujui / Aktifkan')}
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
