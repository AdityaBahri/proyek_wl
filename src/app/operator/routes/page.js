'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, X } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function OperatorRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmProps, setConfirmProps] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  const [form, setForm] = useState({
    originCity: '', destinationCity: '', distance: '', estimatedTime: '', boardingPoints: '', dropPoints: ''
  });

  const fetchRoutes = () => {
    fetch('/api/routes')
      .then(r => r.json())
      .then(d => { setRoutes(d.routes || []); setLoading(false); });
  };

  useEffect(() => { fetchRoutes(); }, []);

  const handleOpenModal = (route = null) => {
    if (route) {
      setEditingId(route.id);
      setForm({
        originCity: route.originCity,
        destinationCity: route.destinationCity,
        distance: route.distance || '',
        estimatedTime: route.estimatedTime || '',
        boardingPoints: (route.boardingPoints || []).join(', '),
        dropPoints: (route.dropPoints || []).join(', ')
      });
    } else {
      setEditingId(null);
      setForm({ originCity: '', destinationCity: '', distance: '', estimatedTime: '', boardingPoints: '', dropPoints: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/routes/${editingId}` : '/api/routes';
    
    const payload = {
      ...form,
      boardingPoints: form.boardingPoints.split(',').map(s => s.trim()).filter(Boolean),
      dropPoints: form.dropPoints.split(',').map(s => s.trim()).filter(Boolean)
    };
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    setShowModal(false);
    fetchRoutes();
  };

  const handleDelete = async (id) => {
    setConfirmProps({
      isOpen: true,
      title: 'Hapus Rute',
      message: 'Yakin ingin menghapus rute ini?',
      isDanger: true,
      confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        await fetch(`/api/routes/${id}`, { method: 'DELETE' });
        fetchRoutes();
      }
    });
  };

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Manajemen Rute</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={16} /> Tambah Rute</button>
      </div>

      {loading ? <div className="spinner" /> : routes.length === 0 ? (
        <div className="glass empty-state"><MapPin size={48} /><p>Belum ada rute.</p></div>
      ) : (
        <div className="glass">
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>Asal → Tujuan</th><th>Estimasi Waktu</th><th>Jarak</th><th>Boarding Points</th><th>Drop Points</th><th>Aksi</th></tr></thead>
              <tbody>
                {routes.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.originCity} → {r.destinationCity}</td>
                    <td>{r.estimatedTime || '-'}</td>
                    <td>{r.distance || '-'}</td>
                    <td>{(r.boardingPoints || []).join(', ')}</td>
                    <td>{(r.dropPoints || []).join(', ')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(r)}><Edit size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button>
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
              <h3>{editingId ? 'Edit Rute' : 'Tambah Rute'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Kota Asal</label>
                  <input type="text" className="glass-input" required value={form.originCity} onChange={e => setForm({...form, originCity: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Kota Tujuan</label>
                  <input type="text" className="glass-input" required value={form.destinationCity} onChange={e => setForm({...form, destinationCity: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Estimasi Waktu</label>
                  <input type="text" className="glass-input" value={form.estimatedTime} onChange={e => setForm({...form, estimatedTime: e.target.value})} placeholder="3 Jam" />
                </div>
                <div className="input-group">
                  <label>Jarak</label>
                  <input type="text" className="glass-input" value={form.distance} onChange={e => setForm({...form, distance: e.target.value})} placeholder="150 km" />
                </div>
                <div className="input-group full-width">
                  <label>Titik Penjemputan (Boarding) - Pisahkan dengan koma</label>
                  <input type="text" className="glass-input" value={form.boardingPoints} onChange={e => setForm({...form, boardingPoints: e.target.value})} placeholder="Terminal A, Halte B" />
                </div>
                <div className="input-group full-width">
                  <label>Titik Penurunan (Drop) - Pisahkan dengan koma</label>
                  <input type="text" className="glass-input" value={form.dropPoints} onChange={e => setForm({...form, dropPoints: e.target.value})} placeholder="Terminal C, Pool D" />
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
