'use client';
import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronLeft, CreditCard, Star, Upload, X } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, parseJSON } from '@/lib/utils';
import ConfirmModal from '@/components/ConfirmModal';

export default function BookingDetailPage({ params }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: 'transfer_bank', proofUrl: '' });
  const [proofFile, setProofFile] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showPayment, setShowPayment] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [confirmProps, setConfirmProps] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const fetchBooking = () => {
    fetch(`/api/bookings/${id}`).then(r => r.json()).then(d => { setBooking(d.booking); setLoading(false); });
  };

  useEffect(() => { fetchBooking(); }, [id]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!booking) return <div className="page-container"><p>Booking tidak ditemukan</p></div>;

  const handlePayment = async () => {
    if (!proofFile && paymentForm.paymentMethod === 'transfer_bank') {
      setMsg('Harap unggah bukti pembayaran transfer bank.');
      return;
    }
    
    setSubmitting(true);
    let finalProofUrl = paymentForm.proofUrl;

    if (proofFile) {
      const formData = new FormData();
      formData.append('file', proofFile);
      
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          finalProofUrl = data.url;
        } else {
          setMsg('Gagal mengunggah foto bukti pembayaran.');
          setSubmitting(false);
          return;
        }
      } catch (err) {
        setMsg('Gagal mengunggah foto bukti pembayaran.');
        setSubmitting(false);
        return;
      }
    }

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id, paymentMethod: paymentForm.paymentMethod, proofUrl: finalProofUrl }),
    });
    if (res.ok) { setShowPayment(false); setMsg('Pembayaran berhasil dikirim!'); fetchBooking(); }
    setSubmitting(false);
  };

  const handleReview = async () => {
    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id, passengerId: session.user.id, ...reviewForm }),
    });
    if (res.ok) { setShowReview(false); setMsg('Ulasan berhasil dikirim!'); fetchBooking(); }
    setSubmitting(false);
  };

  const handleCancel = async () => {
    setConfirmProps({
      isOpen: true,
      title: 'Konfirmasi Pembatalan',
      message: 'Yakin ingin membatalkan pemesanan?',
      isDanger: true,
      confirmText: 'Ya, Batalkan',
      onConfirm: async () => {
        await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        fetchBooking();
      }
    });
  };

  return (
    <div className="fade-in">
      <Link href="/passenger/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
        <ChevronLeft size={16} /> Kembali
      </Link>

      <div className="dashboard-header">
        <div>
          <h1>Detail Pemesanan</h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>ID: {booking.id}</p>
        </div>
        <span className={`badge badge-${booking.status === 'paid' || booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'warning'}`} style={{ fontSize: '0.9rem', padding: '8px 20px' }}>
          {booking.status === 'pending' ? 'Menunggu Pembayaran' : booking.status === 'paid' ? 'Dibayar' : booking.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
        </span>
      </div>

      {msg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, color: '#10b981', fontSize: '0.85rem' }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          {/* Trip Info */}
          <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Informasi Perjalanan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Rute</span><div style={{ fontWeight: 600 }}>{booking.schedule?.route?.originCity} → {booking.schedule?.route?.destinationCity}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Travel</span><div style={{ fontWeight: 600 }}>{booking.schedule?.vehicle?.agency?.agencyName}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Berangkat</span><div style={{ fontWeight: 600 }}>{formatDate(booking.schedule?.departureDateTime)} • {formatTime(booking.schedule?.departureDateTime)}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Kendaraan</span><div style={{ fontWeight: 600 }}>{booking.schedule?.vehicle?.vehicleType} ({booking.schedule?.vehicle?.licensePlate})</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Kursi</span><div style={{ fontWeight: 600 }}>{parseJSON(booking.selectedSeats).join(', ')}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total</span><div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{formatCurrency(booking.totalPrice)}</div></div>
            </div>
          </div>

          {/* Payment Info */}
          {booking.payment && (
            <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16 }}>Informasi Pembayaran</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Metode</span><div style={{ fontWeight: 600 }}>{booking.payment.paymentMethod}</div></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status</span><div><span className={`badge badge-${booking.payment.paymentStatus === 'verified' ? 'success' : booking.payment.paymentStatus === 'rejected' ? 'danger' : 'warning'}`}>{booking.payment.paymentStatus === 'verified' ? 'Terverifikasi' : booking.payment.paymentStatus === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}</span></div></div>
              </div>
            </div>
          )}

          {/* Review */}
          {booking.review && (
            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Ulasan Anda</h3>
              <div className="star-rating" style={{ marginBottom: 8 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={20} className={`star ${s <= booking.review.rating ? 'filled' : ''}`} fill={s <= booking.review.rating ? '#f59e0b' : 'none'} />)}
              </div>
              {booking.review.comment && <p style={{ color: 'var(--text-secondary)' }}>{booking.review.comment}</p>}
            </div>
          )}
        </div>

        <div>
          {/* Actions */}
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Aksi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {booking.status === 'pending' && !booking.payment && (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowPayment(true)}>
                  <CreditCard size={16} /> Bayar Sekarang
                </button>
              )}
              {(booking.status === 'paid' || booking.status === 'completed') && !booking.review && (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowReview(true)}>
                  <Star size={16} /> Beri Ulasan
                </button>
              )}
              {booking.status === 'pending' && (
                <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleCancel}>Batalkan</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Pembayaran</h3><button className="modal-close" onClick={() => setShowPayment(false)}><X size={20} /></button></div>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Metode Pembayaran</label>
              <select className="glass-input" value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}>
                <option value="transfer_bank">Transfer Bank</option>
                <option value="e_wallet">E-Wallet</option>
                <option value="cash">Tunai</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Unggah Bukti Pembayaran (Foto/Gambar)</label>
              <input type="file" accept="image/*" className="glass-input" onChange={e => setProofFile(e.target.files[0])} />
              {proofFile && <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>File terpilih: {proofFile.name}</div>}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-primary)', marginBottom: 20, textAlign: 'center' }}>Total: {formatCurrency(booking.totalPrice)}</div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePayment} disabled={submitting}>{submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}</button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="modal-overlay" onClick={() => setShowReview(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Beri Ulasan</h3><button className="modal-close" onClick={() => setShowReview(false)}><X size={20} /></button></div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Rating</label>
              <div className="star-rating">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={28} className={`star ${s <= reviewForm.rating ? 'filled' : ''}`} fill={s <= reviewForm.rating ? '#f59e0b' : 'none'} onClick={() => setReviewForm({ ...reviewForm, rating: s })} style={{ cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label>Komentar</label>
              <textarea className="glass-input" placeholder="Bagikan pengalaman perjalanan Anda..." value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleReview} disabled={submitting}>{submitting ? 'Mengirim...' : 'Kirim Ulasan'}</button>
          </div>
        </div>
      )}

      <ConfirmModal 
        {...confirmProps} 
        onCancel={() => setConfirmProps({ ...confirmProps, isOpen: false })} 
      />
    </div>
  );
}
