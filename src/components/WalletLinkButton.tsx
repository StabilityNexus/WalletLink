// No 'use client' here on purpose — see the note in useWalletLink.ts.
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useEffect, useState } from 'react'
import { useWalletLink } from '../useWalletLink'
import { AccountAvatar, useWalletLinkStyles } from './internal'
import { WalletLinkModal } from './WalletLinkModal'

export type WalletLinkButtonProps = {
  /** Text on the connect button while disconnected. Defaults to `Connect Wallet`. */
  label?: string
}

/**
 * Drop-in connect button.
 *
 * While disconnected it opens the {@link WalletLinkModal} wallet picker. Once
 * connected it becomes an account avatar that opens a menu to copy the address or
 * disconnect. Requires a {@link createWalletLinkConfig} config on `WagmiProvider`.
 *
 * @example
 * ```tsx
 * import { WalletLinkButton } from '@stability-nexus/walletlink'
 *
 * export function Header() {
 *   return <WalletLinkButton />
 * }
 * ```
 */
export function WalletLinkButton({ label = 'Connect Wallet' }: WalletLinkButtonProps) {
  useWalletLinkStyles()
  const { address, isConnected, disconnect } = useWalletLink()
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Once connected the modal unmounts (the connected view replaces it), so its own
  // auto-close never runs. Clear the open state here so it does not reappear the
  // next time it mounts — e.g. right after the user disconnects.
  useEffect(() => {
    if (isConnected) setModalOpen(false)
  }, [isConnected])

  if (!isConnected || address === undefined) {
    return (
      <>
        <button type="button" className="wl-connect-btn" onClick={() => setModalOpen(true)}>
          {label}
        </button>
        <WalletLinkModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    )
  }

  const copyAddress = async () => {
    if (!navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard write was blocked or rejected; leave the label unchanged
      // rather than claiming a copy that did not happen.
      setCopied(false)
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="wl-avatar-btn" aria-label="Account menu">
        <AccountAvatar />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="wl-menu" align="end" sideOffset={8}>
          {/* Keep the menu open after copying so the "Copied!" confirmation shows. */}
          <DropdownMenu.Item
            className="wl-menu-item"
            onSelect={(event) => {
              event.preventDefault()
              void copyAddress()
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" />
              <path
                d="M10.5 5.5v-1a1.5 1.5 0 0 0-1.5-1.5h-4A1.5 1.5 0 0 0 3.5 4.5v4A1.5 1.5 0 0 0 5 10"
                stroke="currentColor"
              />
            </svg>
            {copied ? 'Copied!' : 'Copy address'}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="wl-menu-item wl-menu-item--danger"
            onSelect={() => disconnect()}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M6 2.5H4A1.5 1.5 0 0 0 2.5 4v8A1.5 1.5 0 0 0 4 13.5h2M10 11l3-3-3-3M13 8H6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Disconnect
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
