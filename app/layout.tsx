"use client";

import React from 'react';
import { DashboardStateProvider } from './state';
import { Icon, Brand } from '../components/ui';
import { Web3Providers } from './providers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import "./globals.css";

function Header() {
  return (
    <nav className="nav scrolled">
      <div className="nav-inner">

        <Brand />
        <div className="nav-links">
          <Link className="nav-link" href="/">Dashboard</Link>
          <Link className="nav-link" href="/harbor">Harbor</Link>
        </div>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        className="chip"
                        onClick={openConnectModal}
                        style={{
                          cursor: 'pointer',
                          background: 'var(--accent)',
                          color: 'var(--accent-ink)',
                          borderColor: 'var(--accent-deep)',
                          textTransform: 'none',
                          padding: '6px 14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Icon name="anchor" size={12} /> Connect wallet
                      </button>
                    );
                  }


                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>


                      <button
                        className="chip live"
                        onClick={openAccountModal}
                        style={{
                          cursor: 'pointer',
                          background: 'var(--paper-raise)',
                          textTransform: 'none',
                          fontFamily: 'var(--font-mono)',
                          padding: '6px 12px'
                        }}
                      >
                        <span className="pulse" />
                        {account.displayName}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </nav>
  );
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Pilotage Dashboard</title>
        <meta name="description" content="Manage your self-custodial smart vaults and delegation charters." />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '100px' }}>
        <Web3Providers>
          <DashboardStateProvider>
            <Header />
            <main style={{ flex: 1, paddingBottom: '60px' }}>
              {children}
            </main>
          </DashboardStateProvider>
        </Web3Providers>
      </body>
    </html>
  );
}
