'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

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
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'pending', 'paid', 'completed', 'cancelled'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter(f); setLoading(true); }}>
              {f === '' ? 'Semua' : f === 'pending' ? 'Menunggu' : f === 'paid' ? 'Dibayar' : f === 'completed' ? 'Selesai' : 'Batal'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="spinner" /> : bookings.length === 0 ? (
        <div className="glass empty-state" style={{ padding: 60 }}><p>Tidak ada pemesanan</p></div>
      ) : (
        <div className="glass" style={{ padding: 24 }}>
          <div className="glass-table-wrapper">
            <table className="glass-table">
              <thead><tr><th>ID</th><th>Rute</th><th>Tanggal</th><th>Kursi</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.id.slice(-8)}</td>
                    <td>{b.schedule?.route?.originCity} → {b.schedule?.route?.destinationCity}</td>
                    <td>{new Date(b.schedule?.departureDateTime).toLocaleDateString('id-ID')}</td>
                    <td>{(b.selectedSeats || []).join(', ')}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(b.totalPrice)}</td>
                    <td><span className={`badge badge-${b.status === 'paid' || b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}`}>{b.status === 'pending' ? 'Menunggu' : b.status === 'paid' ? 'Dibayar' : b.status === 'completed' ? 'Selesai' : 'Dibatalkan'}</span></td>
                    <td><Link href={`/passenger/bookings/${b.id}`} className="btn btn-secondary btn-sm">Detail</Link></td>
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
