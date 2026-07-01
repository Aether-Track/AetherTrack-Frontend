'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Package, Plus, Search, Filter } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { api } from '@/lib/api';
import { ShipmentCard } from '@/components/shipment/ShipmentCard';
import { cn } from '@/lib/utils';
import type { ShipmentStatus } from '@/types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'CREATED', label: 'Created' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'AT_CHECKPOINT', label: 'At Checkpoint' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'DISPUTED', label: 'Disputed' },
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'shipper', label: 'As Shipper' },
  { value: 'carrier', label: 'As Carrier' },
  { value: 'receiver', label: 'As Receiver' },
];

export default function ShipmentsPage() {
  const router = useRouter();
  const { isConnected } = useWalletStore();
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isConnected) router.push('/');
  }, [isConnected, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', { status, role, page }],
    queryFn: () =>
      api.shipments.list({
        status: status || undefined,
        role,
        page,
        limit: 12,
      }),
    enabled: isConnected,
  });

  const shipments = data?.data ?? [];
  const meta = data?.meta;

  const filtered = search
    ? shipments.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
          s.cargoDescription.toLowerCase().includes(search.toLowerCase()) ||
          s.origin.toLowerCase().includes(search.toLowerCase()) ||
          s.destination.toLowerCase().includes(search.toLowerCase()),
      )
    : shipments;

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shipments</h1>
          <p className="text-muted-foreground mt-0.5">
            {meta?.total ?? 0} total shipments
          </p>
        </div>
        <Link
          href="/shipments/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Shipment
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by tracking number, cargo, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <div className="flex rounded-lg border border-border overflow-hidden">
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setStatus(o.value); setPage(1); }}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  status === o.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipment grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-16 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="font-medium">No shipments found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {search ? 'Try a different search term.' : 'Create your first shipment to get started.'}
          </p>
          {!search && (
            <Link
              href="/shipments/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Create Shipment
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => (
            <ShipmentCard key={s.id} shipment={s} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            disabled={page === meta.pages}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
