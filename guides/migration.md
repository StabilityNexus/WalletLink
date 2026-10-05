# Migrating a StabilityNexus EVM frontend to WalletLink

This is the uniform procedure for replacing a RainbowKit / WalletConnect / Reown
wallet-connection stack with [`@stability-nexus/walletlink`](https://www.npmjs.com/package/@stability-nexus/walletlink).
Follow it as written so every repo is migrated the same way.

It covers how to get **from** an existing stack to WalletLink. For how the finished
code should look (config, provider, hook, connect UI, styling), use the WalletLink
[README](../README.md) as the reference for the target state. This guide does not
repeat that; it only lists what to remove and change.

Proof case: `StabilityNexus/Fate-EVM-Frontend` PR #150 is a complete worked example.

## Using this with an AI coding agent

Point an AI coding agent (for example Claude Code, Cursor, GitHub Copilot, or Codex) at
this file and the repo you are migrating, for example: "Follow `guides/migration.md` from
the WalletLink repo to migrate this frontend to WalletLink." The agent should run Step 0
first and confirm the variant before editing.

---

## Before you start

1. **Coordinate.** Claim the task in the repo's own Discord channel and confirm with
   the active dev. One PR per repo, single concern.
2. **Check your access.** If you have write access to the repo, branch directly. If you
   only have read access, fork first and push the branch to your fork; open the PR from
   the fork against the upstream `main`.
3. **Branch** from `main`: `feat/walletlink-migration`.
4. **Establish a green baseline** before changing anything, so later breakage is
   clearly yours: `npm ci`, then whatever the repo's CI runs (commonly `npm run lint`,
   `npm run build`, and `npm run test` if present). Note the result.

---

## Step 0: Detect the current stack

Run these and read the output before editing:

```bash
grep -rnE "@rainbow-me|@reown|@walletconnect|getDefaultConfig|RainbowKitProvider|ConnectButton|createAppKit|useConnectModal" src/
grep -iE '"(@rainbow-me/rainbowkit|@reown/[a-z-]+|@walletconnect/[a-z-]+|wagmi|viem|ethers)"' package.json
```

Classify the repo into one variant:

- **Variant A: RainbowKit only.** `@rainbow-me/rainbowkit` + `wagmi`, no Reown. The
  standard path (this is what Fate was).
- **Variant B: RainbowKit + Reown/WalletConnect.** Also has `@reown/appkit*` or
  `@walletconnect/*` and usually a `createAppKit(...)` / wagmi adapter setup. Needs the
  extra teardown in the Variant B notes below.
- **Variant C: ethers only.** Uses raw `ethers` with `window.ethereum`, no wagmi. This
  is a larger lift (wagmi has to be adopted first). Treat it as a separate, bigger task
  and flag it to the maintainer rather than bundling it with a normal migration.

---

## Step 1: Swap the dependencies

```bash
npm install @stability-nexus/walletlink
npm uninstall @rainbow-me/rainbowkit
# Variant B also:
npm uninstall @reown/appkit @reown/appkit-adapter-wagmi @walletconnect/ethereum-provider @walletconnect/modal
```

Remove only the packages the repo actually has. Keep `wagmi`, `viem`, and
`@tanstack/react-query` (they are WalletLink peer deps). Note: `@walletconnect/*` will
still appear in the lockfile as a transitive dependency of `@wagmi/connectors` (a hard
dependency of wagmi). That is expected and cannot be removed without dropping wagmi; it
is no longer bundled into the app.

## Step 2: Replace the wagmi config

Find the config module (often `src/utils/wagmiConfig.ts` or similar). Replace
`getDefaultConfig({ projectId, ... })` (RainbowKit) or the Reown `createConfig` /
adapter with `createWalletLinkConfig({ chains, transports, ssr })`.

- Drop `projectId` and `appName` entirely, and any "Reown project ID missing" warning.
- Keep the repo's existing `chains` and `transports` (and `ssr: true` if it was set).

See the WalletLink README "Create a config" section for the exact shape.

## Step 3: Clean up the provider

In the provider module (often `src/context/walletProvider.tsx` or a providers file):

- Remove the `RainbowKitProvider` wrapper, its stylesheet import
  (`@rainbow-me/rainbowkit/styles.css`), and the `lightTheme`/`darkTheme` theme wiring.
- Variant B: also remove the AppKit provider / `createAppKit` call and its setup.
- Keep `WagmiProvider` and `QueryClientProvider`, and render children directly inside
  them. Any mount gate that existed only to defer `RainbowKitProvider` can go.
- No theme config is needed: WalletLink follows the app's `.dark` class (the same class
  `next-themes` toggles), so light/dark works for free.

## Step 4: Replace the connect UI

