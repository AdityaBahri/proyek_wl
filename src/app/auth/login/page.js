'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { mapAuthError } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Harap isi email dan password terlebih dahulu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', { ...form, redirect: false });
      if (res?.error) { 
        setError(mapAuthError(res.error)); 
        setLoading(false); 
        return; 
      }
      const session = await fetch('/api/auth/session').then(r => r.json());
      const role = session?.user?.role;
      if (role === 'super_admin') router.push('/admin/dashboard');
      else if (role === 'operator') router.push('/operator/dashboard');
      else router.push('/passenger/dashboard');
    } catch { 
      setError('Terjadi kesalahan tidak terduga. Silakan coba lagi.'); 
      setLoading(false); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
      <div className="glass slide-up" style={{ padding: 40, maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🚐 Lintas Kota</Link>
          <h2 style={{ marginTop: 16, fontSize: '1.5rem' }}>Masuk ke Akun</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>Selamat datang kembali!</p>
        </div>

        {error && (
          <div className="callout callout-danger">
            <div className="callout-icon"><AlertCircle size={16} /></div>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label><Mail size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Email</label>
            <input type="email" className={`glass-input ${error ? 'input-error' : ''}`} placeholder="nama@email.com" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setError(''); }} required />
          </div>
          <div className="input-group" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ marginBottom: 0 }}><Lock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Password</label>
              <Link href="/auth/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>Lupa Password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} className={`glass-input ${error ? 'input-error' : ''}`} placeholder="Masukkan password" value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); setError(''); }} required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title={showPw ? "Sembunyikan password" : "Tampilkan password"}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            {loading ? <span className="btn-spinner" /> : <><LogIn size={18} /> Masuk</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Belum punya akun? <Link href="/auth/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Daftar Sekarang</Link>
        </p>

        <div style={{ marginTop: 24, padding: 16, background: 'rgba(108,99,255,0.05)', borderRadius: 12, border: '1px solid rgba(108,99,255,0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Akun Demo:</p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div>Admin: admin@lintaskota.id</div>
            <div>Operator: budi@traveljaya.id</div>
            <div>Penumpang: ahmad@gmail.com</div>
            <div>Password: password123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
