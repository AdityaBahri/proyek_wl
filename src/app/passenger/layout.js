'use client';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Ticket, User, LogOut, Menu, X } from 'lucide-react';

export default function PassengerLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated' && session?.user?.role !== 'passenger') router.push('/');
  }, [status, session, router]);

  if (status === 'loading') return <div className="page-loading"><div className="spinner" /></div>;
  if (!session) return null;

  const links = [
    { href: '/passenger/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/passenger/bookings', icon: <Ticket size={18} />, label: 'Pemesanan Saya' },
    { href: '/passenger/profile', icon: <User size={18} />, label: 'Profil' },
  ];

  return (
    <div className="dashboard-layout">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: 'fixed', top: 16, left: 16, zIndex: 200 }}>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Link href="/"><h2>🚐 Lintas Kota</h2></Link>
          <p>Panel Penumpang</p>
        </div>
        <nav className="sidebar-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`sidebar-link ${pathname === l.href ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              {l.icon} {l.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: '0.85rem', marginBottom: 8 }}>{session.user.name}</div>
          <button className="sidebar-link" onClick={() => signOut({ callbackUrl: '/' })} style={{ color: 'var(--danger)' }}>
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
