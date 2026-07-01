'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, LayoutDashboard, Plus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { useWalletStore } from '@/store/wallet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/shipments', label: 'Shipments', icon: Package },
  { href: '/shipments/new', label: 'New Shipment', icon: Plus },
];

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useWalletStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Package className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Aether<span className="text-primary">Track</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {isConnected && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <WalletConnect />
          {/* Mobile hamburger */}
          {isConnected && (
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && isConnected && (
        <nav className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === href ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
