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
    active: 'Aktif',
    inactive: 'Nonaktif',
  };
  return labels[status] || status;
}

export function getStatusBadgeClass(status) {
  const classes = {
    pending: 'badge-warning',
    paid: 'badge-info',
    verified: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    rejected: 'badge-danger',
  };
  return classes[status] || 'badge-info';
}

// Format booking ID from UUID to short readable format: #TKT-XXXX
export function formatBookingId(id, index) {
  if (index !== undefined) return `#TKT-${String(index + 1).padStart(3, '0')}`;
  return `#${String(id).slice(-6).toUpperCase()}`;
}

export function getRoleLabel(role) {
  const labels = {
    super_admin: 'Super Admin',
    operator: 'Operator',
    passenger: 'Penumpang',
  };
  return labels[role] || role;
}

export function getRoleBadgeClass(role) {
  const classes = {
    super_admin: 'badge-danger',
    operator: 'badge-warning',
    passenger: 'badge-info',
  };
  return classes[role] || 'badge-info';
}

export function validatePhone(phone) {
  // Indonesian phone: starts with 08 or +62, 10-14 digits
  return /^(\+62|08)[0-9]{8,12}$/.test(phone.replace(/\s|-/g, ''));
}

export function mapAuthError(error) {
  const msgs = {
    'CredentialsSignin': 'Email atau password salah. Silakan periksa kembali.',
    'Email tidak ditemukan': 'Email tidak terdaftar di sistem kami.',
    'Password salah': 'Password yang Anda masukkan salah.',
    'Akun Mitra Anda sedang menunggu persetujuan dari Admin.': 'Akun Anda sedang dalam proses verifikasi oleh Admin. Harap tunggu konfirmasi.',
    'Email dan password harus diisi': 'Harap isi email dan password terlebih dahulu.',
  };
  return msgs[error] || error || 'Terjadi kesalahan. Silakan coba lagi.';
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
