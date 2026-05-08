'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Calendar, X } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import ConfirmModal from '@/components/ConfirmModal';

export default function OperatorSchedules() {
  const { data: session } = useSession();
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmProps, setConfirmProps] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [form, setForm] = useState({
    routeId: '', vehicleId: '', departureDateTime: '', arrivalDateTime: '', ticketPrice: ''
  });

  const fetchData = async () => {
    if (session?.user?.agencyId) {
      const [schedRes, routeRes, vehRes] = await Promise.all([
        fetch('/api/schedules'), // In a real app, this should filter by agencyId. For now, filter client-side if needed or adapt the API
        fetch('/api/routes'),
        fetch(`/api/vehicles?agencyId=${session.user.agencyId}`)
      ]);
      const schedData = await schedRes.json();
      const routeData = await routeRes.json();
      const vehData = await vehRes.json();
      
      const agencyVehicles = vehData.vehicles || [];
      const vehicleIds = agencyVehicles.map(v => v.id);
      
      setSchedules((schedData.schedules || []).filter(s => vehicleIds.includes(s.vehicleId)));
      setRoutes(routeData.routes || []);
      setVehicles(agencyVehicles);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [session]);

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setEditingId(schedule.id);
      setForm({
        routeId: schedule.routeId,
        vehicleId: schedule.vehicleId,
        departureDateTime: new Date(schedule.departureDateTime).toISOString().slice(0, 16),
        arrivalDateTime: new Date(schedule.arrivalDateTime).toISOString().slice(0, 16),
        ticketPrice: schedule.ticketPrice
      });
    } else {
      setEditingId(null);
      setForm({ routeId: '', vehicleId: '', departureDateTime: '', arrivalDateTime: '', ticketPrice: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/schedules/${editingId}` : '/api/schedules';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    setConfirmProps({
      isOpen: true,
      title: 'Hapus Jadwal',
      message: 'Yakin ingin menghapus jadwal ini?',
      isDanger: true,
      confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
        fetchData();
      }
    });
  };

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Manajemen Jadwal</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={16} /> Tambah Jadwal</button>
      </div>

      {loading ? <div className="spinner" /> : schedules.length === 0 ? (
        <div className="glass empty-state"><Calendar size={48} /><p>Belum ada jadwal keberangkatan.</p></div>
      ) : (
        <div className="glass">
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>Rute</th><th>Armada</th><th>Keberangkatan</th><th>Kedatangan</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s.id}>
                    <td>{s.route?.originCity} → {s.route?.destinationCity}</td>
                    <td>{s.vehicle?.vehicleType} ({s.vehicle?.licensePlate})</td>
                    <td>{formatDateTime(s.departureDateTime)}</td>
                    <td>{formatDateTime(s.arrivalDateTime)}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(s.ticketPrice)}</td>
                    <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(s)}><Edit size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
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
              <h3>{editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Rute Perjalanan</label>
                  <select className="glass-input" required value={form.routeId} onChange={e => setForm({...form, routeId: e.target.value})}>
                    <option value="" disabled>Pilih Rute</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.originCity} → {r.destinationCity}</option>)}
                  </select>
                </div>
                <div className="input-group full-width">
                  <label>Armada Kendaraan</label>
                  <select className="glass-input" required value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})}>
                    <option value="" disabled>Pilih Armada</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleType} - {v.licensePlate} ({v.seatCapacity} Kursi)</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Waktu Berangkat</label>
                  <input type="datetime-local" className="glass-input" required value={form.departureDateTime} onChange={e => setForm({...form, departureDateTime: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Waktu Tiba</label>
                  <input type="datetime-local" className="glass-input" required value={form.arrivalDateTime} onChange={e => setForm({...form, arrivalDateTime: e.target.value})} />
                </div>
                <div className="input-group full-width">
                  <label>Harga Tiket (Rp)</label>
                  <input type="number" className="glass-input" required min="0" value={form.ticketPrice} onChange={e => setForm({...form, ticketPrice: e.target.value})} />
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
