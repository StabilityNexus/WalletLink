// Public entry point for @stability-nexus/walletlink.
//
// SaaS-free EVM wallet connection built on EIP-1193 + EIP-6963 — no
// WalletConnect relay, no projectId. The connect UI components are added in a
// subsequent PR.
export { createWalletLinkConfig } from './config'
export type { CreateWalletLinkConfigParameters } from './config'
export { useWalletLink } from './useWalletLink'
export type {
  UseWalletLinkReturnType,
  WalletLinkConnectParameters,
  WalletLinkConnectResult,
  WalletLinkStatus,
} from './useWalletLink'
