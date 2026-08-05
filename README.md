<!-- Don't delete it -->
<div name="readme-top"></div>

<!-- Organization Logo -->
<div align="center">
  <img alt="Stability Nexus" src="public/stability.svg" width="175">
</div>

&nbsp;

<!-- Organization Name -->
<div align="center">

[![Static Badge](https://img.shields.io/badge/Stability_Nexus-/WalletLink-228B22?style=for-the-badge&labelColor=FFC517)](https://github.com/StabilityNexus/WalletLink)

</div>

<!-- Organization/Project Social Handles -->
<p align="center">
<!-- Telegram -->
<a href="https://t.me/StabilityNexus">
<img src="https://img.shields.io/badge/Telegram-black?style=flat&logo=telegram&logoColor=white&logoSize=auto&color=24A1DE" alt="Telegram Badge"/></a>
&nbsp;&nbsp;
<!-- X (formerly Twitter) -->
<a href="https://x.com/StabilityNexus">
<img src="https://img.shields.io/twitter/follow/StabilityNexus" alt="X (formerly Twitter) Badge"/></a>
&nbsp;&nbsp;
<!-- Discord -->
<a href="https://discord.gg/YzDKeEfWtS">
<img src="https://img.shields.io/discord/995968619034984528?style=flat&logo=discord&logoColor=white&logoSize=auto&label=Discord&labelColor=5865F2&color=57F287" alt="Discord Badge"/></a>
&nbsp;&nbsp;
<!-- Medium -->
<a href="https://news.stability.nexus/">
  <img src="https://img.shields.io/badge/Medium-black?style=flat&logo=medium&logoColor=black&logoSize=auto&color=white" alt="Medium Badge"></a>
&nbsp;&nbsp;
<!-- LinkedIn -->
<a href="https://linkedin.com/company/stability-nexus">
  <img src="https://img.shields.io/badge/LinkedIn-black?style=flat&logo=LinkedIn&logoColor=white&logoSize=auto&color=0A66C2" alt="LinkedIn Badge"></a>
&nbsp;&nbsp;
<!-- Youtube -->
<a href="https://www.youtube.com/@StabilityNexus">
  <img src="https://img.shields.io/youtube/channel/subscribers/UCZOG4YhFQdlGaLugr_e5BKw?style=flat&logo=youtube&logoColor=white&logoSize=auto&labelColor=FF0000&color=FF0000" alt="Youtube Badge"></a>
</p>

---

<div align="center">
<h1>WalletLink</h1>
</div>

**WalletLink** is a free, open-source, SaaS-independent way to connect a frontend
to EVM wallets. Discovery and connection happen entirely in the browser over two
finalized Ethereum standards, [EIP-1193][eip1193] (provider interface) and
[EIP-6963][eip6963] (multi-injected-provider discovery): no hosted relay, no API
key, no third-party service in the connection path.

It is a thin, wagmi-native drop-in replacement for the WalletConnect-based connect
stacks (RainbowKit, ConnectKit, Web3Modal).
Consumers keep every wagmi hook they already use (`useAccount`, `useWriteContract`,
…); WalletLink only replaces the connection layer.

> [!NOTE]
> **Pre-release.** The package is not yet published to a registry and the API may
> still change. It ships the config builder, the headless `useWalletLink` hook, and
> the styled connect UI (`WalletLinkButton`, `WalletLinkModal`).

[eip1193]: https://eips.ethereum.org/EIPS/eip-1193
[eip6963]: https://eips.ethereum.org/EIPS/eip-6963

---

## Why

Reown AppKit (the connect stack formerly published as WalletConnect) is
proprietary-licensed: its Community License requires every app to connect through
Reown's hosted relay network using a `projectId`. That fails the free,
open-source, SaaS-independent, censorship-resistant bar Stability Nexus dapps aim
for.

Major wallets such as MetaMask and Coinbase Wallet support EIP-6963, which lets a
page discover injected wallets through a local `window` event handshake, with no
server in the loop. WalletLink builds on that (via wagmi, which already implements
it) so extension-wallet connection works with zero SaaS dependencies.

Cross-device connection (desktop dapp ↔ phone wallet) is the one thing that
genuinely needs a relay; there is no production self-hostable WalletConnect relay,
so WalletLink is injected-only for now and leaves a seam for a relay transport later.

---

## Status

- [x] `createWalletLinkConfig`: wagmi `Config` builder, no `projectId`.
- [x] `useWalletLink`: headless connect / account hook.
- [x] `WalletLinkButton` + `WalletLinkModal`: styled connect UI.
- [ ] Published to a package registry.
- [ ] Integrated into a Stability Nexus dapp (Fate-EVM-Frontend is the proof case).
- [ ] Cross-device (mobile) support via a self-hostable relay transport.

---

## Tech Stack

- TypeScript
- React (peer dependency)
- [wagmi][wagmi] v2 + [viem][viem] (peer dependencies)
- [@tanstack/react-query][rq] (peer dependency)
- Built with [tsup][tsup] (ESM + CJS + type declarations)
- Standards: EIP-1193, EIP-6963

No `projectId`, no relay, no hosted service.

[wagmi]: https://wagmi.sh
[viem]: https://viem.sh
[rq]: https://tanstack.com/query
[tsup]: https://tsup.egoist.dev

---

## Getting Started

### Prerequisites

- Node.js 18+
- An EVM wallet browser extension (MetaMask, Rabby, Frame, …) for testing
- A React app already using wagmi v2 (or willing to add it)

### Installation

> Not published yet. The registry command below is how you will install WalletLink
> once the first release is out. Until then, use it from source: clone this repo,
> run `npm install && npm run build`, and link the result into your app (for
> example with `npm link`, or a file/git dependency that builds the `dist` output).

Once published, install WalletLink alongside its peer dependencies:

```bash
npm install @stability-nexus/walletlink wagmi viem @tanstack/react-query
# or: yarn add / pnpm add
```

### 1. Create a config

`createWalletLinkConfig` returns a standard wagmi `Config`. No `projectId`.

```ts
// wagmiConfig.ts
import { sepolia } from 'wagmi/chains'
import { createWalletLinkConfig } from '@stability-nexus/walletlink'

export const config = createWalletLinkConfig({
  chains: [sepolia],
  ssr: true, // set for Next.js; enables cookie-based hydration
})
```

Passing `transports` is optional; omit it and each chain gets a default `http()`
transport. When supplied, it is keyed to `chains`, so leaving a chain out is a
compile-time error rather than a runtime one.

### 2. Wrap your app

Mount wagmi's `WagmiProvider` and a react-query `QueryClientProvider`, exactly as a
wagmi app already does:

```tsx
'use client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmiConfig'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
```

### 3. Connect with the headless hook

`useWalletLink` exposes the discovered wallets, connect/disconnect, and the current
account. Bring your own UI:

```tsx
'use client'
import { useWalletLink } from '@stability-nexus/walletlink'

export function Connect() {
  const { wallets, connect, disconnect, address, isConnected, pendingWallet } =
    useWalletLink()

  if (isConnected) {
    return <button onClick={() => disconnect()}>{address}</button>
  }

  // Empty during SSR and the first client render (see the note below), so show a
  // discovery state rather than a bare, wallet-less control.
  if (wallets.length === 0) {
    return <p>Looking for wallets…</p>
  }

  return wallets.map((wallet) => (
    <button
      key={wallet.uid}
      onClick={() => connect(wallet)}
      disabled={pendingWallet?.uid === wallet.uid}
    >
      {wallet.name}
    </button>
  ))
}
```

> `wallets` is empty during SSR and on the first client render, because EIP-6963
> discovery is a browser-only handshake, so wagmi appends the announced wallets once
> `WagmiProvider` mounts. Render a loading/empty state rather than concluding no
> wallet is installed.

### 4. …or drop in the connect UI

If you would rather not build the UI, render `WalletLinkButton`. It packages the
whole flow: a connect button that opens a wallet-picker modal, and, once connected,
an account avatar with a menu to copy the address or disconnect.

```tsx
'use client'
import { WalletLinkButton } from '@stability-nexus/walletlink'

export function Header() {
  return <WalletLinkButton />
}
```

`label` sets the disconnected button text (default `Connect Wallet`). The modal
lists the EIP-6963 wallets the browser announced; for popular wallets that are not
installed it shows an install link instead (WalletLink has no relay, so an absent
wallet can be installed but not connected). It needs no CSS import: the components
inject their own stylesheet on first mount.

For a custom trigger, drive `WalletLinkModal` yourself with your own `open` state:

```tsx
'use client'
import { useState } from 'react'
import { WalletLinkModal } from '@stability-nexus/walletlink'

export function Connect() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Connect
      </button>
      <WalletLinkModal open={open} onOpenChange={setOpen} />
    </>
  )
}
```

---

## Styling

The connect UI ships with a neutral light/dark theme and needs no configuration. It
is built on unstyled [Radix][radix] primitives skinned by a single stylesheet the
components inject on first mount, so there is nothing to import and no Tailwind
config to add on the consumer side.

### Theme follows your app

The default theme is light. WalletLink switches to dark when your app marks the page
dark the way most apps already do, either signal works:

- a `dark` class on `<html>` (Tailwind's class strategy, `class="dark"`), or
- `<html data-theme="dark">`.

It deliberately does **not** follow the OS `prefers-color-scheme` on its own, so an
app that stays light while the OS is dark is not forced dark against its will.

### Overriding the look

Every color, radius, and font is a CSS custom property read from `:root`. Set any of
them on `:root` (or on any element that contains the button) and WalletLink picks it
up, with no build step and no `!important`: the library's own rules are written at
zero specificity, so a plain selector always wins.

```css
:root {
  --walletlink-accent: #7c3aed; /* connect button + focus/spinner accent */
  --walletlink-radius: 16px; /* modal corners */
  --walletlink-radius-sm: 10px; /* button + row corners */
  --walletlink-font: 'Inter', sans-serif;
}
```

The full set (each has a sensible light and dark default):

| Variable                                             | What it controls                       |
| ---------------------------------------------------- | -------------------------------------- |
| `--walletlink-accent` / `-accent-hover`              | Primary button, focus ring, spinner    |
| `--walletlink-accent-fg`                             | Text on the accent button              |
| `--walletlink-danger`                                | Disconnect item, error text            |
| `--walletlink-surface`                               | Modal and menu background              |
| `--walletlink-fg` / `-muted`                         | Primary and secondary text             |
| `--walletlink-border` / `-hover`                     | Dividers and hover backgrounds         |
| `--walletlink-overlay` / `-shadow`                   | Modal backdrop and elevation           |
| `--walletlink-radius` / `-radius-sm`                 | Corner rounding                        |
| `--walletlink-font`                                  | Font family (inherits by default)      |
| `--walletlink-avatar-bg` / `-line` / `-fg`           | Connected-state avatar fill/outline    |

To theme dark mode independently, set the variables under your dark selector:

```css
:root.dark {
  --walletlink-accent: #a78bfa;
}
```

[radix]: https://www.radix-ui.com/primitives

---

## Contributing

We welcome contributions of all kinds! To contribute:

1. Create a feature branch (`git checkout -b feat/your-feature`).
2. Make your changes and keep them focused: one purpose per pull request.
3. Run the quality checks before committing:
   - `npm run format:write`
   - `npm run lint:fix`
   - `npm run typecheck`
   - `npm run build`
4. Sign off your commits (`git commit -s`); this project uses the
   [Developer Certificate of Origin](DCO.md); add yourself to [Contributors.md](Contributors.md).
5. Open a pull request against `main` for review.

If you encounter bugs, need help, or have feature requests, please open an issue
with clear detail and any relevant logs.

---

## License

WalletLink is licensed under the **GNU General Public License v3.0 (or later) with
a linking exception**, SPDX `GPL-3.0-or-later WITH Classpath-exception-2.0`. See
[LICENSE.md](LICENSE.md).

The linking exception means an application can link WalletLink from its own,
independent code (code not derived from WalletLink) and keep that code under the
license of its choice; linking alone does not make the application GPL, as long as
each linked module's own license terms are met. The copyleft still applies to
WalletLink itself: modifications to this library stay free software under the GPL.

---

© 2025 The Stable Order.
