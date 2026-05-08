'use client';
import { useState, useEffect } from 'react';
import { Activity, Ticket } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export default function AdminTransactions() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/bookings')
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setLoading(false); });
  }, []);

  const filteredData = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Monitoring Transaksi Global</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="glass-input" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="paid">Dibayar</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {loading ? <div className="spinner" /> : filteredData.length === 0 ? (
        <div className="glass empty-state"><Activity size={48} /><p>Tidak ada transaksi ditemukan.</p></div>
      ) : (
        <div className="glass">
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>ID Booking</th><th>Penumpang</th><th>Travel & Rute</th><th>Tgl Pemesanan</th><th>Status</th><th>Total</th></tr></thead>
              <tbody>
                {filteredData.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.id.slice(-8)}</td>
                    <td>{b.passenger?.name}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.schedule?.vehicle?.agency?.agencyName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.schedule?.route?.originCity} → {b.schedule?.route?.destinationCity}</div>
                    </td>
                    <td>{formatDateTime(b.createdAt)}</td>
                    <td><span className={`badge badge-${b.status === 'paid' || b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}`}>{b.status}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(b.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
