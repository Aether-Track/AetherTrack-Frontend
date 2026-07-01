'use client';

import { useState } from 'react';
import { Wallet, LogOut, Copy, Check, ExternalLink } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { shortenAddress } from '@/lib/utils';

export function WalletConnect() {
  const { publicKey, isConnected, isConnecting, error, user, connect, disconnect } =
    useWalletStore();
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
    } catch {
      // error is set in store
    }
  };

  const copyAddress = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-foreground/80">
            {user?.displayName ?? shortenAddress(publicKey)}
          </span>
          <button
            onClick={copyAddress}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Copy address"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="View on Stellar Expert"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <button
          onClick={disconnect}
          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
      {error && (
        <p className="text-xs text-destructive max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
