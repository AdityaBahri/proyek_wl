export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status) {
  const colors = {
    pending: '#f59e0b',
    paid: '#6C63FF',
    verified: '#10b981',
    cancelled: '#ef4444',
    completed: '#10b981',
    rejected: '#ef4444',
  };
  return colors[status] || '#94a3b8';
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Menunggu',
    paid: 'Dibayar',
    verified: 'Terverifikasi',
    cancelled: 'Dibatalkan',
    completed: 'Selesai',
    rejected: 'Ditolak',
  };
  return labels[status] || status;
}

export function generateSeatLayout(capacity) {
  const seats = [];
  const rows = Math.ceil(capacity / 4);
  const letters = ['A', 'B', 'C', 'D'];
  let count = 0;
  for (let i = 1; i <= rows; i++) {
    for (let j = 0; j < 4; j++) {
      if (count >= capacity) break;
      seats.push(`${letters[j]}${i}`);
      count++;
    }
  }
  return seats;
}

export function parseJSON(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
