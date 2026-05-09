'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Ticket, Clock, CheckCircle, XCircle, Search, Bus } from 'lucide-react';
import { formatCurrency, formatBookingId, getStatusBadgeClass, getStatusLabel, formatDateTime } from '@/lib/utils';

export default function PassengerDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/bookings?passengerId=${session.user.id}`)
        .then(r => r.json())
        .then(d => { setBookings(d.bookings || []); setLoading(false); });
    }
  }, [session]);

  const stats = [
    { icon: <Ticket size={22} />, value: bookings.length, label: 'Total Pemesanan', color: 'var(--accent-primary)' },
    { icon: <Clock size={22} />, value: bookings.filter(b => b.status === 'pending').length, label: 'Menunggu Bayar', color: 'var(--warning)' },
    { icon: <CheckCircle size={22} />, value: bookings.filter(b => ['paid', 'completed'].includes(b.status)).length, label: 'Selesai', color: 'var(--success)' },
    { icon: <XCircle size={22} />, value: bookings.filter(b => b.status === 'cancelled').length, label: 'Dibatalkan', color: 'var(--danger)' },
  ];

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <div><h1>Dashboard</h1><p style={{ color: 'var(--text-secondary)' }}>Selamat datang, {session?.user?.name}!</p></div>
      </div>

      <div className="quick-action-grid">
        <Link href="/search" className="glass quick-action-card">
          <div className="quick-action-icon"><Search size={24} /></div>
          <div className="quick-action-label">Cari Jadwal Travel</div>
        </Link>
        <Link href="/passenger/bookings" className="glass quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--success)' }}><Ticket size={24} /></div>
          <div className="quick-action-label">Pemesanan Saya</div>
        </Link>
        <Link href="/passenger/profile" className="glass quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--warning)' }}><Bus size={24} /></div>
          <div className="quick-action-label">Profil Penumpang</div>
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="glass stat-card">
            <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
            <div className="stat-value">{loading ? '-' : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass">
        <h3 style={{ padding: '24px 24px 16px' }}>Pemesanan Terbaru</h3>
        {loading ? <div className="spinner" /> : bookings.length === 0 ? (
          <div className="empty-state"><p>Belum ada pemesanan. <Link href="/search" style={{ color: 'var(--accent-primary)' }}>Cari jadwal sekarang!</Link></p></div>
        ) : (
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>ID</th><th>Rute</th><th>Waktu Keberangkatan</th><th>Kursi</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {bookings.slice(0, 5).map((b, idx) => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatBookingId(b.id, idx)}</td>
                    <td>{b.schedule?.route?.originCity} → {b.schedule?.route?.destinationCity}</td>
                    <td>{formatDateTime(b.schedule?.departureDateTime)}</td>
                    <td>{(b.selectedSeats || []).join(', ')}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(b.totalPrice)}</td>
                    <td><span className={`badge ${getStatusBadgeClass(b.status)}`}>{getStatusLabel(b.status)}</span></td>
                    <td><Link href={`/passenger/bookings/${b.id}`} className="btn btn-secondary btn-sm tooltip-btn" data-tooltip="Lihat detail pesanan">Detail</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
