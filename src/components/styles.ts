// Runtime style injection.
//
// The connect UI ships no separate stylesheet: the first component to mount
// injects a single <style> tag into <head>. That keeps consumers to a zero-import
// setup (no `import '.../styles.css'`), at the cost of a client-only side effect —
// acceptable here because the connect UI is client-only regardless.
//
// Every rule is a namespaced `wl-` class wrapped in `:where(...)`, so its
// specificity is zero and any consumer selector wins without `!important`. Colors,
// radii, and fonts are read from `--walletlink-*` custom properties whose defaults
// live in `:where(:root)` (also zero-specificity) with a `prefers-color-scheme`
// dark variant. Consumers restyle by setting those variables on `:root` or any
// ancestor of the component.

const STYLE_ELEMENT_ID = 'walletlink-styles'

// Theme-independent tokens (shared by light and dark).
const BASE_TOKENS = `
  --walletlink-font: inherit;
  --walletlink-radius: 20px;
  --walletlink-radius-sm: 12px;
  --walletlink-accent: #2563eb;
  --walletlink-accent-fg: #ffffff;
  --walletlink-accent-hover: #1d4ed8;
  --walletlink-danger: #dc2626;
`

const LIGHT_TOKENS = `
  --walletlink-surface: #ffffff;
  --walletlink-fg: #111827;
  --walletlink-muted: #6b7280;
  --walletlink-border: #e5e7eb;
  --walletlink-hover: #f4f4f5;
  --walletlink-overlay: rgba(17, 24, 39, 0.5);
  --walletlink-shadow: 0 24px 48px -12px rgba(17, 24, 39, 0.28), 0 0 0 1px rgba(17, 24, 39, 0.04);
  --walletlink-avatar-bg: transparent;
  --walletlink-avatar-line: #111827;
  --walletlink-avatar-fg: #9ca3af;
`

const DARK_TOKENS = `
  --walletlink-surface: #18181b;
  --walletlink-fg: #fafafa;
  --walletlink-muted: #a1a1aa;
  --walletlink-border: #27272a;
  --walletlink-hover: #27272a;
  --walletlink-overlay: rgba(0, 0, 0, 0.6);
  --walletlink-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06);
  --walletlink-avatar-bg: #27272a;
  --walletlink-avatar-line: #27272a;
  --walletlink-avatar-fg: #a1a1aa;
`

