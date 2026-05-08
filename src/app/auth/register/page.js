'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'passenger' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push('/auth/login?registered=true');
    } catch { setError('Terjadi kesalahan'); setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
      <div className="glass slide-up" style={{ padding: 40, maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🚐 Lintas Kota</Link>
          <h2 style={{ marginTop: 16, fontSize: '1.5rem' }}>Buat Akun Baru</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>Daftar untuk memesan tiket travel</p>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label><User size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Nama Lengkap</label>
            <input type="text" className="glass-input" placeholder="Masukkan nama lengkap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label><Mail size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Email</label>
            <input type="email" className="glass-input" placeholder="nama@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label><Phone size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> No. Telepon</label>
            <input type="tel" className="glass-input" placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="input-group" style={{ marginBottom: 24 }}>
            <label><Lock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Password</label>
            <input type="password" className="glass-input" placeholder="Minimal 6 karakter" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, margin: 0, borderWidth: 2 }} /> : <><UserPlus size={18} /> Daftar</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Sudah punya akun? <Link href="/auth/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Masuk</Link>
        </p>
        <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Pemilik armada/agen travel? <Link href="/auth/register-mitra" style={{ color: 'var(--warning)', fontWeight: 600 }}>Daftar sebagai Mitra</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
