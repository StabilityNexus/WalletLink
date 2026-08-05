// Small internal helpers shared by WalletLinkButton and WalletLinkModal.
import { useInsertionEffect } from 'react'
import type { Address } from 'viem'
import { injectWalletLinkStyles } from './styles'

/** Inject the connect-UI stylesheet on mount (client only, once per page). */
export function useWalletLinkStyles(): void {
  // useInsertionEffect runs before layout is read, so styles are present before
  // the browser paints the component — no flash of unstyled markup.
  useInsertionEffect(() => {
    injectWalletLinkStyles()
  }, [])
}

/** `0x1234…abcd` — enough to recognize an account without showing the whole thing. */
export function truncateAddress(address: Address, chars = 4): string {
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

/**
 * Whether an EIP-6963 wallet icon is safe to drop into an `<img src>`.
 *
 * Only self-contained `data:image/...` URIs are accepted, which is the form
 * EIP-6963 prescribes for the announced icon. A remote `https:` URL is rejected:
 * an announced connector could point it at any host, and rendering it would leak
 * request metadata to that host before the user has picked anything. Rejected
 * values fall back to a text placeholder.
 */
export function isRenderableIcon(icon: string | undefined): icon is string {
  return typeof icon === 'string' && icon.startsWith('data:image/')
}

/** A neutral person glyph standing in for the connected account. */
export function AccountAvatar() {
  return (
    <span className="wl-avatar">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.46-8 5.5 0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5 0-3.04-3.58-5.5-8-5.5Z" />
      </svg>
    </span>
  )
}

type ErrorLike = {
  name?: string
  code?: number
  shortMessage?: string
  message?: string
  cause?: unknown
}

/** The error plus its nested `cause` chain (viem wraps the original RPC error). */
function causeChain(error: unknown): ErrorLike[] {
  const chain: ErrorLike[] = []
  let current: unknown = error
  for (let depth = 0; current && depth < 6; depth++) {
    chain.push(current as ErrorLike)
    current = (current as ErrorLike).cause
  }
  return chain
}

/**
 * A short, human-readable message for a failed connection attempt.
 *
 * The user declining (EIP-1193 `4001`) and an unavailable/locked wallet
 * (`-32002`) get purpose-written copy; anything else falls back to viem's
 * concise `shortMessage` rather than its full multi-line error dump.
 */
export function describeConnectError(error: Error): string {
  const chain = causeChain(error)
  if (chain.some((e) => e.name === 'UserRejectedRequestError' || e.code === 4001)) {
    return 'Connection request cancelled. Approve it in your wallet to continue.'
  }
  if (chain.some((e) => e.name === 'ResourceUnavailableRpcError' || e.code === -32002)) {
    return 'This wallet is not responding. Make sure it is installed and unlocked, then try again.'
  }
  return chain.find((e) => e.shortMessage)?.shortMessage ?? error.message
}
