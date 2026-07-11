// Public entry point for @stability-nexus/walletlink.
//
// SaaS-free EVM wallet connection built on EIP-1193 + EIP-6963 — no
// WalletConnect relay, no projectId. The headless hook and connect UI
// components are added in subsequent PRs.
export { createWalletLinkConfig } from './config'
export type { CreateWalletLinkConfigParameters } from './config'
