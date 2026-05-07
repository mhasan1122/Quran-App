import type { Metadata } from 'next';
import './globals.css';
import { SettingsProvider } from './context/SettingsContext';

export const metadata: Metadata = {
  title: 'Quran Mazid - Read Al Quran Online',
  description: 'Read Al Quran online with translations, Tafsir & Word by Word.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
