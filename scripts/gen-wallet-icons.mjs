// Regenerates src/components/wallet-icons.ts from the optimized source SVGs in
// assets/wallet-logos. The logos are inlined as base64 data URIs so the connect UI
// needs no runtime CDN fetch (keeping the connection path SaaS-free).
//
// Run after adding or re-optimizing a logo:  node scripts/gen-wallet-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const logos = join(root, 'assets', 'wallet-logos')
const out = join(root, 'src', 'components', 'wallet-icons.ts')

// exported constant -> source file in assets/wallet-logos
const files = {
  METAMASK_ICON: 'metamask.svg',
  COINBASE_ICON: 'coinbase.svg',
  RABBY_ICON: 'rabby.svg',
  TRUST_ICON: 'trust.svg',
  PHANTOM_ICON: 'phantom.svg',
}

let body =
  '// Wallet logos inlined as base64 data URIs, generated from assets/wallet-logos.\n' +
  '// Bundled so the connect UI needs no runtime CDN fetch. Do not edit by hand;\n' +
  '// run `node scripts/gen-wallet-icons.mjs` to regenerate.\n\n'

for (const [name, file] of Object.entries(files)) {
  const b64 = readFileSync(join(logos, file)).toString('base64')
  body += `export const ${name} = 'data:image/svg+xml;base64,${b64}'\n`
}

writeFileSync(out, body)
console.log('wrote', out)
