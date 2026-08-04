// No 'use client' here on purpose — see the note in useWalletLink.ts. The single
// published bundle must keep createWalletLinkConfig server-safe, so the directive
// cannot sit at the top of the bundle. Consumers render this inside their own
// client boundary (the same one that mounts WagmiProvider).
import * as Dialog from '@radix-ui/react-dialog'
import { useEffect } from 'react'
import { useWalletLink } from '../useWalletLink'
import { describeConnectError, isRenderableIcon, useWalletLinkStyles } from './internal'
import { installableWallets } from './wallets'

export type WalletLinkModalProps = {
  /** Whether the modal is open. */
  open: boolean
  /** Called when the modal requests to open or close (backdrop, Esc, close button). */
  onOpenChange: (open: boolean) => void
}

/**
 * Wallet-picker dialog: lists the EIP-6963 wallets from {@link useWalletLink} and
 * connects to the one the user picks. Closes itself once a connection lands.
 *
 * When popular wallets are not installed, it also shows them as install links —
 * WalletLink has no relay, so an absent wallet can be installed but not connected.
 *
 * Usually rendered for you by {@link WalletLinkButton}; use it directly only to
 * drive the picker from your own trigger.
 */
export function WalletLinkModal({ open, onOpenChange }: WalletLinkModalProps) {
  useWalletLinkStyles()
  const { wallets, connect, pendingWallet, error, isConnected, reset } = useWalletLink()

  // Dismiss automatically once a wallet is connected.
  useEffect(() => {
    if (open && isConnected) onOpenChange(false)
  }, [open, isConnected, onOpenChange])

  // Start each opening from a clean slate: drop any error or pending state left
  // over from a previous attempt.
  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  const hasDiscovered = wallets.length > 0
  const installable = installableWallets(wallets)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="wl-overlay" />
        <Dialog.Content className="wl-modal" aria-describedby={undefined}>
          <div className="wl-modal-header">
            <Dialog.Title className="wl-modal-title">Connect a wallet</Dialog.Title>
            <Dialog.Close className="wl-modal-close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </Dialog.Close>
          </div>

          {error && (
            <p className="wl-error" role="alert">
              {describeConnectError(error)}
            </p>
          )}

          {hasDiscovered && (
            <ul className="wl-wallet-list">
              {wallets.map((wallet) => {
                const isPending = pendingWallet?.uid === wallet.uid
                return (
                  <li key={wallet.uid}>
                    <button
                      type="button"
                      className="wl-wallet"
                      onClick={() => connect(wallet)}
                      disabled={pendingWallet !== undefined}
                      data-pending={isPending ? '' : undefined}
                    >
                      {isRenderableIcon(wallet.icon) ? (
                        <img className="wl-wallet-icon" src={wallet.icon} alt="" />
                      ) : (
                        <span className="wl-wallet-icon wl-wallet-icon--placeholder" aria-hidden>
                          {wallet.name.charAt(0)}
                        </span>
                      )}
                      <span className="wl-wallet-name">{wallet.name}</span>
                      {isPending && (
                        <>
                          <span className="wl-wallet-pending">Check your wallet</span>
                          <span className="wl-spinner" aria-hidden />
                        </>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {installable.length > 0 &&
            (hasDiscovered ? (
              <div className="wl-section-label">Popular wallets</div>
            ) : (
              <p className="wl-empty">
                No wallet detected in your browser. Install one to get started:
              </p>
            ))}

          {installable.length > 0 && (
            <ul className="wl-wallet-list">
              {installable.map((wallet) => (
                <li key={wallet.rdns}>
                  <a
                    className="wl-wallet wl-wallet--install"
                    href={wallet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {wallet.icon ? (
                      <img className="wl-wallet-icon" src={wallet.icon} alt="" />
                    ) : (
                      <span className="wl-wallet-icon wl-wallet-icon--placeholder" aria-hidden>
                        {wallet.name.charAt(0)}
                      </span>
                    )}
                    <span className="wl-wallet-name">{wallet.name}</span>
                    <span className="wl-wallet-install">
                      Install
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6.5 3.5H4A1.5 1.5 0 0 0 2.5 5v7A1.5 1.5 0 0 0 4 13.5h7a1.5 1.5 0 0 0 1.5-1.5V9.5M9 3.5h3.5V7M12 4L7 9"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!hasDiscovered && installable.length === 0 && (
            <p className="wl-empty">
              No wallets found. Install a browser wallet such as MetaMask or Rabby, then reload the
              page.
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
