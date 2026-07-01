import Link from 'next/link';
import {
  Package,
  MapPin,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Lock,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Location Proofs',
    description:
      'Every GPS ping is written on-chain via Soroban. Immutable, timestamped, and accessible to all authorised parties instantly.',
  },
  {
    icon: Lock,
    title: 'Milestone-Based Escrow',
    description:
      'Payments are locked in a smart contract and released automatically when each delivery milestone is confirmed — zero trust required.',
  },
  {
    icon: Shield,
    title: 'Multi-Party Verification',
    description:
      'Shippers, carriers, receivers, and customs agents each hold cryptographic authority over their role in the shipment lifecycle.',
  },
  {
    icon: Zap,
    title: 'Stellar-Speed Settlement',
    description:
      "Transactions confirm in 3–5 seconds with fees under $0.001. Stellar's throughput means no bottlenecks even at global scale.",
  },
  {
    icon: Globe,
    title: 'Cross-Border Ready',
    description:
      'Trade across 180+ currencies with Stellar's built-in DEX. Customs documentation anchored on-chain removes paper-based delays.',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description:
      'Dashboard-level visibility: on-time rates, transit heatmaps, payment status, and dispute resolution timelines — all in one view.',
  },
];

const stats = [
  { label: 'Transaction Speed', value: '3–5s' },
  { label: 'Transaction Fee', value: '<$0.001' },
  { label: 'Network Uptime', value: '99.99%' },
  { label: 'Global Validators', value: '1,000+' },
];

const steps = [
  { step: '01', title: 'Connect Wallet', description: 'Connect your Freighter wallet — your Stellar address is your identity.' },
  { step: '02', title: 'Create Shipment', description: 'Enter cargo details, assign carrier and receiver, set milestones and payment amounts.' },
  { step: '03', title: 'Track in Real Time', description: 'The carrier submits location proofs on-chain. Every party sees the same live map.' },
  { step: '04', title: 'Settle Instantly', description: 'When milestones are confirmed, escrow releases automatically. No invoices, no delays.' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-aether-950 via-aether-900 to-background pt-24 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-aether-600/20 via-transparent to-transparent" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-aether-700 bg-aether-900/50 px-4 py-1.5 text-sm text-aether-300">
              <span className="h-1.5 w-1.5 rounded-full bg-stellar-500 animate-pulse" />
              Powered by Stellar + Soroban
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Shipment Tracking
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-aether-400 to-stellar-500">
                You Can Trust
              </span>
            </h1>

            <p className="mb-10 text-lg text-aether-300 sm:text-xl">
              AetherTrack writes every location update, milestone confirmation, and payment release
              directly onto the Stellar blockchain — giving shippers, carriers, and receivers a
              single, immutable source of truth.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/Aether-Track"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-aether-700 px-8 py-3.5 text-base font-medium text-aether-300 hover:border-aether-500 hover:text-white transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="container mt-20">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-aether-800 bg-aether-900/60 p-5 text-center backdrop-blur-sm"
              >
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="mt-1 text-sm text-aether-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything logistics needs.{' '}
              <span className="text-primary">Nothing it doesn't.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built specifically for the realities of international freight — not a generic blockchain demo.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-24">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">
              From wallet connect to final payment — four steps.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ step, title, description }, i) => (
              <div key={step} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-5 left-1/2 hidden h-0.5 w-full bg-border lg:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step}
                  </div>
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-24">
        <div className="container">
          <div className="rounded-2xl bg-gradient-to-br from-aether-950 to-aether-900 p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready for production. Built for trust.
            </h2>
            <p className="mb-8 text-aether-300 max-w-2xl mx-auto">
              AetherTrack is built on Stellar's Testnet today and ready for Mainnet deployment.
              All contract code is open-source and auditable.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {[
                'Soroban Smart Contracts',
                'Freighter Wallet Auth',
                'Real-Time WebSocket Updates',
                'Milestone Payment Escrow',
                'Multi-Role Access Control',
                'Open Source',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-aether-300">
                  <CheckCircle2 className="h-4 w-4 text-stellar-500" />
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">AetherTrack</span>
            <span>© 2025</span>
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/Aether-Track" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Stellar
            </a>
            <a href="https://developers.stellar.org/docs/smart-contracts" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Soroban Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
