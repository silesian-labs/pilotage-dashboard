"use client";

import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const RPC =
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC ||
  'https://sepolia-rollup.arbitrum.io/rpc';

// Pilotage runs on Arbitrum Sepolia only — that's where every contract lives.
const config = getDefaultConfig({
  appName: 'Pilotage',
  projectId: '8c2057d2a71e88bbdbf531393699b0c7',
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(RPC),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#B8843C', // custom golden/brass color to match our parchment/brass theme
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
