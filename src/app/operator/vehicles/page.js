'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Bus, X } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function OperatorVehicles() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmProps, setConfirmProps] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  const [form, setForm] = useState({
    licensePlate: '', vehicleType: '', seatCapacity: 12, facilities: []
  });

  const availableFacilities = ['AC', 'Musik', 'USB Charger', 'Wi-Fi', 'TV', 'Reclining Seat', 'Snack'];

  const fetchVehicles = () => {
    if (session?.user?.agencyId) {
      fetch(`/api/vehicles?agencyId=${session.user.agencyId}`)
        .then(r => r.json())
        .then(d => { setVehicles(d.vehicles || []); setLoading(false); });
    }
  };

  useEffect(() => { fetchVehicles(); }, [session]);

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setEditingId(vehicle.id);
      setForm({
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType,
        seatCapacity: vehicle.seatCapacity,
        facilities: vehicle.facilities || []
      });
    } else {
      setEditingId(null);
      setForm({ licensePlate: '', vehicleType: '', seatCapacity: 12, facilities: [] });
    }
    setShowModal(true);
  };

  const handleFacilityToggle = (f) => {
    setForm(prev => {
      const facilities = prev.facilities.includes(f) 
        ? prev.facilities.filter(item => item !== f)
        : [...prev.facilities, f];
      return { ...prev, facilities };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/vehicles/${editingId}` : '/api/vehicles';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, agencyId: session.user.agencyId }),
    });
    
    setShowModal(false);
    fetchVehicles();
  };

  const handleDelete = async (id) => {
    setConfirmProps({
      isOpen: true,
      title: 'Hapus Armada',
      message: 'Yakin ingin menghapus armada ini?',
      isDanger: true,
      confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
        fetchVehicles();
      }
    });
  };

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Manajemen Armada</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={16} /> Tambah Armada</button>
      </div>

      {loading ? <div className="spinner" /> : vehicles.length === 0 ? (
        <div className="glass empty-state"><Bus size={48} /><p>Belum ada armada.</p></div>
      ) : (
        <div className="glass">
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>Plat Nomor</th><th>Tipe Kendaraan</th><th>Kapasitas</th><th>Fasilitas</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.licensePlate}</td>
                    <td>{v.vehicleType}</td>
                    <td>{v.seatCapacity} Kursi</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(v.facilities || []).map(f => (
                          <span key={f} className="badge badge-info" style={{ fontSize: '0.65rem' }}>{f}</span>
                        ))}
                      </div>
                    </td>
                    <td><span className={`badge ${v.isActive ? 'badge-success' : 'badge-danger'}`}>{v.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(v)}><Edit size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Armada' : 'Tambah Armada'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Plat Nomor</label>
                  <input type="text" className="glass-input" required value={form.licensePlate} onChange={e => setForm({...form, licensePlate: e.target.value})} placeholder="B 1234 XYZ" />
                </div>
                <div className="input-group">
                  <label>Kapasitas Kursi</label>
                  <input type="number" className="glass-input" required min="4" max="60" value={form.seatCapacity} onChange={e => setForm({...form, seatCapacity: parseInt(e.target.value)})} />
                </div>
                <div className="input-group full-width">
                  <label>Tipe Kendaraan</label>
                  <input type="text" className="glass-input" required value={form.vehicleType} onChange={e => setForm({...form, vehicleType: e.target.value})} placeholder="Toyota HiAce" />
                </div>
                <div className="input-group full-width">
                  <label>Fasilitas</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {availableFacilities.map(f => (
                      <button 
                        key={f} 
                        type="button" 
                        className={`badge ${form.facilities.includes(f) ? 'badge-success' : 'badge-secondary'}`}
                        style={{ cursor: 'pointer', border: '1px solid var(--glass-border)' }}
                        onClick={() => handleFacilityToggle(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
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
