import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getPublicKey,
  isConnected,
  signMessage,
} from '@stellar/freighter-api';
import { api } from '@/lib/api';
import type { User, WalletState } from '@/types';

interface WalletStore extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  setUser: (user: User) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      publicKey: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      token: null,
      user: null,

      connect: async () => {
        set({ isConnecting: true, error: null });

        try {
          const connected = await isConnected();
          if (!connected) {
            throw new Error(
              'Freighter wallet not found. Install the Freighter browser extension at freighter.app',
            );
          }

          const publicKey = await getPublicKey();

          // Step 1: Get challenge from server
          const { message } = await api.auth.challenge(publicKey);

          // Step 2: Sign with Freighter
          const { signedMessage } = await signMessage(message, { networkPassphrase: 'Test SDF Network ; September 2015' });
          const signature = Buffer.from(signedMessage).toString('base64');

          // Step 3: Exchange for JWT
          const { token, user } = await api.auth.login(publicKey, signature);

          localStorage.setItem('aethertrack_token', token);

          set({ publicKey, isConnected: true, isConnecting: false, token, user, error: null });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Connection failed';
          set({ isConnecting: false, error: message, isConnected: false });
          throw err;
        }
      },

      disconnect: () => {
        localStorage.removeItem('aethertrack_token');
        set({ publicKey: null, isConnected: false, token: null, user: null, error: null });
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'aethertrack-wallet',
      partialize: (state) => ({
        publicKey: state.publicKey,
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
