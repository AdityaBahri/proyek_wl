'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Shield, Star, ChevronRight, Bus, CreditCard, Search } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchData, setSearchData] = useState({ origin: '', destination: '', date: '' });
  const [routes, setRoutes] = useState([]);

  const getCityImage = (city) => {
    const cityMap = {
      'Jakarta': '/images/route_jakarta.png',
      'Bandung': '/images/route_bandung.png',
      'Yogyakarta': '/images/route_yogyakarta.png',
      'Surabaya': '/images/route_surabaya.png',
      'Bali': '/images/route_bali.png',
      'Semarang': '/images/route_semarang.png'
    };
    return cityMap[city] || '/images/route_jakarta.png';
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    fetch('/api/routes').then(r => r.json()).then(d => setRoutes(d.routes || [])).catch(() => {});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cities = [...new Set(routes.flatMap(r => [r.originCity, r.destinationCity]))];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.origin) params.set('origin', searchData.origin);
    if (searchData.destination) params.set('destination', searchData.destination);
    if (searchData.date) params.set('date', searchData.date);
    router.push(`/search?${params.toString()}`);
  };

  const getDashboardLink = () => {
    if (!session) return '/auth/login';
    const role = session.user.role;
    if (role === 'super_admin') return '/admin/dashboard';
    if (role === 'operator') return '/operator/dashboard';
    return '/passenger/dashboard';
  };

  return (
    <>
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">🚐 Lintas Kota</Link>
          <div className="navbar-links">
            <a href="#features">Fitur</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#rute">Rute</a>
          </div>
          <div className="navbar-actions">
            {session ? (
              <Link href={getDashboardLink()} className="btn btn-primary btn-sm">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-secondary btn-sm">Masuk</Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm">Daftar</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ background: 'linear-gradient(rgba(10, 14, 26, 0.75), rgba(10, 14, 26, 0.95)), url(/images/hero_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-content">
          <div className="hero-text slide-up">
            <h1>Perjalanan Antar Kota <span>Lebih Mudah</span></h1>
            <p>Cari jadwal, pilih rute, dan pesan tiket travel antar kota secara online. Platform terpercaya untuk perjalanan darat Anda.</p>
            <div className="hero-actions">
              <a href="#search" className="btn btn-primary btn-lg">Cari Jadwal <ChevronRight size={18} /></a>
              <Link href="/auth/register" className="btn btn-secondary btn-lg">Daftar Gratis</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="glass hero-card slide-up" style={{ animationDelay: '0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bus size={24} color="#fff" /></div>
                <div><div style={{ fontWeight: 600 }}>Jakarta → Bandung</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Travel Jaya Abadi</div></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Berangkat</div><div style={{ fontWeight: 600 }}>06:00</div></div>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>3 jam<div style={{ width: 80, height: 1, background: 'var(--glass-border)', margin: '4px auto' }} /></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tiba</div><div style={{ fontWeight: 600 }}>09:00</div></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-primary)' }}>Rp 150.000</div>
                <span className="badge badge-success">Tersedia</span>
              </div>
            </div>
            <div className="glass hero-float" style={{ top: '5%', right: '-5%', animationDelay: '-1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Star size={16} color="#f59e0b" fill="#f59e0b" /> 4.8 Rating</div>
            </div>
            <div className="glass hero-float" style={{ bottom: '5%', left: '-5%', animationDelay: '-3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={16} color="#10b981" /> 100% Aman</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section id="search" className="search-section">
        <div className="search-container">
          <div className="section-title">
            <h2>Cari Jadwal Perjalanan</h2>
            <p>Temukan jadwal travel terbaik untuk perjalanan Anda</p>
          </div>
          <form onSubmit={handleSearch} className="glass search-box">
            <div className="search-grid">
              <div className="input-group">
                <label><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Kota Asal</label>
                <select className="glass-input" value={searchData.origin} onChange={e => setSearchData({ ...searchData, origin: e.target.value })}>
                  <option value="">Semua Kota</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Kota Tujuan</label>
                <select className="glass-input" value={searchData.destination} onChange={e => setSearchData({ ...searchData, destination: e.target.value })}>
                  <option value="">Semua Kota</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Tanggal</label>
                <input type="date" className="glass-input" value={searchData.date} onChange={e => setSearchData({ ...searchData, date: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg"><Search size={18} /> Cari</button>
            </div>
          </form>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-title">
          <h2>Mengapa Lintas Kota?</h2>
          <p>Fitur unggulan yang membuat perjalanan Anda lebih nyaman</p>
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 60 }}>
          <img src="/images/feature_bus.png" alt="Fasilitas Premium" style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-glass)' }} className="slide-up" />
        </div>
        <div className="features-grid">
          {[
            { icon: <Search size={28} />, title: 'Pencarian Mudah', desc: 'Cari jadwal berdasarkan kota asal, tujuan, dan tanggal keberangkatan dengan cepat.' },
            { icon: <Bus size={28} />, title: 'Armada Terpercaya', desc: 'Armada modern dengan fasilitas lengkap: AC, Wi-Fi, USB charger, dan kursi nyaman.' },
            { icon: <CreditCard size={28} />, title: 'Pembayaran Fleksibel', desc: 'Berbagai metode pembayaran yang aman dan proses verifikasi yang cepat.' },
            { icon: <MapPin size={28} />, title: 'Pilih Kursi', desc: 'Pilih posisi kursi favorit Anda sebelum berangkat untuk kenyamanan maksimal.' },
            { icon: <Shield size={28} />, title: 'Aman & Terpercaya', desc: 'Semua mitra travel telah terverifikasi dengan dokumen legalitas resmi.' },
            { icon: <Star size={28} />, title: 'Ulasan Transparan', desc: 'Baca ulasan jujur dari penumpang lain untuk memilih travel terbaik.' },
          ].map((f, i) => (
            <div key={i} className="glass feature-card slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="steps-section" style={{ background: 'linear-gradient(rgba(10, 14, 26, 0.85), rgba(10, 14, 26, 0.95)), url(/images/route_bali.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="section-title">
          <h2>Cara Kerja</h2>
          <p>Hanya 4 langkah mudah untuk memesan tiket travel</p>
        </div>
        <div className="steps-container">
          {[
            { n: '1', title: 'Cari Jadwal', desc: 'Masukkan kota asal, tujuan, dan tanggal keberangkatan Anda.' },
            { n: '2', title: 'Pilih & Pesan', desc: 'Pilih jadwal yang sesuai, tentukan kursi, dan buat pemesanan.' },
            { n: '3', title: 'Bayar', desc: 'Lakukan pembayaran melalui metode yang tersedia dan upload bukti.' },
            { n: '4', title: 'Berangkat!', desc: 'Tiket dikonfirmasi, siap berangkat dengan nyaman dan aman.' },
          ].map((s, i) => (
            <div key={i} className="step-item slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="step-number">{s.n}</div>
              <div className="step-content"><h3>{s.title}</h3><p>{s.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section id="rute" className="features-section">
        <div className="section-title">
          <h2>Rute Populer</h2>
          <p>Jelajahi rute perjalanan favorit</p>
        </div>
        <div className="features-grid">
          {routes.slice(0, 6).map((r, i) => (
            <div key={r.id} className="glass feature-card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }} onClick={() => router.push(`/search?origin=${r.originCity}&destination=${r.destinationCity}`)}>
              <img src={getCityImage(r.destinationCity)} alt={r.destinationCity} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <div style={{ padding: 24, textAlign: 'left' }}>
                <h3 style={{ marginBottom: 8 }}>{r.originCity} → {r.destinationCity}</h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {r.distance || 'N/A'} • Estimasi {r.estimatedTime || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h2 style={{ fontSize: '1.25rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🚐 Lintas Kota</h2>
            <p>Platform pemesanan travel antar kota terpercaya. Perjalanan lebih mudah, aman, dan nyaman.</p>
          </div>
          <div className="footer-links">
            <h4>Navigasi</h4>
            <a href="#search">Cari Jadwal</a>
            <a href="#features">Fitur</a>
            <a href="#cara-kerja">Cara Kerja</a>
          </div>
          <div className="footer-links">
            <h4>Akun</h4>
            <Link href="/auth/login">Masuk</Link>
            <Link href="/auth/register">Daftar Penumpang</Link>
            <Link href="/auth/register-mitra">Daftar Mitra Travel</Link>
          </div>
          <div className="footer-links">
            <h4>Kontak</h4>
            <a href="#">info@lintaskota.id</a>
            <a href="#">+62 21 555 1234</a>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Lintas Kota. All rights reserved.</div>
      </footer>
    </>
  );
}
