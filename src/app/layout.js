import { Outfit, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { AuthProvider } from '@/components/auth/AuthProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['200', '300', '400', '500'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['300', '400'],
});

export const metadata = {
  title: 'AURA — Premium Emotional Space',
  description:
    'A private emotional space that helps you understand what you\'re feeling, talk without judgment, and find a small next step that fits you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>
        <AuthProvider>
          <div className="ambient-glow" />
          <div className="noise-overlay" />
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
