'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatCurrency, formatDateTime, formatBookingId, getStatusLabel, getStatusBadgeClass } from '@/lib/utils';
import { Ticket } from 'lucide-react';

export default function PassengerBookings() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      const url = `/api/bookings?passengerId=${session.user.id}${filter ? `&status=${filter}` : ''}`;
      fetch(url).then(r => r.json()).then(d => { setBookings(d.bookings || []); setLoading(false); });
    }
  }, [session, filter]);

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Pemesanan Saya</h1>
        <div className="search-filter-bar" style={{ marginBottom: 0 }}>
          {['', 'pending', 'paid', 'completed', 'cancelled'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter(f); setLoading(true); }}>
              {f === '' ? 'Semua' : getStatusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="spinner" /> : bookings.length === 0 ? (
        <div className="glass empty-state" style={{ padding: 60 }}>
          <Ticket size={48} />
          <p>Tidak ada pemesanan yang sesuai dengan filter ini.</p>
          {filter && <button className="btn btn-secondary btn-sm" onClick={() => setFilter('')} style={{ marginTop: 12 }}>Reset Filter</button>}
        </div>
      ) : (
        <div className="glass">
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>ID</th><th>Rute</th><th>Waktu Keberangkatan</th><th>Kursi</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {bookings.map((b, idx) => (
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
        </div>
      )}
    </div>
  );
}
