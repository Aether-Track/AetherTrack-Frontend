'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  Truck,
  User,
  Info,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import dynamic from 'next/dynamic';
import { useWalletStore } from '@/store/wallet';
import { api } from '@/lib/api';
import { useShipmentSocket } from '@/hooks/useWebSocket';
import {
  cn,
  STATUS_COLORS,
  STATUS_LABELS,
  shortenAddress,
  stroopsToXLM,
  explorerUrl,
  weightDisplay,
} from '@/lib/utils';
import type { Milestone, ShipmentEvent } from '@/types';

// Leaflet can only render client-side
const ShipmentMap = dynamic(() => import('@/components/shipment/ShipmentMap'), {
  ssr: false,
  loading: () => <div className="map-container bg-muted animate-pulse" />,
});

function MilestoneRow({
  milestone,
  canConfirm,
  onConfirm,
  confirming,
}: {
  milestone: Milestone;
  canConfirm: boolean;
  onConfirm: (index: number) => void;
  confirming: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        {milestone.isConfirmed ? (
          <CheckCircle2 className="h-5 w-5 text-stellar-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', !milestone.isConfirmed && 'text-muted-foreground')}>
          {milestone.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{milestone.locationName}</span>
          {milestone.expectedAt && (
            <>
              <span>·</span>
              <Clock className="h-3 w-3" />
              <span>Expected {format(new Date(milestone.expectedAt), 'MMM d, yyyy')}</span>
            </>
          )}
        </div>
        {milestone.isConfirmed && milestone.confirmedAt && (
          <p className="text-xs text-stellar-500 mt-0.5">
            Confirmed {formatDistanceToNow(new Date(milestone.confirmedAt), { addSuffix: true })}
            {milestone.paymentReleased && ' · Payment released'}
          </p>
        )}
        {milestone.amountStroops && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {stroopsToXLM(milestone.amountStroops)} XLM
            {milestone.paymentReleased ? (
              <span className="text-stellar-500"> (released)</span>
            ) : (
              <span className="text-amber-500"> (locked)</span>
            )}
          </p>
        )}
      </div>
      {canConfirm && !milestone.isConfirmed && (
        <button
          onClick={() => onConfirm(milestone.index)}
          disabled={confirming}
          className="flex-shrink-0 rounded-md border border-primary/50 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          Confirm
        </button>
      )}
    </div>
  );
}

function EventRow({ event }: { event: ShipmentEvent }) {
  const icons: Record<string, React.ElementType> = {
    SHIPMENT_CREATED: Package,
    LOCATION_UPDATED: MapPin,
    MILESTONE_CONFIRMED: CheckCircle2,
    STATUS_CHANGED: Info,
    CUSTODY_TRANSFERRED: Truck,
    PAYMENT_DEPOSITED: Info,
    PAYMENT_RELEASED: CheckCircle2,
    DISPUTE_RAISED: AlertTriangle,
    DISPUTE_RESOLVED: CheckCircle2,
  };
  const Icon = icons[event.type] ?? Info;

  const labels: Record<string, string> = {
    SHIPMENT_CREATED: 'Shipment created',
    LOCATION_UPDATED: 'Location updated',
    MILESTONE_CONFIRMED: 'Milestone confirmed',
    STATUS_CHANGED: 'Status changed',
    CUSTODY_TRANSFERRED: 'Custody transferred',
    PAYMENT_DEPOSITED: 'Payment deposited',
    PAYMENT_RELEASED: 'Payment released',
    DISPUTE_RAISED: 'Dispute raised',
    DISPUTE_RESOLVED: 'Dispute resolved',
  };

  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{labels[event.type] ?? event.type}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          {event.actor?.displayName ?? (event.actorAddr ? shortenAddress(event.actorAddr) : 'System')}
          <span>·</span>
          {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
          {event.txHash && (
            <>
              <span>·</span>
              <a
                href={explorerUrl(event.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-primary hover:underline"
              >
                Tx <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShipmentDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isConnected, user } = useWalletStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected) router.push('/');
  }, [isConnected, router]);

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => api.shipments.get(id),
    enabled: isConnected && !!id,
    refetchInterval: 15_000,
  });

  // Subscribe to real-time updates
  useShipmentSocket(id ?? null);

  const [confirmingIdx, setConfirmingIdx] = useState<number | null>(null);
  const { mutate: confirmMilestone } = useMutation({
    mutationFn: (index: number) => api.shipments.confirmMilestone(id, index),
    onMutate: (index) => setConfirmingIdx(index),
    onSettled: () => {
      setConfirmingIdx(null);
      queryClient.invalidateQueries({ queryKey: ['shipment', id] });
    },
  });

  const isReceiver = user?.id === shipment?.receiverId;
  const isShipper = user?.id === shipment?.shipperId;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="container py-16 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="font-medium">Shipment not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const locationHistory = shipment.locationHistory ?? [];
  const latestLocation =
    shipment.currentLatitude && shipment.currentLongitude
      ? { lat: Number(shipment.currentLatitude), lng: Number(shipment.currentLongitude) }
      : null;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shipments
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold font-mono">
            #{shipment.trackingNumber.slice(-8).toUpperCase()}
          </h1>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              STATUS_COLORS[shipment.status],
            )}
          >
            {STATUS_LABELS[shipment.status]}
          </span>
          {shipment.isHazmat && (
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
              HAZMAT
            </span>
          )}
          {shipment.isTempControlled && (
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
              TEMP CONTROLLED
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {shipment.origin} → {shipment.destination}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-sm">Live Location</h2>
              {shipment.lastLocationAt && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Updated {formatDistanceToNow(new Date(shipment.lastLocationAt), { addSuffix: true })}
                </span>
              )}
            </div>
            <ShipmentMap
              currentLocation={latestLocation}
              locationHistory={locationHistory.map((l) => ({
                lat: Number(l.latitude),
                lng: Number(l.longitude),
                timestamp: l.recordedAt,
              }))}
            />
          </div>

          {/* Milestones */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-4">Milestones</h2>
            <div className="space-y-5">
              {shipment.milestones.map((m) => (
                <MilestoneRow
                  key={m.id}
                  milestone={m}
                  canConfirm={isReceiver}
                  onConfirm={confirmMilestone}
                  confirming={confirmingIdx === m.index}
                />
              ))}
            </div>
          </div>

          {/* Event feed */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-4">Event History</h2>
            {(shipment.events?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            ) : (
              <div className="space-y-4">
                {(shipment.events ?? []).map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cargo info */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-3">Cargo</h2>
            <p className="text-sm mb-3">{shipment.cargoDescription}</p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Weight</dt>
                <dd className="font-medium">{weightDisplay(Number(shipment.weightG))}</dd>
              </div>
              {shipment.declaredValueUsd && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Value</dt>
                  <dd className="font-medium">${Number(shipment.declaredValueUsd).toLocaleString()}</dd>
                </div>
              )}
              {shipment.estimatedDelivery && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Est. Delivery</dt>
                  <dd className="font-medium">
                    {format(new Date(shipment.estimatedDelivery), 'MMM d, yyyy')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Parties */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm mb-3">Parties</h2>
            <div className="space-y-3">
              {(
                [
                  { role: 'Shipper', party: shipment.shipper, icon: Package },
                  { role: 'Carrier', party: shipment.carrier, icon: Truck },
                  { role: 'Receiver', party: shipment.receiver, icon: User },
                ] as const
              ).map(({ role, party, icon: Icon }) => (
                <div key={role} className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{role}</p>
                    <p className="text-xs font-mono font-medium truncate">
                      {party.displayName ?? shortenAddress(party.stellarAddress)}
                    </p>
                  </div>
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${party.stellarAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-muted-foreground hover:text-primary flex-shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow */}
          {shipment.totalAmountStroops && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-sm mb-3">Payment Escrow</h2>
              <p className="text-2xl font-bold">{stroopsToXLM(shipment.totalAmountStroops)} XLM</p>
              <p className="text-xs text-muted-foreground mt-1">
                {shipment.milestones.filter((m) => m.paymentReleased).length}/
                {shipment.milestones.filter((m) => m.amountStroops).length} payments released
              </p>
              {shipment.escrowContractId && (
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${shipment.escrowContractId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View contract <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Shipper actions */}
          {isShipper && shipment.status !== 'DELIVERED' && shipment.status !== 'CANCELLED' && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-sm mb-3">Actions</h2>
              <div className="space-y-2">
                {shipment.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => api.shipments.updateStatus(id, 'DELIVERED').then(() =>
                      queryClient.invalidateQueries({ queryKey: ['shipment', id] })
                    )}
                    className="w-full rounded-lg bg-stellar-500 px-3 py-2 text-sm font-medium text-white hover:bg-stellar-700 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
                <button
                  onClick={() => api.shipments.updateStatus(id, 'DISPUTED').then(() =>
                    queryClient.invalidateQueries({ queryKey: ['shipment', id] })
                  )}
                  className="w-full rounded-lg border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Raise Dispute
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
