import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ShipmentStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 1)}…${address.slice(-chars)}`;
}

export function stroopsToXLM(stroops: string | number | bigint): string {
  return (Number(stroops) / 10_000_000).toFixed(7).replace(/\.?0+$/, '');
}

export function weightDisplay(grams: string | number): string {
  const g = Number(grams);
  return g >= 1_000_000 ? `${(g / 1_000_000).toFixed(2)} t` : g >= 1_000 ? `${(g / 1_000).toFixed(2)} kg` : `${g} g`;
}

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  CREATED: 'Created',
  IN_TRANSIT: 'In Transit',
  AT_CHECKPOINT: 'At Checkpoint',
  DELIVERED: 'Delivered',
  DISPUTED: 'Disputed',
  CANCELLED: 'Cancelled',
};

export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  CREATED: 'status-created',
  IN_TRANSIT: 'status-in-transit',
  AT_CHECKPOINT: 'status-checkpoint',
  DELIVERED: 'status-delivered',
  DISPUTED: 'status-disputed',
  CANCELLED: 'status-cancelled',
};

export function explorerUrl(txHash: string, network = 'testnet'): string {
  const base = network === 'mainnet' ? 'https://stellar.expert/explorer/public' : 'https://stellar.expert/explorer/testnet';
  return `${base}/tx/${txHash}`;
}
