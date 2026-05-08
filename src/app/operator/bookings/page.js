'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Ticket, CheckCircle, XCircle, Search, ExternalLink, X } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export default function OperatorBookings() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchBookings = async () => {
    if (session?.user?.agencyId) {
      // In a real scenario, the API should filter by agencyId. We filter on client here for simplicity as the generic GET doesn't filter by agencyId initially
      const res = await fetch('/api/bookings');
      const data = await res.json();
      const filteredBookings = (data.bookings || []).filter(b => b.schedule?.vehicle?.agencyId === session.user.agencyId);
      setBookings(filteredBookings);
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [session]);

  const filteredData = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const handleUpdateStatus = async (id, newStatus) => {
    setStatusUpdating(true);
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setSelectedBooking(null);
    fetchBookings();
    setStatusUpdating(false);
  };

  const handleVerifyPayment = async (paymentId, status) => {
    setStatusUpdating(true);
    await fetch(`/api/payments/${paymentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: status }),
    });
    // Updating payment might update booking status automatically based on the logic we wrote in payment API
    setSelectedBooking(null);
    fetchBookings();
    setStatusUpdating(false);
  }

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Validasi Pemesanan</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="glass-input" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Pembayaran</option>
            <option value="paid">Dibayar</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {loading ? <div className="spinner" /> : filteredData.length === 0 ? (
        <div className="glass empty-state"><Ticket size={48} /><p>Tidak ada pemesanan ditemukan.</p></div>
      ) : (
        <div className="glass">
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>ID</th><th>Penumpang</th><th>Rute</th><th>Tanggal Berangkat</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {filteredData.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.id.slice(-8)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.passenger?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.passenger?.phone}</div>
                    </td>
                    <td>{b.schedule?.route?.originCity} → {b.schedule?.route?.destinationCity}</td>
                    <td>{formatDateTime(b.schedule?.departureDateTime)}</td>
                    <td><span className={`badge badge-${b.status === 'paid' || b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}`}>{b.status}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedBooking(b)}>Detail & Validasi</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Pemesanan</h3>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Penumpang</span><div style={{ fontWeight: 600 }}>{selectedBooking.passenger?.name}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Kontak</span><div style={{ fontWeight: 600 }}>{selectedBooking.passenger?.phone || selectedBooking.passenger?.email}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Rute</span><div style={{ fontWeight: 600 }}>{selectedBooking.schedule?.route?.originCity} → {selectedBooking.schedule?.route?.destinationCity}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Keberangkatan</span><div style={{ fontWeight: 600 }}>{formatDateTime(selectedBooking.schedule?.departureDateTime)}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Kursi</span><div style={{ fontWeight: 600 }}>{JSON.parse(selectedBooking.selectedSeats || '[]').join(', ')}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Harga</span><div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(selectedBooking.totalPrice)}</div></div>
            </div>

            <div style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Informasi Pembayaran</h4>
              {selectedBooking.payment ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Metode</span><div style={{ fontWeight: 600 }}>{selectedBooking.payment.paymentMethod}</div></div>
                    <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status Pembayaran</span><div><span className={`badge badge-${selectedBooking.payment.paymentStatus === 'verified' ? 'success' : selectedBooking.payment.paymentStatus === 'rejected' ? 'danger' : 'warning'}`}>{selectedBooking.payment.paymentStatus}</span></div></div>
                  </div>
                  {selectedBooking.payment.proofUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Bukti Transfer</span>
                      <div><a href={selectedBooking.payment.proofUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={14} /> Lihat Bukti Transfer</a></div>
                    </div>
                  )}
                  {selectedBooking.payment.paymentStatus === 'pending' && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn btn-success btn-sm" style={{ background: 'var(--success)' }} onClick={() => handleVerifyPayment(selectedBooking.payment.id, 'verified')} disabled={statusUpdating}><CheckCircle size={14} /> Verifikasi Pembayaran</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleVerifyPayment(selectedBooking.payment.id, 'rejected')} disabled={statusUpdating}><XCircle size={14} /> Tolak</button>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Belum ada data pembayaran untuk pemesanan ini.</p>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 20 }}>
              <h4 style={{ marginBottom: 12 }}>Aksi Pemesanan</h4>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {selectedBooking.status === 'paid' && (
                  <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')} disabled={statusUpdating}>Tandai Selesai</button>
                )}
                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                  <button className="btn btn-danger" onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')} disabled={statusUpdating}>Batalkan Pemesanan</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
