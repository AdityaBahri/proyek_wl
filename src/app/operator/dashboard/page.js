'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Ticket, Bus, Calendar, Star, TrendingUp, CheckCircle, FileText } from 'lucide-react';
import { formatCurrency, formatBookingId, getStatusBadgeClass, getStatusLabel, formatDateTime } from '@/lib/utils';

export default function OperatorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, vehicles: 0, schedules: 0, rating: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.agencyId) {
      Promise.all([
        fetch(`/api/agencies/${session.user.agencyId}`).then(r => r.json()).catch(() => ({})),
        fetch('/api/bookings').then(r => r.json())
      ]).then(([_, bookingsData]) => {
        const agencyBookings = (bookingsData.bookings || []).filter(b => b.schedule?.vehicle?.agencyId === session.user.agencyId);
        
        setRecentBookings(agencyBookings.slice(0, 5));
        
        const completedBookings = agencyBookings.filter(b => b.status === 'completed' || b.status === 'paid');
        const revenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        
        setStats({
          bookings: agencyBookings.length,
          revenue,
          vehicles: 5, // Mock
          schedules: 10, // Mock
          rating: 4.8 // Mock
        });
        setLoading(false);
      });
    }
  }, [session]);

  const statCards = [
    { icon: <TrendingUp size={22} />, value: formatCurrency(stats.revenue), label: 'Total Pendapatan', color: 'var(--success)' },
    { icon: <Ticket size={22} />, value: stats.bookings, label: 'Total Pemesanan', color: 'var(--accent-primary)' },
    { icon: <Bus size={22} />, value: stats.vehicles, label: 'Armada Aktif', color: 'var(--info)' },
    { icon: <Star size={22} />, value: stats.rating, label: 'Rating Rata-rata', color: 'var(--warning)' },
  ];

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <div><h1>Dashboard Operator</h1><p style={{ color: 'var(--text-secondary)' }}>Ringkasan operasional travel Anda.</p></div>
      </div>

      <div className="quick-action-grid">
        <Link href="/operator/bookings" className="glass quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--success)' }}><CheckCircle size={24} /></div>
          <div className="quick-action-label">Validasi Pemesanan</div>
        </Link>
        <Link href="/operator/schedules" className="glass quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--accent-primary)' }}><Calendar size={24} /></div>
          <div className="quick-action-label">Kelola Jadwal</div>
        </Link>
        <Link href="/operator/vehicles" className="glass quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--warning)' }}><Bus size={24} /></div>
          <div className="quick-action-label">Data Armada</div>
        </Link>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="glass stat-card">
            <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ fontSize: s.label.includes('Pendapatan') ? '1.5rem' : '2rem' }}>{loading ? '-' : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Pemesanan Terbaru</h3>
          <Link href="/operator/bookings" className="btn btn-secondary btn-sm tooltip-btn" data-tooltip="Lihat seluruh riwayat pesanan">Lihat Semua</Link>
        </div>
        {loading ? <div className="spinner" /> : recentBookings.length === 0 ? (
          <div className="empty-state"><p>Belum ada pemesanan.</p></div>
        ) : (
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>ID</th><th>Penumpang</th><th>Rute</th><th>Tanggal Keberangkatan</th><th>Status</th><th>Total</th></tr></thead>
              <tbody>
                {recentBookings.map((b, idx) => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatBookingId(b.id, idx)}</td>
                    <td>{b.passenger?.name}</td>
                    <td>{b.schedule?.route?.originCity} → {b.schedule?.route?.destinationCity}</td>
                    <td>{formatDateTime(b.schedule?.departureDateTime)}</td>
                    <td><span className={`badge ${getStatusBadgeClass(b.status)}`}>{getStatusLabel(b.status)}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(b.totalPrice)}</td>
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
