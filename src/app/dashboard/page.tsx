'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { api } from '@/lib/api';
import { ShipmentCard } from '@/components/shipment/ShipmentCard';
import { cn, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';
import type { ShipmentStatus } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock activity chart data (replace with real API data)
const activityData = [
  { day: 'Mon', shipments: 4 },
  { day: 'Tue', shipments: 7 },
  { day: 'Wed', shipments: 5 },
  { day: 'Thu', shipments: 9 },
  { day: 'Fri', shipments: 12 },
  { day: 'Sat', shipments: 6 },
  { day: 'Sun', shipments: 3 },
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected } = useWalletStore();

  useEffect(() => {
    if (!isConnected) router.push('/');
  }, [isConnected, router]);

  const { data: allShipments, isLoading } = useQuery({
    queryKey: ['shipments', 'all'],
    queryFn: () => api.shipments.list({ limit: 100 }),
    enabled: isConnected,
  });

  const { data: recentShipments } = useQuery({
    queryKey: ['shipments', 'recent'],
    queryFn: () => api.shipments.list({ limit: 5 }),
    enabled: isConnected,
  });

  const shipments = allShipments?.data ?? [];
  const recent = recentShipments?.data ?? [];

  const statusCounts = shipments.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<ShipmentStatus, number>,
  );

  const inTransitCount = statusCounts['IN_TRANSIT'] ?? 0;
  const deliveredCount = statusCounts['DELIVERED'] ?? 0;
  const disputedCount = statusCounts['DISPUTED'] ?? 0;

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-0.5">
            Overview of all your shipments and activity.
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

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={Package}
          label="Total Shipments"
          value={isLoading ? '…' : shipments.length}
          sub={`${allShipments?.meta.total ?? 0} lifetime`}
        />
        <StatCard
          icon={TrendingUp}
          label="In Transit"
          value={isLoading ? '…' : inTransitCount}
          sub="Active right now"
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={isLoading ? '…' : deliveredCount}
          sub="Successfully completed"
        />
        <StatCard
          icon={AlertTriangle}
          label="Disputed"
          value={isLoading ? '…' : disputedCount}
          sub={disputedCount > 0 ? 'Needs attention' : 'All clear'}
          className={disputedCount > 0 ? 'border-destructive/40' : ''}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Shipment Activity (This Week)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="shipmentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(245,75%,60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(245,75%,60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="shipments"
                stroke="hsl(245,75%,60%)"
                strokeWidth={2}
                fill="url(#shipmentGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Status Breakdown</h2>
          <div className="space-y-3">
            {(Object.entries(statusCounts) as [ShipmentStatus, number][]).length === 0 ? (
              <p className="text-sm text-muted-foreground">No shipments yet.</p>
            ) : (
              (Object.entries(statusCounts) as [ShipmentStatus, number][]).map(
                ([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        STATUS_COLORS[status],
                      )}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </div>

      {/* Recent shipments */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent Shipments</h2>
          <Link
            href="/shipments"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="font-medium">No shipments yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first shipment to start tracking.
            </p>
            <Link
              href="/shipments/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Create Shipment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        )}
      </div>

      {/* Clock stat */}
      <div className="mt-6 rounded-xl border border-border bg-card p-4 flex items-center gap-3">
        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Shipment data is indexed from the Stellar blockchain every 5 seconds. All location
          updates, milestone confirmations, and payment releases are verifiable on-chain.
        </p>
      </div>
    </div>
  );
}