const CSS = `
:where(:root) { ${BASE_TOKENS}${LIGHT_TOKENS} }

/* Follow the host app's own theme. Light is the default; dark switches on the
   signals apps actually set — Tailwind's .dark class or a data-theme attribute.
   The OS preference is deliberately not used as an override: an app in light mode
   (Tailwind light = no class) must not be forced dark just because the OS is. */
:where(:root.dark, :root[data-theme='dark']) { ${DARK_TOKENS} }

/* The host page's box model is unknown, so normalize ours: without this a
   width:100% item plus padding overflows its container (e.g. the menu hover
   background spilling past the edge). */
:where(.wl-connect-btn, .wl-avatar-btn, .wl-modal, .wl-menu),
:where(.wl-modal) *,
:where(.wl-menu) * {
  box-sizing: border-box;
}

:where(.wl-connect-btn) {
  font-family: var(--walletlink-font);
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  color: var(--walletlink-accent-fg);
  background: var(--walletlink-accent);
  border: none;
  border-radius: var(--walletlink-radius-sm);
  padding: 12px 20px;
  cursor: pointer;
  transition: background 120ms ease, transform 80ms ease;
}
:where(.wl-connect-btn:hover) {
  background: var(--walletlink-accent-hover);
}
:where(.wl-connect-btn:active) {
  transform: translateY(1px);
}

:where(.wl-avatar-btn) {
  padding: 0;
  border: none;
  background: none;
  border-radius: 999px;
  cursor: pointer;
  line-height: 0;
}
:where(.wl-avatar-btn:focus-visible) {
  outline: 2px solid var(--walletlink-accent);
  outline-offset: 2px;
}
:where(.wl-avatar) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: var(--walletlink-avatar-fg);
  background: var(--walletlink-avatar-bg);
  border: 1px solid var(--walletlink-avatar-line);
  transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
}
:where(.wl-avatar-btn:hover) .wl-avatar {
  color: var(--walletlink-fg);
  background: var(--walletlink-hover);
}

:where(.wl-overlay) {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  background: var(--walletlink-overlay);
  backdrop-filter: blur(2px);
  animation: wl-fade-in 160ms ease;
}
:where(.wl-overlay[data-state='closed']) {
  animation: wl-fade-out 130ms ease;
}

:where(.wl-modal) {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2147483001;
  transform: translate(-50%, -50%);
  width: min(92vw, 384px);
  max-height: 85vh;
  overflow-y: auto;
  font-family: var(--walletlink-font);
  color: var(--walletlink-fg);
  background: var(--walletlink-surface);
  border-radius: var(--walletlink-radius);
  box-shadow: var(--walletlink-shadow);
  padding: 22px;
  animation: wl-modal-in 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
:where(.wl-modal[data-state='closed']) {
  animation: wl-fade-out 130ms ease;
}

:where(.wl-modal-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
:where(.wl-modal-title) {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
:where(.wl-modal-close) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--walletlink-muted);
  background: none;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
:where(.wl-modal-close:hover) {
  background: var(--walletlink-hover);
  color: var(--walletlink-fg);
}

:where(.wl-wallet-list) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}
:where(.wl-wallet) {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: var(--walletlink-fg);
  text-align: left;
  text-decoration: none;
  background: none;
  border: none;
  border-radius: var(--walletlink-radius-sm);
  padding: 12px;
  cursor: pointer;
  transition: background 120ms ease;
}
:where(.wl-wallet:hover) {
  background: var(--walletlink-hover);
}
:where(.wl-wallet-install) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 500;
  color: var(--walletlink-muted);
}
:where(.wl-section-label) {
  margin: 16px 0 6px;
  padding: 0 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--walletlink-muted);
}
:where(.wl-wallet:disabled) {
  cursor: default;
}
:where(.wl-wallet:disabled:not([data-pending])) {
  opacity: 0.5;
}
:where(.wl-wallet-icon) {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: contain;
  flex-shrink: 0;
}
:where(.wl-wallet-icon--placeholder) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--walletlink-muted);
  background: var(--walletlink-hover);
}
:where(.wl-wallet-name) {
  flex: 1;
}
:where(.wl-wallet-pending) {
  font-size: 13px;
  font-weight: 500;
  color: var(--walletlink-muted);
}

:where(.wl-spinner) {
  width: 18px;
  height: 18px;
  border: 2px solid var(--walletlink-border);
  border-top-color: var(--walletlink-accent);
  border-radius: 999px;
  animation: wl-spin 700ms linear infinite;
  flex-shrink: 0;
}

:where(.wl-error) {
  display: flex;
  gap: 8px;
  margin: 0 0 14px;
  padding: 11px 12px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--walletlink-danger);
  background: color-mix(in srgb, var(--walletlink-danger) 10%, transparent);
  border-radius: var(--walletlink-radius-sm);
}
:where(.wl-empty) {
  margin: 8px 0;
  padding: 12px 0 4px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--walletlink-muted);
  text-align: center;
}

:where(.wl-menu) {
  z-index: 2147483001;
  min-width: 184px;
  font-family: var(--walletlink-font);
  color: var(--walletlink-fg);
  background: var(--walletlink-surface);
  border-radius: var(--walletlink-radius-sm);
  box-shadow: var(--walletlink-shadow);
  padding: 6px;
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
  animation: wl-menu-in 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
:where(.wl-menu[data-state='closed']) {
  animation: wl-menu-out 110ms ease;
}
:where(.wl-menu-item) {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  color: var(--walletlink-fg);
  border-radius: 9px;
  padding: 10px;
  cursor: pointer;
  user-select: none;
  outline: none;
}
:where(.wl-menu-item[data-highlighted]) {
  background: var(--walletlink-hover);
}
:where(.wl-menu-item--danger) {
  color: var(--walletlink-danger);
}

@keyframes wl-spin {
  to { transform: rotate(360deg); }
}
@keyframes wl-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes wl-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes wl-modal-in {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes wl-menu-in {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes wl-menu-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.96); }
}
`

let injected = false

/**
 * Inject the connect-UI stylesheet once. No-op on the server, on repeat calls,
 * or if a tag with the same id is already present (e.g. after an HMR reload).
 */
export function injectWalletLinkStyles(): void {
  if (injected || typeof document === 'undefined') return
  injected = true
  if (document.getElementById(STYLE_ELEMENT_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ELEMENT_ID
  style.textContent = CSS
  document.head.appendChild(style)
}
