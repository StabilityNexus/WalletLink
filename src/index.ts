// Public entry point for @stability-nexus/walletlink.
//
// SaaS-free EVM wallet connection built on EIP-1193 + EIP-6963 — no
// WalletConnect relay, no projectId.
export { createWalletLinkConfig } from './config'
export type { CreateWalletLinkConfigParameters } from './config'
export { useWalletLink } from './useWalletLink'
export type {
  UseWalletLinkReturnType,
  WalletLinkConnectParameters,
  WalletLinkConnectResult,
  WalletLinkStatus,
} from './useWalletLink'
export { WalletLinkButton } from './components/WalletLinkButton'
export type { WalletLinkButtonProps } from './components/WalletLinkButton'
export { WalletLinkModal } from './components/WalletLinkModal'
export type { WalletLinkModalProps } from './components/WalletLinkModal'
