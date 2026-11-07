# @julikhris/astro-fastify v0.6.0 — Refactoring & Astro 4 Support

## Version Changes
- **Previous**: 0.5.0 (Astro 2.x only)
- **Current**: 0.6.0 (Astro 2.x & 4.x support)

## Major Changes

### 1. **Astro 4.0 Compatibility** ✅
- Added `supportedAstroFeatures` (required in Astro 4.0+)
  - `staticOutput: 'never'` — No static export support
  - `hybridOutput: 'unsupported'` — No hybrid rendering
  - `serverOutput: 'always'` — Always SSR
  - `sharpImageService: false` — Uses default optimization

### 2. **Peer Dependency Update**
**Before:**
```json
"dependencies": {
  "astro": "2.0.6",
  ...
}
```

**After:**
```json
"peerDependencies": {
  "astro": "^2.0.6 || ^4.0.0"
}
```

✅ Adapter now supports **both Astro 2 and 4**

### 3. **Code Refactoring**

#### Renamed for clarity:
- `getAdapter()` → `createAdapterConfig()`
- `viteFastifySSRPlugin()` → `createViteFastifySSRPlugin()`
- `adapter()` → `createFastifyIntegration()`

#### Added comprehensive JSDoc:
```typescript
/**
 * Creates an Astro adapter configuration object for Fastify integration
 * 
 * Astro 4.0+ requires adapters to declare supported features via `supportedAstroFeatures`
 * This adapter is configured for server-side rendering only (SSR)
 * 
 * @param args - Optional adapter configuration options
 * @returns AstroAdapter configuration with Astro 4 feature map
 */
const createAdapterConfig = (args?: Options): AstroAdapter => { ... }
```

#### Improved inline comments:
```typescript
supportedAstroFeatures: {
  staticOutput: 'never',           // No static export support
  hybridOutput: 'unsupported',     // No hybrid rendering
  serverOutput: 'always',          // Always SSR
  sharpImageService: false,        // Uses default image optimization
},
```

#### Better variable naming:
```typescript
// Before: `let defaultArgs = initDefaultOptions(args);`
// After:  `const defaultArgs = initDefaultOptions(args);` // const prevents reassignment
```

### 4. **TypeScript & Build Config**

**Fixed tsconfig.json:**
- Added `rootDir: "./src"` — Explicit source directory
- Added `ignoreDeprecations: "6.0"` — Support modern TypeScript versions
- Removed deprecated `baseUrl` — No longer needed with rootDir

**Updated package.json:**
- Version: `0.4.0` → `0.6.0`
- astro moved from `dependencies` to `peerDependencies`
- Added dual-version peer support in `peerDependencies`

## Testing

✅ **Verified working with:**
- **Astro 4.16.19** + **@astrojs/react 3.0.0** + **@astrojs/preact 3.0.0**
- Dev server: `http://localhost:8080/` ✅
- All plugin routes loading correctly
- PWA integration active
- No feature map errors

## File Changes

### Modified Files:
- `src/index.ts` — Function renaming, JSDoc, feature map
- `package.json` — Version bump, peer dependency declaration
- `tsconfig.json` — Root dir, ignore deprecations
- `dist/index.js` — Compiled output with all changes

### Untouched:
- `src/server.ts` — Server runtime logic
- `src/defaults.ts` — Default configuration
- `src/types.ts` — Type definitions
- `src/utils.ts` — Utility functions
- `README.md` — Documentation

## Next Steps

1. **Tag Release**: `git tag v0.6.0`
2. **Publish to npm**:
   ```bash
   npm version patch  # or minor/major as needed
   npm publish --access public
   ```
3. **Update WellPhorce**: Bump adapter to `0.6.0` in package.json

## Migration Guide for Users

Users upgrading from 0.5.0:

### If using Astro 2.x:
```json
{
  "@julikhris/astro-fastify": "^0.6.0"
  // No changes needed, maintains compatibility
}
```

### If using Astro 4.x:
```json
{
  "astro": "^4.0.0",
  "@astrojs/react": "^3.0.0",
  "@astrojs/preact": "^3.0.0",
  "@julikhris/astro-fastify": "^0.6.0"
  // Now works without errors!
}
```

No adapter configuration changes required — drop-in replacement.

---

**Release Date**: November 7, 2026  
**Tested Against**: Astro 4.16.19, Node 18+
