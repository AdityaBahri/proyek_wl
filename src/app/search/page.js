'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Bus, ArrowRight, Search, ChevronLeft, RefreshCcw } from 'lucide-react';
import { formatCurrency, formatTime, formatDate, parseJSON } from '@/lib/utils';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || '',
  });
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetch('/api/routes').then(r => r.json()).then(d => setRoutes(d.routes || []));
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const cities = [...new Set(routes.flatMap(r => [r.originCity, r.destinationCity]))];

  const fetchSchedules = async (overrideFilters = null) => {
    setLoading(true);
    const activeFilters = overrideFilters || filters;
    const params = new URLSearchParams();
    if (activeFilters.origin) params.set('origin', activeFilters.origin);
    if (activeFilters.destination) params.set('destination', activeFilters.destination);
    if (activeFilters.date) params.set('date', activeFilters.date);
    const res = await fetch(`/api/schedules?${params.toString()}`);
    const data = await res.json();
    setSchedules(data.schedules || []);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSchedules();
  };

  const handleReset = () => {
    const defaultFilters = { origin: '', destination: '', date: '' };
    setFilters(defaultFilters);
    fetchSchedules(defaultFilters);
  };

  const getTakenSeats = (schedule) => {
    return schedule.bookings
      ?.filter(b => b.status !== 'cancelled')
      .flatMap(b => parseJSON(b.selectedSeats)) || [];
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
          <ChevronLeft size={16} /> Kembali ke Beranda
        </Link>
        <h1>Cari Jadwal Travel</h1>
      </div>

      <form onSubmit={handleSearch} className="glass" style={{ padding: 24, marginBottom: 32 }}>
        <div className="search-grid">
          <div className="input-group">
            <label>Kota Asal</label>
            <select className="glass-input" value={filters.origin} onChange={e => setFilters({ ...filters, origin: e.target.value })}>
              <option value="">Semua</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Kota Tujuan</label>
            <select className="glass-input" value={filters.destination} onChange={e => setFilters({ ...filters, destination: e.target.value })}>
              <option value="">Semua</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Tanggal</label>
            <input type="date" className="glass-input" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: '100%' }}>
            <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="btn-spinner" /> : <><Search size={18} /> Cari</>}
            </button>
            <button type="button" className="btn btn-secondary tooltip-btn" onClick={handleReset} data-tooltip="Reset filter pencarian" aria-label="Reset filter" disabled={loading}>
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>
      </form>

      <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        {loading ? 'Mencari...' : `${schedules.length} jadwal ditemukan`}
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : schedules.length === 0 ? (
        <div className="glass empty-state">
          <Bus size={48} />
          <p>Tidak ada jadwal ditemukan</p>
          {(filters.origin || filters.destination || filters.date) && (
            <button className="btn btn-secondary btn-sm" onClick={handleReset} style={{ marginTop: 12 }}>Hapus Filter</button>
          )}
        </div>
      ) : (
        schedules.map(s => {
          const taken = getTakenSeats(s);
          const available = s.vehicle.seatCapacity - taken.length;
          return (
            <div key={s.id} className="glass schedule-card" onClick={() => router.push(`/schedule/${s.id}`)} style={{ cursor: 'pointer' }}>
              <div className="schedule-route">
                <span className="schedule-city">{s.route.originCity}</span>
                <span className="schedule-time">{formatTime(s.departureDateTime)}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(s.departureDateTime)}</span>
              </div>
              <div className="schedule-arrow">
                <div className="line" />
                <ArrowRight size={16} />
                <div style={{ fontSize: '0.7rem' }}>{s.route.estimatedTime || ''}</div>
              </div>
              <div className="schedule-route">
                <span className="schedule-city">{s.route.destinationCity}</span>
                <span className="schedule-time">{formatTime(s.arrivalDateTime)}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.vehicle.agency?.agencyName}</span>
              </div>
              <div className="schedule-price">
                <div className="price">{formatCurrency(s.ticketPrice)}</div>
                <div className="per">/kursi</div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge ${available > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {available > 0 ? `${available} kursi tersedia` : 'Penuh'}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-loading"><div className="spinner" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
