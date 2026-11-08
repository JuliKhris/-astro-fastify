# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [X.Y.Z] - 2026-11-08

### Fixed
- **Page routes were registered from the wrong object on Astro 4.** The route loops read `route` and `params` directly from each `manifest.routes` entry. An entry is `{ file, links, scripts, styles, routeData }`, and the route data lives under `entry.routeData`. Fastify therefore received an undefined URL and the server failed at startup with an `ERR_ASSERTION` while registering routes. The adapter now reads `element.routeData`.
- Removed the `manifest.routes as unknown as RouteData[]` cast that hid this mismatch from the TypeScript compiler. Entries are now typed from `manifest`, so this class of error is caught at build time.

### Notes
- `1.0.0` has this bug on Astro 4. Upgrade to `X.Y.Z` or later.
- `4.0.2` (published 2026-11-07) has been decommissioned. The supported line is `1.x`; please do not use `4.x`.

---

## [1.0.0] - 2026-11-07

First published as `1.0.0`. This work was developed under the working name `0.6.0`; a `0.6.0` build was never published.

### Added
- **Astro 4.0+ support** via the `supportedAstroFeatures` feature map
  - `staticOutput: 'unsupported'` — no static export support
  - `hybridOutput: 'unsupported'` — no hybrid rendering
  - `serverOutput: 'stable'` — always SSR
- Dual peer dependency support: `astro@^2.0.6 || ^4.0.0`
- Comprehensive JSDoc for all major functions
- REFACTORING.md guide documenting code improvements
- CHANGELOG.md for version history

### Changed
- **BREAKING INTERNAL**: Function names refactored for clarity (internal only, API unchanged)
  - `getAdapter()` → `createAdapterConfig()`
  - `viteFastifySSRPlugin()` → `createViteFastifySSRPlugin()`
  - `adapter()` → `createFastifyIntegration()`
- Moved `astro` from `dependencies` to `peerDependencies`
- Updated tsconfig.json with modern TypeScript support

### Fixed
- **Auth plugin handling**: Better error handling and removed unused variables
- **TypeScript config**: Added `rootDir`, `ignoreDeprecations`, removed deprecated `baseUrl`
- Inconsistent logging messages — now use consistent prefixes `[astro-fastify]`

### Improved
- Code clarity with inline comments on feature map properties
- Better variable naming in auth config loading
- Error messages with context (e.g., file paths, config sources)
- No breaking changes to public API — drop-in replacement for 0.5.0

---

## [0.5.0] - 2025-09-30

### Status
- Last version supporting only Astro 2.x
- No Astro 4.0 compatibility
- Recommended: upgrade to `X.Y.Z` for Astro 4 support

---

## Migration Guides

### From 0.5.0 → X.Y.Z

**No configuration changes required.** Simply update:

```bash
npm install @julikhris/astro-fastify@X.Y.Z --save-exact
```

If using Astro 4.x, also update integrations:
```bash
npm install astro@^4.0.0 @astrojs/react@^3.0.0 @astrojs/preact@^3.0.0
```

### Astro 2.x → 4.x with this adapter

```json
{
  "astro": "4.16.19",
  "@astrojs/react": "^3.0.0",
  "@astrojs/preact": "^3.0.0",
  "@julikhris/astro-fastify": "X.Y.Z"
}
```

Works with no adapter configuration changes — fully backward compatible.

---

## Known Limitations

1. **No static export** — Adapter is SSR-only
2. **No hybrid rendering** — Full server-side rendering required
3. **Development-only features** — Some Workbox caching may not work identically between dev and production

---

## Support

For issues, feature requests, or questions:
- GitHub Issues: https://github.com/JuliKhris/-astro-fastify/issues
- Astro Docs: https://docs.astro.build/en/guides/deploy/node/

---

**Tested Against**:
- Astro 4.16.19 on Node 22
- Fastify ^4.5.3