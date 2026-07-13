import type { Chain, Transport } from 'viem'
import type { CreateConfigParameters } from 'wagmi'
import { cookieStorage, createConfig, createStorage, http } from 'wagmi'

/**
 * Options for {@link createWalletLinkConfig}.
 *
 * This is intentionally a small, focused subset of wagmi's `createConfig`
 * parameters — the ones a dapp actually needs to swap in when migrating off
 * RainbowKit's `getDefaultConfig`. Notably, there is **no `projectId`**: wallet
 * connection happens entirely in the browser via EIP-1193 + EIP-6963, so no
 * WalletConnect relay or hosted service is involved.
 */
export type CreateWalletLinkConfigParameters = {
  /** Chains the dapp supports. At least one is required. */
  chains: readonly [Chain, ...Chain[]]
  /**
   * Per-chain RPC transports. When omitted, a default `http()` transport is
   * created for every chain (uses each chain's public RPC URLs).
   */
  transports?: Record<number, Transport>
  /**
   * Enable SSR-safe hydration. Set this to `true` in Next.js apps. When `true`
   * and no `storage` is provided, cookie-based storage is used automatically so
   * the server and client agree on connection state and React does not throw a
   * hydration mismatch. Defaults to `false`.
   */
  ssr?: boolean
  /**
   * Storage used to persist the last connection. Passed through to wagmi. When
   * omitted, defaults to cookie storage under SSR and wagmi's default
   * (localStorage) otherwise.
   */
  storage?: CreateConfigParameters['storage']
  /**
   * Extra connectors to register. EIP-6963 wallets are discovered automatically
   * and do **not** need to be listed here; use this only to add a fallback such
   * as wagmi's `injected()` for legacy wallets that predate EIP-6963.
   */
  connectors?: CreateConfigParameters['connectors']
}

/**
 * Build a wagmi {@link https://wagmi.sh/core/api/createConfig | Config} that
 * connects to EVM wallets with no WalletConnect relay and no `projectId`.
 *
 * Connection is handled entirely by EIP-6963 (Multi Injected Provider
 * Discovery): with `multiInjectedProviderDiscovery` enabled, every wallet that
 * announces a provider is registered automatically — no relay and no
 * `projectId`. Every current major wallet supports EIP-6963. If you need a
 * fallback for a legacy wallet that only exposes `window.ethereum`, pass
 * wagmi's `injected()` connector through `connectors`.
 *
 * @example
 * ```ts
 * import { sepolia } from 'wagmi/chains'
 * import { createWalletLinkConfig } from '@stability-nexus/walletlink'
 *
 * export const config = createWalletLinkConfig({
 *   chains: [sepolia],
 *   ssr: true,
 * })
 * ```
 *
 * @remarks
 * When `transports` is omitted, a default `http()` transport is created per
 * chain, which relies on each chain's built-in `rpcUrls.default`. Pass explicit
 * `transports` for chains without a public RPC, or to avoid leaking user IPs to
 * public RPC providers.
 */
export function createWalletLinkConfig(parameters: CreateWalletLinkConfigParameters) {
  const { chains, transports, ssr = false, storage, connectors = [] } = parameters

  return createConfig({
    chains,
    connectors,
    multiInjectedProviderDiscovery: true,
    transports: transports ?? Object.fromEntries(chains.map((chain) => [chain.id, http()])),
    ssr,
    // Under SSR, fall back to cookie storage so server-rendered and client
    // markup agree on connection state (prevents React hydration mismatch).
    // A caller-supplied `storage` always wins.
    storage: storage ?? (ssr ? createStorage({ storage: cookieStorage }) : undefined),
  })
}
