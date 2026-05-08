'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Phone, Mail, Edit3, X, Lock, Shield } from 'lucide-react';

export default function PassengerProfile() {
  const { data: session, update } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const fetchProfile = async () => {
    if (session?.user?.id) {
      const res = await fetch(`/api/users/${session.user.id}`);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setForm({ name: data.user.name, email: data.user.email, phone: data.user.phone || '', password: '' });
      }
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [session]);

  const handleOpenModal = () => {
    setForm({ name: user.name, email: user.email, phone: user.phone || '', password: '' });
    setMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    const payload = { name: form.name, email: form.email, phone: form.phone };
    if (form.password) payload.password = form.password;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error });
      } else {
        await update({ name: data.user.name, email: data.user.email }); // Update session
        setShowModal(false);
        fetchProfile();
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Terjadi kesalahan pada server' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!user) return <div className="page-container"><p>Profil tidak ditemukan.</p></div>;

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Profil Saya</h1>
        <button className="btn btn-secondary" onClick={handleOpenModal}><Edit3 size={16} /> Edit Profil</button>
      </div>

      <div className="glass" style={{ padding: 32, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>{user.name}</h2>
            <span className="badge badge-info">Penumpang</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
            <Mail size={18} color="var(--text-muted)" /><div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div><div>{user.email}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
            <Phone size={18} color="var(--text-muted)" /><div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No. Telepon</div><div>{user.phone || '-'}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
            <Shield size={18} color="var(--text-muted)" /><div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role</div><div style={{ textTransform: 'capitalize' }}>{user.role}</div></div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>Edit Profil</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              {msg.text && <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 8, fontSize: '0.85rem', background: msg.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: msg.type === 'error' ? '#ef4444' : 'var(--success)', border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>{msg.text}</div>}
              
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label>Nama Lengkap</label>
                <input type="text" className="glass-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label>Email</label>
                <input type="email" className="glass-input" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label>No. Telepon</label>
                <input type="tel" className="glass-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="08xxxxxxxxxx" />
              </div>
              
              <div style={{ margin: '24px 0 16px', borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Lock size={14}/> Ganti Password (Opsional)</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Kosongkan jika tidak ingin mengubah password.</p>
                <input type="password" className="glass-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password baru" minLength={6} />
              </div>

              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" style={{ width: 16, height: 16, margin: 0, borderWidth: 2 }} /> : 'Simpan Perubahan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
