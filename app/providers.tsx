"use client";

import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { type Chain } from 'viem';

// Define the custom Robinhood Chain Testnet (chainId 46630)
export const robinhoodTestnet = {
  id: 46_630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://robinhood-testnet.g.alchemy.com/v2/demo'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.testnet.chain.robinhood.com' },
  },
  testnet: true,
} as const satisfies Chain;

// RainbowKit configuration using a dummy projectId (required by standard config)
const config = getDefaultConfig({
  appName: 'Pilotage',
  projectId: '8c2057d2a71e88bbdbf531393699b0c7',
  chains: [arbitrumSepolia, robinhoodTestnet],
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
