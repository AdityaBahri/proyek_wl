'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Calendar, X, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/ToastContext';

export default function OperatorSchedules() {
  const { data: session } = useSession();
  const showToast = useToast();
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmProps, setConfirmProps] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [form, setForm] = useState({
    routeId: '', vehicleId: '', departureDateTime: '', arrivalDateTime: '', ticketPrice: ''
  });

  const fetchData = async () => {
    if (session?.user?.agencyId) {
      const [schedRes, routeRes, vehRes] = await Promise.all([
        fetch('/api/schedules'),
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
    setFormError('');
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
    setFormError('');

    // H5: Error prevention (Date validation)
    const depDate = new Date(form.departureDateTime);
    const arrDate = new Date(form.arrivalDateTime);
    if (arrDate <= depDate) {
      setFormError('Waktu kedatangan harus lebih lambat dari waktu keberangkatan.');
      return;
    }

    setSubmitting(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/schedules/${editingId}` : '/api/schedules';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Gagal menyimpan jadwal');
      
      showToast(editingId ? 'Jadwal berhasil diperbarui' : 'Jadwal berhasil ditambahkan', 'success');
      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError('Terjadi kesalahan saat menyimpan jadwal.');
      showToast('Gagal menyimpan jadwal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmProps({
      isOpen: true,
      title: 'Hapus Jadwal',
      message: 'Yakin ingin menghapus jadwal ini secara permanen?',
      isDanger: true,
      confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete');
          showToast('Jadwal berhasil dihapus', 'success');
          fetchData();
        } catch {
          showToast('Gagal menghapus jadwal. Pastikan tidak ada pemesanan aktif.', 'error');
        }
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
                        <button className="btn btn-secondary btn-sm tooltip-btn" onClick={() => handleOpenModal(s)} data-tooltip="Edit jadwal"><Edit size={14} /></button>
                        <button className="btn btn-danger btn-sm tooltip-btn" onClick={() => handleDelete(s.id)} data-tooltip="Hapus jadwal"><Trash2 size={14} /></button>
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
        <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
              <button className="modal-close" onClick={() => !submitting && setShowModal(false)} disabled={submitting}><X size={20} /></button>
            </div>

            {formError && (
              <div className="field-error" style={{ marginBottom: 16 }}>
                <AlertCircle size={14} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Rute Perjalanan</label>
                  <select className={`glass-input ${formError && !form.routeId ? 'input-error' : ''}`} required value={form.routeId} onChange={e => { setForm({...form, routeId: e.target.value}); setFormError(''); }}>
                    <option value="" disabled>Pilih Rute</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.originCity} → {r.destinationCity}</option>)}
                  </select>
                </div>
                <div className="input-group full-width">
                  <label>Armada Kendaraan</label>
                  <select className={`glass-input ${formError && !form.vehicleId ? 'input-error' : ''}`} required value={form.vehicleId} onChange={e => { setForm({...form, vehicleId: e.target.value}); setFormError(''); }}>
                    <option value="" disabled>Pilih Armada</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleType} - {v.licensePlate} ({v.seatCapacity} Kursi)</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Waktu Keberangkatan</label>
                  <input type="datetime-local" className={`glass-input ${formError && formError.includes('kedatangan') ? 'input-error' : ''}`} required value={form.departureDateTime} onChange={e => { setForm({...form, departureDateTime: e.target.value}); setFormError(''); }} />
                </div>
                <div className="input-group">
                  <label>Waktu Kedatangan</label>
                  <input type="datetime-local" className={`glass-input ${formError && formError.includes('kedatangan') ? 'input-error' : ''}`} required value={form.arrivalDateTime} onChange={e => { setForm({...form, arrivalDateTime: e.target.value}); setFormError(''); }} />
                </div>
                <div className="input-group full-width">
                  <label>Harga Tiket (Rp) per Kursi</label>
                  <input type="number" className="glass-input" required min="0" value={form.ticketPrice} onChange={e => setForm({...form, ticketPrice: e.target.value})} placeholder="Contoh: 150000" />
                  {/* H6: Recognition - Preview Rupiah format */}
                  {form.ticketPrice && (
                    <div className="price-preview">Preview: {formatCurrency(Number(form.ticketPrice))}</div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Batal</button>
                <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} disabled={submitting}>
                  {submitting ? <span className="btn-spinner" /> : 'Simpan Jadwal'}
                </button>
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