- Plain `<ConnectButton ... />`: replace with `<WalletLinkButton label="Connect Wallet" />`.
- `<ConnectButton.Custom>` (or any bespoke connect UI): WalletLink has no `.Custom` API,
  so rebuild it with the headless `useWalletLink()` hook plus wagmi's `useChainId` /
  `useSwitchChain`. Keep whatever the original had (connect action, account row with copy
  and disconnect, chain selector, wrong-network state).
  - `useWalletLink()` gives `address`, `isConnected`, `chain` (undefined when on an
    unconfigured chain, which is your wrong-network signal), and `disconnect`.
  - `useSwitchChain()` gives `chains` and `switchChain({ chainId })` for the selector and
    the wrong-network switch.
  - To open the wallet picker, render `<WalletLinkModal open={...} onOpenChange={...} />`
    and toggle its open state.
  - Worked examples: Fate PR #150, `src/components/ui/walletButton.tsx` (navbar) and
    `src/components/layout/BottomNavigation.tsx` (custom bottom nav).

## Step 5: Remove dead references and config

- Delete any RainbowKit CSS overrides (selectors like `.rainbow-kit-connect-button` or
  `[data-testid="rk-connect-button"]`) from global CSS; they target elements that no
  longer exist.
- Remove `NEXT_PUBLIC_PROJECT_ID` (and any Reown/WalletConnect project id) from
  `.env` / `env.example`, `CONTRIBUTING.md`, `AGENTS.md`, and the README. Update any
  "stack" notes that still mention RainbowKit.
- Grep once more to confirm nothing is left (includes `package.json`; the lockfile is
  excluded on purpose, since transitive `@walletconnect` entries there are expected):
  `grep -rnE "@rainbow-me|rainbowkit|RainbowKit|getDefaultConfig|NEXT_PUBLIC_PROJECT_ID|@reown|@walletconnect" src/ package.json *.md env.example`

---

## Variant B notes (RainbowKit + Reown/WalletConnect)

These repos often have two connection systems layered. Remove both:

- The `createAppKit(...)` call and the `@reown/appkit-adapter-wagmi` adapter used to
  build the wagmi config. Replace the whole config with `createWalletLinkConfig`.
- Any `<AppKitProvider>` / Reown context in the provider tree.
- The Reown/WalletConnect `projectId` and its env var.
- The RainbowKit pieces as in the standard steps.

## Variant C notes (ethers only)

WalletLink is wagmi-native. An ethers-only app has no wagmi config, provider, or hooks,
so this is not a swap, it is an adoption:

- Add `wagmi` + `@tanstack/react-query`, build a `createWalletLinkConfig`, add
  `WagmiProvider` + `QueryClientProvider`, and migrate the wallet-touching code paths off
  raw `ethers`/`window.ethereum` onto wagmi hooks.
- This is a large change. Split it from any normal migration and agree the scope with the
  maintainer first.

---

## Verification gate (every migration)

- `npm run lint`: no new warnings or errors (pre-existing ones unrelated to the swap may
  remain; do not fix those here).
- `npm run build` (and `npm run typecheck` if separate): passes.
- `npm run test`: passes if the repo has tests.
- Manual in a browser with a wallet on the repo's chain: connect, disconnect, copy
  address, chain display, and the wrong-network switch all work, in both light and dark
  mode.
- Confirm there is no WalletConnect / relay traffic in the Network tab and no RainbowKit
  in the built bundle.
- Static-export repos: `next start` does not work with `output: "export"`. Preview the
  production build with `npx serve out` instead.

---

## PR workflow and description

- One PR per repo, single concern, from your branch or fork against upstream `main`.
- Get the repo's dev to review first; the maintainer approves and merges.
- Use this description template:

```
### Summary
Replaces RainbowKit (and WalletConnect/Reown, if present) with @stability-nexus/walletlink,
which discovers wallets in-browser via EIP-6963 (no relay, no projectId).

What changed:
- Config: getDefaultConfig replaced with createWalletLinkConfig, projectId removed.
- Provider: RainbowKitProvider, its stylesheet, and theme wiring removed.
- Connect UI: ConnectButton replaced with WalletLinkButton; custom connect UI rebuilt
  with useWalletLink + wagmi useSwitchChain.
- Removed dead RainbowKit CSS and NEXT_PUBLIC_PROJECT_ID from env/docs.

### Trade-off
With injected-only EIP-6963 discovery there is no desktop-to-phone QR, and no Ledger Live
or Safe through WalletConnect. Connection is browser-extension wallets only. This is the
point of WalletLink (no relay, no projectId).

### Verification
lint / build / tests green; connect, disconnect, chain, and wrong-network verified in the
browser in light and dark mode.

### Screenshots
Connect button and wallet picker, connected account menu, and the wrong-network state.
Include a dark-mode shot.
```

- Fill the repo's AI usage disclosure honestly if the repo's template has one.
