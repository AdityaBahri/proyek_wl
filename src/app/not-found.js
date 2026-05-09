'use client';
import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      zIndex: 1,
    }}>
      <div className="glass slide-up" style={{
        padding: '60px 48px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'rgba(108,99,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: 'var(--accent-primary)',
        }}>
          <AlertCircle size={48} />
        </div>

        {/* Error code */}
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '5rem',
          fontWeight: 800,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: 16,
        }}>
          404
        </div>

        <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Halaman Tidak Ditemukan</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.6 }}>
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin URL salah atau halaman telah dipindahkan.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">
            <Home size={16} /> Kembali ke Beranda
          </Link>
          <button
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            ← Halaman Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
}
