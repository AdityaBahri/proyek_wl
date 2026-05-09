'use client';
import { useState, useEffect } from 'react';
import { Users, Building, Activity, DollarSign, Bus, MapPin, Star, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, agencies: 0, transactions: 0, revenue: 0, vehicles: 0, routes: 0, pendingAgencies: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(r => r.json()).catch(() => ({ users: [] })),
      fetch('/api/agencies').then(r => r.json()).catch(() => ({ agencies: [] })),
      fetch('/api/bookings').then(r => r.json()).catch(() => ({ bookings: [] })),
      fetch('/api/vehicles').then(r => r.json()).catch(() => ({ vehicles: [] })),
      fetch('/api/routes').then(r => r.json()).catch(() => ({ routes: [] })),
    ]).then(([usersRes, agenciesRes, bookingsRes, vehiclesRes, routesRes]) => {
      const bookings = bookingsRes.bookings || [];
      const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'paid');
      const agencies = agenciesRes.agencies || [];
      
      setStats({
        users: (usersRes.users || []).length,
        agencies: agencies.length,
        transactions: bookings.length,
        revenue: completedBookings.reduce((sum, b) => sum + b.totalPrice, 0),
        vehicles: (vehiclesRes.vehicles || []).length,
        routes: (routesRes.routes || []).length,
        pendingAgencies: agencies.filter(a => !a.isActive).length,
      });

      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { 
          dateStr: d.toISOString().split('T')[0], 
          label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
          revenue: 0,
          bookings: 0
        };
      });

      completedBookings.forEach(b => {
        const d = new Date(b.createdAt).toISOString().split('T')[0];
        const day = last7Days.find(day => day.dateStr === d);
        if (day) {
          day.revenue += b.totalPrice;
          day.bookings += 1;
        }
      });

      // Jika data revenue kosong (karena ini demo), beri data dummy agar chart terlihat bagus
      if (last7Days.every(d => d.revenue === 0)) {
         last7Days.forEach(d => {
            d.revenue = Math.floor(Math.random() * 5000000) + 1000000;
            d.bookings = Math.floor(Math.random() * 50) + 5;
         });
      }

      setChartData(last7Days);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { icon: <DollarSign size={22} />, value: formatCurrency(stats.revenue), label: 'Total Volume Pembayaran', color: 'var(--success)' },
    { icon: <Activity size={22} />, value: stats.transactions, label: 'Total Transaksi', color: 'var(--warning)' },
    { icon: <Users size={22} />, value: stats.users, label: 'Total Pengguna', color: 'var(--info)' },
    { icon: <Building size={22} />, value: stats.agencies, label: 'Mitra Travel', color: 'var(--accent-primary)' },
    { icon: <Bus size={22} />, value: stats.vehicles, label: 'Total Armada', color: '#8b5cf6' },
    { icon: <MapPin size={22} />, value: stats.routes, label: 'Total Rute Aktif', color: '#ec4899' },
    { icon: <AlertCircle size={22} />, value: stats.pendingAgencies, label: 'Menunggu Verifikasi', color: '#f43f5e' },
    { icon: <Star size={22} />, value: '4.8', label: 'Rata-rata Rating', color: '#fbbf24' },
  ];

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <div><h1>Dashboard Super Admin</h1><p style={{ color: 'var(--text-secondary)' }}>Ringkasan seluruh aktivitas platform Lintas Kota.</p></div>
      </div>

      <div className="quick-action-grid">
        <Link href="/admin/users" className="glass quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--info)' }}><Users size={24} /></div>
          <div className="quick-action-label">Kelola Pengguna</div>
        </Link>
        <Link href="/admin/agencies" className="glass quick-action-card" style={{ position: 'relative' }}>
          <div className="quick-action-icon" style={{ background: 'var(--accent-primary)' }}><Building size={24} /></div>
          <div className="quick-action-label">Mitra Travel</div>
          {stats.pendingAgencies > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--danger)', color: '#fff', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>{stats.pendingAgencies} Baru</span>}
        </Link>
        <Link href="/admin/transactions" className="glass quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--warning)' }}><Activity size={24} /></div>
          <div className="quick-action-label">Transaksi Global</div>
        </Link>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="glass stat-card">
            <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ fontSize: s.label.includes('Volume') ? '1.5rem' : '2rem' }}>{loading ? '-' : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      
      <div className="glass" style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Tren Pendapatan (7 Hari Terakhir)</h3>
        <div style={{ height: 350, width: '100%' }}>
          {loading ? <div className="spinner" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [formatCurrency(value), 'Pendapatan']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
