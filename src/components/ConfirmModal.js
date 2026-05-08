import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 3000 }}>
      <div className="modal-content slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, padding: '24px 32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDanger ? 'var(--danger)' : 'var(--warning)' }}>
            <AlertTriangle size={32} />
          </div>
        </div>
        
        <h3 style={{ marginBottom: 8, fontSize: '1.25rem' }}>{title || 'Konfirmasi'}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.5 }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} style={{ flex: 1 }} onClick={() => { onConfirm(); onCancel(); }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
