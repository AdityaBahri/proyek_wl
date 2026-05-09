'use client';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Ticket, User, LogOut, Menu, X } from 'lucide-react';
import { ToastProvider } from '@/components/ToastContext';
import { getRoleLabel } from '@/lib/utils';

export default function PassengerLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated' && session?.user?.role !== 'passenger') router.push('/');
  }, [status, session, router]);

  // Close sidebar on Escape key (H3 - User Control)
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (status === 'loading') return <div className="page-loading"><div className="spinner" /></div>;
  if (!session) return null;

  const links = [
    { href: '/passenger/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/passenger/bookings', icon: <Ticket size={18} />, label: 'Pemesanan Saya' },
    { href: '/passenger/profile', icon: <User size={18} />, label: 'Profil' },
  ];

  const initials = session.user.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'P';

  return (
    <ToastProvider>
      <div className="dashboard-layout">
        <button
          className="mobile-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ position: 'fixed', top: 16, left: 16, zIndex: 200 }}
          aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'none' }}
            className="sidebar-overlay"
          />
        )}

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <Link href="/"><h2>🚐 Lintas Kota</h2></Link>
            <p>Panel Penumpang</p>
          </div>
          <nav className="sidebar-nav" aria-label="Menu utama">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`sidebar-link ${pathname === l.href ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                aria-current={pathname === l.href ? 'page' : undefined}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-footer">
            {/* H6: User info clearly visible */}
            <div className="sidebar-user-info">
              <div className="sidebar-avatar">{initials}</div>
              <div>
                <div className="sidebar-user-name">{session.user.name}</div>
                <div className="sidebar-user-role">
                  <span className="badge badge-role-passenger" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                    {getRoleLabel(session.user.role)}
                  </span>
                </div>
              </div>
            </div>
            <button
              className="sidebar-link"
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ color: 'var(--danger)' }}
              title="Keluar dari akun"
            >
              <LogOut size={18} /> Keluar
            </button>
          </div>
        </aside>
        <main className="dashboard-main">{children}</main>
      </div>
    </ToastProvider>
  );
}
