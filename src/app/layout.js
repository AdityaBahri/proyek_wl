import './globals.css';
import { SessionProvider } from './SessionProvider';

export const metadata = {
  title: 'Lintas Kota — Platform Pemesanan Travel Antar Kota',
  description: 'Cari jadwal, pilih rute, dan pesan tiket travel antar kota secara online. Platform terpercaya untuk perjalanan darat Anda.',
  keywords: 'travel antar kota, pemesanan tiket, bus travel, shuttle, perjalanan darat',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
