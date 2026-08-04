import type { Connector } from 'wagmi'
import { COINBASE_ICON, METAMASK_ICON, PHANTOM_ICON, RABBY_ICON, TRUST_ICON } from './wallet-icons'

/** A popular wallet we can point first-time users to when it is not installed. */
export type RecommendedWallet = {
  name: string
  /** EIP-6963 reverse-DNS id, used to match against discovered connectors. */
  rdns: string
  /** Official install / download page. */
  url: string
  /** Inline logo as a `data:` URI. Falls back to a lettered placeholder if absent. */
  icon?: string
}

/**
 * A small, hand-maintained set of widely used EVM wallets. These are only ever
 * shown as *install* links for wallets the browser has not announced — WalletLink
 * has no relay, so a wallet that is not installed cannot be connected, only
 * installed. Discovered wallets always come from EIP-6963, never from this list.
 *
 * Logos are bundled inline (no runtime CDN fetch) to keep the connect flow free
 * of third-party dependencies.
 */
export const RECOMMENDED_WALLETS: readonly RecommendedWallet[] = [
  {
    name: 'MetaMask',
    rdns: 'io.metamask',
    url: 'https://metamask.io/download/',
    icon: METAMASK_ICON,
  },
  {
    name: 'Coinbase Wallet',
    rdns: 'com.coinbase.wallet',
    url: 'https://www.coinbase.com/wallet/downloads',
    icon: COINBASE_ICON,
  },
  { name: 'Rabby', rdns: 'io.rabby', url: 'https://rabby.io/', icon: RABBY_ICON },
  {
    name: 'Trust Wallet',
    rdns: 'com.trustwallet.app',
    url: 'https://trustwallet.com/download',
    icon: TRUST_ICON,
  },
  { name: 'Phantom', rdns: 'app.phantom', url: 'https://phantom.app/download', icon: PHANTOM_ICON },
]

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '')

/**
 * Recommended wallets the browser has not already announced, so we do not offer
 * an "install" link for a wallet the user can already connect to. Matches on the
 * connector id (the rdns for EIP-6963 connectors) or the normalized name.
 */
export function installableWallets(discovered: readonly Connector[]): RecommendedWallet[] {
  const ids = new Set(discovered.map((c) => c.id))
  const names = new Set(discovered.map((c) => normalize(c.name)))
  return RECOMMENDED_WALLETS.filter(
    (wallet) => !ids.has(wallet.rdns) && !names.has(normalize(wallet.name)),
  )
}
