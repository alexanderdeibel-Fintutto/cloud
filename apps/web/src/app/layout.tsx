import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fintutto - Finanzbuchhaltung',
  description: 'Vollständige Finanzbuchhaltung für Kapital- und Personengesellschaften',
  keywords: ['Buchhaltung', 'Finanzen', 'Rechnungen', 'Belege', 'DATEV', 'Steuern'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
