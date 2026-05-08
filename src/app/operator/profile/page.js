'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Phone, MapPin, Edit3, Mail, Lock, X } from 'lucide-react';

export default function OperatorProfile() {
  const { data: session, update } = useSession();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [form, setForm] = useState({ 
    userName: '', userEmail: '', userPassword: '', 
    agencyName: '', contactNumber: '', address: '', description: '' 
  });

  const fetchProfile = async () => {
    if (session?.user?.id) {
      const res = await fetch(`/api/agencies?userId=${session.user.id}`);
      const data = await res.json();
      const a = data.agencies?.[0] || null;
      if (a) {
        setAgency(a);
        setForm({
          userName: a.user?.name || '',
          userEmail: a.user?.email || '',
          userPassword: '',
          agencyName: a.agencyName || '',
          contactNumber: a.contactNumber || '',
          address: a.address || '',
          description: a.description || ''
        });
      }
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [session]);

  const handleOpenModal = () => {
    setForm({
      userName: agency.user?.name || '',
      userEmail: agency.user?.email || '',
      userPassword: '',
      agencyName: agency.agencyName || '',
      contactNumber: agency.contactNumber || '',
      address: agency.address || '',
      description: agency.description || ''
    });
    setMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      // Update User Data
      const userPayload = { name: form.userName, email: form.userEmail };
      if (form.userPassword) userPayload.password = form.userPassword;

      const resUser = await fetch(`/api/users/${agency.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
      });
      const dataUser = await resUser.json();
      
      if (!resUser.ok) throw new Error(dataUser.error || 'Gagal update data pengguna');

      // Update Agency Data
      const agencyPayload = {
        agencyName: form.agencyName,
        contactNumber: form.contactNumber,
        address: form.address,
        description: form.description
      };

      const resAgency = await fetch(`/api/agencies/${agency.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agencyPayload),
      });
      const dataAgency = await resAgency.json();
      
      if (!resAgency.ok) throw new Error(dataAgency.error || 'Gagal update data agensi');

      await update({ name: dataUser.user.name, email: dataUser.user.email }); // Update session
      setShowModal(false);
      fetchProfile();
    } catch (error) {
      setMsg({ type: 'error', text: error.message || 'Terjadi kesalahan pada server' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!agency) return <div className="page-container"><p>Profil agen tidak ditemukan.</p></div>;

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Profil Agen Travel</h1>
        <button className="btn btn-secondary" onClick={handleOpenModal}><Edit3 size={16} /> Edit Profil</button>
      </div>

      <div className="glass" style={{ padding: 32, maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, borderBottom: '1px solid var(--glass-border)', paddingBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            {agency.agencyName[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{agency.agencyName}</h2>
            <span className={`badge ${agency.isActive ? 'badge-success' : 'badge-danger'}`}>{agency.isActive ? 'Mitra Aktif' : 'Nonaktif'}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><User size={14} /> Pengelola</label>
              <div style={{ fontWeight: 500 }}>{agency.user?.name}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><Mail size={14} /> Email Pengelola</label>
              <div style={{ fontWeight: 500 }}>{agency.user?.email}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><Phone size={14} /> Nomor Kontak Agen</label>
              <div style={{ fontWeight: 500 }}>{agency.contactNumber}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><MapPin size={14} /> Alamat Kantor</label>
              <div style={{ fontWeight: 500 }}>{agency.address}</div>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>Deskripsi</label>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{agency.description || '-'}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>Total Armada</label>
              <div style={{ fontWeight: 500 }}>{agency.vehicles?.length || 0} Kendaraan</div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>Edit Profil Mitra</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              {msg.text && <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 8, fontSize: '0.85rem', background: msg.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: msg.type === 'error' ? '#ef4444' : 'var(--success)', border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>{msg.text}</div>}
              
              <div className="form-grid">
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--accent-primary)' }}>Data Pengelola</h4>
                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label>Nama Pengelola</label>
                    <input type="text" className="glass-input" required value={form.userName} onChange={e => setForm({...form, userName: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label>Email Pengelola</label>
                    <input type="email" className="glass-input" required value={form.userEmail} onChange={e => setForm({...form, userEmail: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={14}/> Ganti Password (Opsional)</label>
                    <input type="password" className="glass-input" value={form.userPassword} onChange={e => setForm({...form, userPassword: e.target.value})} placeholder="Kosongkan jika tidak diubah" minLength={6} />
                  </div>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--accent-primary)' }}>Data Agen Travel</h4>
                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label>Nama Agen</label>
                    <input type="text" className="glass-input" required value={form.agencyName} onChange={e => setForm({...form, agencyName: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label>Nomor Kontak CS</label>
                    <input type="tel" className="glass-input" required value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label>Alamat Kantor</label>
                    <textarea className="glass-input" required value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows="3" />
                  </div>
                </div>
                
                <div className="full-width">
                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label>Deskripsi Singkat</label>
                    <textarea className="glass-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="2" placeholder="Ceritakan singkat tentang layanan travel Anda" />
                  </div>
                </div>
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
