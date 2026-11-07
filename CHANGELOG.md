# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-11-07

### Added
- **Astro 4.0+ support** via `supportedAstroFeatures` feature map
  - `staticOutput: 'never'` — No static export support
  - `hybridOutput: 'unsupported'` — No hybrid rendering
  - `serverOutput: 'always'` — Always SSR
  - `sharpImageService: false` — Default image optimization
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
- Version bump: 0.4.0 → 0.6.0
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

## [0.5.0] - Previous Release

### Status
- Last version supporting only Astro 2.x
- No Astro 4.0 compatibility
- Recommended: upgrade to 0.6.0 for Astro 4 support

---

## Migration Guides

### From 0.5.0 → 0.6.0

**No configuration changes required.** Simply update:

```bash
npm install @julikhris/astro-fastify@^0.6.0
```

If using Astro 4.x, also update integrations:
```bash
npm install astro@^4.0.0 @astrojs/react@^3.0.0 @astrojs/preact@^3.0.0
```

### Astro 2.x → 4.x with this adapter

```json
{
  "astro": "^4.16.19",
  "@astrojs/react": "^3.0.0",
  "@astrojs/preact": "^3.0.0",
  "@julikhris/astro-fastify": "^0.6.0"
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

**Release Date**: November 7, 2026  
**Tested Against**: 
- Astro 2.0.6, 4.16.19
- Node 18+
- FastAPI ^4.5.3
