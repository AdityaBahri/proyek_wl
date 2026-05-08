'use client';
import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Bus, ArrowRight, ChevronLeft, Users, Wifi, Snowflake, Music, Usb, Check } from 'lucide-react';
import { formatCurrency, formatTime, formatDate, generateSeatLayout, parseJSON } from '@/lib/utils';

export default function ScheduleDetailPage({ params }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/schedules/${id}`)
      .then(r => r.json())
      .then(d => { setSchedule(d.schedule); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!schedule) return <div className="page-container"><div className="glass empty-state"><p>Jadwal tidak ditemukan</p></div></div>;

  const takenSeats = schedule.bookings
    ?.filter(b => b.status !== 'cancelled')
    .flatMap(b => parseJSON(b.selectedSeats)) || [];

  const allSeats = generateSeatLayout(schedule.vehicle.seatCapacity);
  const facilities = parseJSON(schedule.vehicle.facilities);

  const toggleSeat = (seat) => {
    if (takenSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const handleBook = async () => {
    if (!session) { router.push('/auth/login'); return; }
    if (selectedSeats.length === 0) { setError('Pilih minimal 1 kursi'); return; }
    setBooking(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerId: session.user.id, scheduleId: id, selectedSeats }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setBooking(false); return; }
      router.push(`/passenger/bookings/${data.booking.id}`);
    } catch { setError('Gagal membuat pemesanan'); setBooking(false); }
  };

  const facilityIcons = { AC: <Snowflake size={14} />, 'Wi-Fi': <Wifi size={14} />, Musik: <Music size={14} />, 'USB Charger': <Usb size={14} /> };

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
        <ChevronLeft size={16} /> Kembali ke Pencarian
      </Link>

      {/* Route Header */}
      <div className="glass" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <h2 style={{ fontSize: '1.5rem' }}>{schedule.route.originCity}</h2>
              <ArrowRight size={24} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.5rem' }}>{schedule.route.destinationCity}</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{schedule.vehicle.agency?.agencyName} • {schedule.vehicle.vehicleType}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(schedule.ticketPrice)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per kursi</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--glass-border)' }}>
          <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Berangkat</div><div style={{ fontWeight: 600 }}>{formatTime(schedule.departureDateTime)}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(schedule.departureDateTime)}</div></div>
          <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tiba</div><div style={{ fontWeight: 600 }}>{formatTime(schedule.arrivalDateTime)}</div></div>
          <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kapasitas</div><div style={{ fontWeight: 600 }}>{schedule.vehicle.seatCapacity} kursi</div></div>
          <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tersedia</div><div style={{ fontWeight: 600, color: 'var(--success)' }}>{allSeats.length - takenSeats.length} kursi</div></div>
        </div>

        {facilities.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {facilities.map(f => (
              <span key={f} className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {facilityIcons[f] || <Check size={14} />} {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Seat Selection & Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="glass" style={{ padding: 32 }}>
          <h3 style={{ marginBottom: 20, textAlign: 'center' }}>Pilih Kursi</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Depan (Sopir)</span>
          </div>
          <div className="seat-grid">
            {allSeats.map((seat, i) => {
              const isTaken = takenSeats.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              return (
                <div key={seat} className={`seat ${isTaken ? 'seat-taken' : ''} ${isSelected ? 'seat-selected' : ''}`} onClick={() => toggleSeat(seat)}>
                  {seat}
                </div>
              );
            })}
          </div>
          <div className="seat-legend">
            <span><div className="dot" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }} /> Tersedia</span>
            <span><div className="dot" style={{ background: 'rgba(108,99,255,0.25)', border: '1px solid var(--accent-primary)' }} /> Dipilih</span>
            <span><div className="dot" style={{ background: 'rgba(255,255,255,0.03)', opacity: 0.4 }} /> Terisi</span>
          </div>
        </div>

        <div className="glass" style={{ padding: 32 }}>
          <h3 style={{ marginBottom: 20 }}>Ringkasan Pemesanan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Rute</span><span>{schedule.route.originCity} → {schedule.route.destinationCity}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Tanggal</span><span>{formatDate(schedule.departureDateTime)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Jam</span><span>{formatTime(schedule.departureDateTime)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Kursi</span><span>{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Harga/kursi</span><span>{formatCurrency(schedule.ticketPrice)}</span></div>
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-primary)' }}>{formatCurrency(schedule.ticketPrice * selectedSeats.length)}</span>
            </div>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleBook} disabled={booking || selectedSeats.length === 0}>
            {booking ? 'Memproses...' : session ? 'Pesan Sekarang' : 'Login untuk Memesan'}
          </button>
        </div>
      </div>
    </div>
  );
}
