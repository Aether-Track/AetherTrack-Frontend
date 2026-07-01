export type ShipmentStatus =
  | 'CREATED'
  | 'IN_TRANSIT'
  | 'AT_CHECKPOINT'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'CANCELLED';

export type EventType =
  | 'SHIPMENT_CREATED'
  | 'LOCATION_UPDATED'
  | 'MILESTONE_CONFIRMED'
  | 'STATUS_CHANGED'
  | 'CUSTODY_TRANSFERRED'
  | 'PAYMENT_DEPOSITED'
  | 'PAYMENT_RELEASED'
  | 'DISPUTE_RAISED'
  | 'DISPUTE_RESOLVED';

export interface User {
  id: string;
  stellarAddress: string;
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role: 'SHIPPER' | 'CARRIER' | 'RECEIVER' | 'ADMIN';
  createdAt: string;
}

export interface Milestone {
  id: string;
  shipmentId: string;
  index: number;
  description: string;
  locationName: string;
  expectedAt?: string | null;
  confirmedAt?: string | null;
  confirmedByAddr?: string | null;
  isConfirmed: boolean;
  amountStroops?: string | null;
  paymentReleased: boolean;
  paymentReleasedAt?: string | null;
}

export interface LocationRecord {
  id: string;
  shipmentId: string;
  latitude: number;
  longitude: number;
  altitudeM?: number | null;
  reporterAddr: string;
  metadata?: Record<string, unknown> | null;
  txHash?: string | null;
  recordedAt: string;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  type: EventType;
  actorAddr?: string | null;
  actor?: Pick<User, 'stellarAddress' | 'displayName'> | null;
  payload?: Record<string, unknown> | null;
  txHash?: string | null;
  occurredAt: string;
}

export interface Shipment {
  id: string;
  contractShipmentId?: string | null;
  trackingNumber: string;
  status: ShipmentStatus;

  shipperId: string;
  carrierId: string;
  receiverId: string;
  shipper: Pick<User, 'id' | 'stellarAddress' | 'displayName'>;
  carrier: Pick<User, 'id' | 'stellarAddress' | 'displayName'>;
  receiver: Pick<User, 'id' | 'stellarAddress' | 'displayName'>;

  origin: string;
  destination: string;
  estimatedDelivery?: string | null;

  cargoDescription: string;
  weightG: string;
  volumeCm3: string;
  isHazmat: boolean;
  isTempControlled: boolean;
  declaredValueUsd?: string | null;

  escrowContractId?: string | null;
  totalAmountStroops?: string | null;
  tokenAddress?: string | null;

  currentLatitude?: number | null;
  currentLongitude?: number | null;
  lastLocationAt?: string | null;

  milestones: Milestone[];
  events?: ShipmentEvent[];
  locationHistory?: LocationRecord[];

  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  token: string | null;
  user: User | null;
}
