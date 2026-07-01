'use client';

import Link from 'next/link';
import { MapPin, Clock, Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Shipment } from '@/types';
import { cn, STATUS_COLORS, STATUS_LABELS, shortenAddress } from '@/lib/utils';

interface ShipmentCardProps {
  shipment: Shipment;
  compact?: boolean;
}

export function ShipmentCard({ shipment, compact = false }: ShipmentCardProps) {
  const confirmedMilestones = shipment.milestones.filter((m) => m.isConfirmed).length;
  const totalMilestones = shipment.milestones.length;
  const progressPct = totalMilestones > 0 ? (confirmedMilestones / totalMilestones) * 100 : 0;

  return (
    <Link
      href={`/shipments/${shipment.id}`}
      className="group block rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground">
                #{shipment.trackingNumber.slice(-8).toUpperCase()}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  STATUS_COLORS[shipment.status],
                )}
              >
                {STATUS_LABELS[shipment.status]}
              </span>
              {shipment.isHazmat && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  HAZMAT
                </span>
              )}
            </div>
            <p className="font-medium truncate">{shipment.cargoDescription}</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
      </div>

      {!compact && (
        <>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {shipment.origin} → {shipment.destination}
            </span>
          </div>

          {/* Milestone progress */}
          {totalMilestones > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {confirmedMilestones}/{totalMilestones} milestones
                </span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Carrier:{' '}
              <span className="font-mono">
                {shipment.carrier.displayName ?? shortenAddress(shipment.carrier.stellarAddress)}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(shipment.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </>
      )}
    </Link>
  );
}
