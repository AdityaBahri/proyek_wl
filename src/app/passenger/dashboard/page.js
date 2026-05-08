'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Ticket, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
        <Link href="/search" className="btn btn-primary"><Search size={16} /> Cari Jadwal</Link>
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

      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Pemesanan Terbaru</h3>
        {loading ? <div className="spinner" /> : bookings.length === 0 ? (
          <div className="empty-state"><p>Belum ada pemesanan. <Link href="/search" style={{ color: 'var(--accent-primary)' }}>Cari jadwal sekarang!</Link></p></div>
        ) : (
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>Rute</th><th>Tanggal</th><th>Kursi</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td>{b.schedule?.route?.originCity} → {b.schedule?.route?.destinationCity}</td>
                    <td>{new Date(b.schedule?.departureDateTime).toLocaleDateString('id-ID')}</td>
                    <td>{JSON.parse(b.selectedSeats || '[]').join(', ')}</td>
                    <td>{formatCurrency(b.totalPrice)}</td>
                    <td><span className={`badge badge-${b.status === 'paid' || b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}`}>{b.status === 'pending' ? 'Menunggu' : b.status === 'paid' ? 'Dibayar' : b.status === 'completed' ? 'Selesai' : 'Dibatalkan'}</span></td>
                    <td><Link href={`/passenger/bookings/${b.id}`} className="btn btn-secondary btn-sm">Detail</Link></td>
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
