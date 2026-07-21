// No 'use client' directive here on purpose. The published bundle is a single
// file, so the directive would be hoisted over `createWalletLinkConfig` too and
// make it a client-only export — breaking `cookieToInitialState(config, ...)`,
// which has to run in a Next.js Server Component. This hook is client-only
// regardless; the component calling it supplies the boundary. Splitting the
// package into server and client entry points would let us mark it properly.
import { useCallback } from 'react'
import type { Address, Chain } from 'viem'
import type { Connector } from 'wagmi'
import { useAccount, useConnect, useConnectors, useDisconnect } from 'wagmi'

/** Result of a successful {@link UseWalletLinkReturnType.connectAsync}. */
export type WalletLinkConnectResult = {
  accounts: readonly [Address, ...Address[]]
  chainId: number
}

/** Lifecycle of the current account. Mirrors wagmi's account status. */
export type WalletLinkStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected'

/** Optional per-connect overrides. */
export type WalletLinkConnectParameters = {
  /** Chain to connect on. Defaults to the wallet's current chain. */
  chainId?: number
}

export type UseWalletLinkReturnType = {
  /**
   * Wallets available to connect: every EIP-6963 provider the browser
   * announced, plus any connectors passed to `createWalletLinkConfig`.
   *
   * Empty during server rendering and on the first client render when
   * `ssr: true` — discovery is a browser-only handshake, so wagmi appends the
   * announced wallets once `WagmiProvider` mounts. Render a loading/empty state
   * rather than concluding the user has no wallet installed.
   */
  wallets: readonly Connector[]
  /** Connect to `wallet`. Rejection surfaces on {@link error}, not as a throw. */
  connect: (wallet: Connector, parameters?: WalletLinkConnectParameters) => void
  /** Promise-returning {@link connect}. Rejects if the user declines. */
  connectAsync: (
    wallet: Connector,
    parameters?: WalletLinkConnectParameters,
  ) => Promise<WalletLinkConnectResult>
  /** Disconnect the active wallet. */
  disconnect: () => void
  /** Promise-returning {@link disconnect}. */
  disconnectAsync: () => Promise<void>
  /** Active account, or `undefined` when disconnected. */
  address: Address | undefined
  /** Active chain, or `undefined` if the wallet is on a chain the dapp did not configure. */
  chain: Chain | undefined
  /** Active chain id, even when the chain is not one the dapp configured. */
  chainId: number | undefined
  /** Connector backing the active account. */
  connector: Connector | undefined
  status: WalletLinkStatus
  isConnected: boolean
  /** A connection attempt is in flight. */
  isConnecting: boolean
  /** wagmi is restoring a previous session on mount. */
  isReconnecting: boolean
  isDisconnected: boolean
  /**
   * The wallet currently being connected to, while {@link isConnecting}. Use it
   * to show a pending state on the specific wallet the user picked.
   */
  pendingWallet: Connector | undefined
  /** Last connection error — most often the user rejecting the request. */
  error: Error | null
  /** Clear {@link error} and any pending state. */
  reset: () => void
}

/**
 * Headless wallet connection: the discovered wallets, connect/disconnect, and
 * the current account, with no UI attached.
 *
 * Wallets come from EIP-6963 announcements, so there is no relay and no
 * `projectId`. Requires a {@link createWalletLinkConfig} config mounted on
 * wagmi's `WagmiProvider`.
 *
 * @example
 * ```tsx
 * const { wallets, connect, address, isConnected, disconnect } = useWalletLink()
 *
 * if (isConnected) return <button onClick={() => disconnect()}>{address}</button>
 *
 * return wallets.map((wallet) => (
 *   <button key={wallet.uid} onClick={() => connect(wallet)}>{wallet.name}</button>
 * ))
 * ```
 */
export function useWalletLink(): UseWalletLinkReturnType {
  const wallets = useConnectors()
  const account = useAccount()
  const { connect, connectAsync, error, isPending, reset, variables } = useConnect()
  const { disconnect, disconnectAsync } = useDisconnect()

  const connectWallet = useCallback(
    (wallet: Connector, parameters?: WalletLinkConnectParameters) => {
      connect({ connector: wallet, chainId: parameters?.chainId })
    },
    [connect],
  )

  const connectWalletAsync = useCallback(
    (wallet: Connector, parameters?: WalletLinkConnectParameters) =>
      connectAsync({ connector: wallet, chainId: parameters?.chainId }),
    [connectAsync],
  )

  const disconnectWallet = useCallback(() => disconnect(), [disconnect])
  const disconnectWalletAsync = useCallback(() => disconnectAsync(), [disconnectAsync])

  // `variables` outlives the mutation, so only report a pending wallet while one
  // is actually in flight. The connector is narrowed because `connect` also
  // accepts a `CreateConnectorFn`, which this hook never passes.
  const submitted = isPending ? variables?.connector : undefined
  const pendingWallet = typeof submitted === 'function' ? undefined : submitted

  return {
    wallets,
    connect: connectWallet,
    connectAsync: connectWalletAsync,
    disconnect: disconnectWallet,
    disconnectAsync: disconnectWalletAsync,
    address: account.address,
    chain: account.chain,
    chainId: account.chainId,
    connector: account.connector,
    status: account.status,
    isConnected: account.isConnected,
    isConnecting: account.isConnecting || isPending,
    isReconnecting: account.isReconnecting,
    isDisconnected: account.isDisconnected,
    pendingWallet,
    error,
    reset,
  }
}
