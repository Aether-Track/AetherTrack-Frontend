# AetherTrack — Frontend

The web interface for AetherTrack: a real-time shipment tracking platform built on the Stellar blockchain. Connect your Freighter wallet, create shipments, track cargo live on a map, confirm milestones, and manage milestone-based escrow payments — all without leaving the browser.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + CSS variables |
| UI Components | [Radix UI](https://radix-ui.com/) primitives |
| State Management | [Zustand](https://zustand-demo.pmnd.rs/) |
| Server State | [TanStack Query (React Query)](https://tanstack.com/query) |
| Wallet | [Freighter](https://freighter.app/) via `@stellar/freighter-api` |
| Blockchain SDK | `@stellar/stellar-sdk` |
| Maps | [Leaflet](https://leafletjs.com/) + `react-leaflet` |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Date Formatting | [date-fns](https://date-fns.org/) |

---

## Pages & Features

### Landing Page `/`
- Hero section with value proposition and live Stellar network stats
- Feature grid: location proofs, milestone escrow, multi-party verification, analytics
- "How it works" step-by-step walkthrough
- Trust section with full feature checklist

### Dashboard `/dashboard`
- Summary stat cards (total, in-transit, delivered, disputed)
- Weekly activity area chart (Recharts)
- Status breakdown with color-coded badges
- Recent shipments list

### Shipments List `/shipments`
- Search by tracking number, cargo description, or location
- Filter by role (shipper / carrier / receiver) and status
- Pagination
- Empty state with create CTA

### Create Shipment `/shipments/new`
Three-step form with validation:
1. **Parties & Route** — receiver address, carrier address, origin, destination, estimated delivery
2. **Cargo Details** — description, weight, volume, declared value, HAZMAT / temperature flags, escrow amount
3. **Milestones** — up to 20 checkpoints with description, location, expected date, and payment slice

### Shipment Detail `/shipments/[id]`
- **Live map** — OpenStreetMap via Leaflet showing current position and full path history
- **Milestone timeline** — visual progress with per-milestone confirmation and payment status
- **Event feed** — full audit log of every on-chain action with Stellar Expert transaction links
- **Cargo panel** — weight, volume, declared value, HAZMAT tags
- **Parties panel** — shipper / carrier / receiver with Stellar Explorer links
- **Escrow panel** — total amount, released vs. locked breakdown, contract link
- **Receiver actions** — confirm milestone buttons (only shown to the receiver)
- **Shipper actions** — mark delivered, raise dispute

---

## Architecture

```
AetherTrack-Frontend/
├── next.config.ts
├── tailwind.config.ts
└── src/
    ├── app/
    │   ├── layout.tsx                  # Root layout (fonts, metadata, Navbar)
    │   ├── providers.tsx               # React Query provider
    │   ├── globals.css                 # Tailwind base + CSS variables + custom classes
    │   ├── page.tsx                    # Landing page
    │   ├── dashboard/
    │   │   └── page.tsx                # Main dashboard
    │   └── shipments/
    │       ├── page.tsx                # Shipments list
    │       ├── new/page.tsx            # Create shipment (3-step form)
    │       └── [id]/page.tsx           # Shipment detail
    ├── components/
    │   ├── layout/
    │   │   └── Navbar.tsx              # Sticky nav with mobile hamburger
    │   ├── shipment/
    │   │   ├── ShipmentCard.tsx        # Compact shipment summary card
    │   │   └── ShipmentMap.tsx         # Client-only Leaflet map
    │   └── wallet/
    │       └── WalletConnect.tsx       # Freighter connect / address display
    ├── hooks/
    │   └── useWebSocket.ts             # WebSocket subscription hook
    ├── lib/
    │   ├── api.ts                      # Typed REST API client
    │   └── utils.ts                    # cn(), shortenAddress, stroopsToXLM, etc.
    ├── store/
    │   └── wallet.ts                   # Zustand wallet + auth store (persisted)
    └── types/
        └── index.ts                    # Shared TypeScript types
```

---

## Wallet Authentication

Authentication uses a **non-custodial wallet-signature flow** powered by Freighter:

```
1. User clicks "Connect Wallet"
2. Frontend requests a challenge message from the backend
3. Freighter signs the message with the user's private key
4. Frontend sends the public key + signature to the backend
5. Backend verifies the Ed25519 signature and returns a JWT
6. JWT is stored in localStorage and attached to all subsequent API requests
```

The wallet state (public key, JWT, user profile) is persisted across page loads via Zustand's `persist` middleware using `localStorage`.

---

## Real-Time Updates

The `useShipmentSocket` hook maintains a WebSocket connection to the backend for the currently viewed shipment:

```typescript
// Subscribes when the component mounts
socket.send(JSON.stringify({ type: 'subscribe', shipmentId }))

// When the server emits a shipment:update event,
// it invalidates the React Query cache for that shipment,
// which triggers a refetch automatically
queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] })
```

The hook automatically reconnects after 3 seconds if the connection drops.

---

## Local Setup

### Prerequisites

- Node.js 20+
- [Freighter](https://freighter.app/) browser extension installed
- AetherTrack Backend running at `localhost:3001`

### 1. Clone and install

```bash
git clone https://github.com/Aether-Track/AetherTrack-Frontend.git
cd AetherTrack-Frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

### 3. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type check (no emit) |
| `npm run format` | Prettier format all files |

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL |
| `NEXT_PUBLIC_WS_URL` | Backend WebSocket URL |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_HORIZON_URL` | Stellar Horizon URL (for explorer links) |

All variables are prefixed with `NEXT_PUBLIC_` and are exposed to the browser.

---

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set the environment variables in the Vercel project settings before deploying.

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Testnet Workflow

1. Install [Freighter](https://freighter.app/) and switch it to **Testnet**
2. Fund your testnet wallet at [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
3. Start the backend (see [AetherTrack-Backend](https://github.com/Aether-Track/AetherTrack-Backend))
4. Connect your wallet and create a test shipment

---

## Related Repos

- [AetherTrack-Contracts](https://github.com/Aether-Track/AetherTrack-Contracts) — Soroban smart contracts
- [AetherTrack-Backend](https://github.com/Aether-Track/AetherTrack-Backend) — Node.js API + Stellar event indexer
