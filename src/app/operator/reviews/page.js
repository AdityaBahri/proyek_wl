'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function OperatorReviews() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.agencyId) {
      fetch(`/api/reviews?agencyId=${session.user.agencyId}`)
        .then(r => r.json())
        .then(d => { setReviews(d.reviews || []); setLoading(false); });
    }
  }, [session]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Ulasan Penumpang</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Melihat masukan dan penilaian dari penumpang Anda.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="glass stat-card" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--warning)', fontFamily: 'var(--font-heading)' }}>{averageRating}</div>
          <div>
            <div className="star-rating" style={{ marginBottom: 4 }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={20} className={`star ${s <= Math.round(averageRating) ? 'filled' : ''}`} fill={s <= Math.round(averageRating) ? '#f59e0b' : 'none'} />)}
            </div>
            <div className="stat-label">Rata-rata dari {reviews.length} ulasan</div>
          </div>
        </div>
      </div>

      {loading ? <div className="spinner" /> : reviews.length === 0 ? (
        <div className="glass empty-state"><MessageSquare size={48} /><p>Belum ada ulasan.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map(r => (
            <div key={r.id} className="glass" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{r.passenger?.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(r.createdAt)} • Rute: {r.booking?.schedule?.route?.originCity} → {r.booking?.schedule?.route?.destinationCity}</div>
                </div>
                <div className="star-rating">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} className={`star ${s <= r.rating ? 'filled' : ''}`} fill={s <= r.rating ? '#f59e0b' : 'none'} />)}
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.comment || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Tidak ada komentar tertulis.</span>}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
