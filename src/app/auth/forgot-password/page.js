'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (!res.ok) { 
        setError(data.error); 
      } else {
        setSuccess('Password berhasil direset. Silakan masuk menggunakan password baru.');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    } catch { 
      setError('Terjadi kesalahan pada server'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
      <div className="glass slide-up" style={{ padding: 40, maxWidth: 440, width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Kembali ke Login
          </Link>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.5rem' }}>Lupa Password?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>
            Masukkan email terdaftar Anda dan password baru yang diinginkan.
          </p>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, color: 'var(--success)', fontSize: '0.85rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label><Mail size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Email Terdaftar</label>
            <input type="email" className="glass-input" placeholder="nama@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required disabled={success !== ''} />
          </div>
          <div className="input-group" style={{ marginBottom: 24 }}>
            <label><Lock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Password Baru</label>
            <input type="password" className="glass-input" placeholder="Minimal 6 karakter" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required minLength={6} disabled={success !== ''} />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading || success !== ''} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, margin: 0, borderWidth: 2 }} /> : <><RefreshCcw size={18} /> Ganti Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}
