import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'AetherTrack — Real-Time Shipment Tracking on Stellar',
    template: '%s | AetherTrack',
  },
  description:
    'Transparent, real-time cargo tracking powered by the Stellar blockchain. Immutable proof-of-location, milestone-based payments, and multi-party verification.',
  keywords: ['shipment tracking', 'stellar', 'blockchain', 'logistics', 'supply chain', 'soroban'],
  openGraph: {
    title: 'AetherTrack',
    description: 'Real-time shipment tracking on Stellar blockchain',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
