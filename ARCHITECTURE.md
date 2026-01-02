# RenderBlocks Architecture

## Philosophy

RenderBlocks is a **suite of educational products** sharing a common brand and UX. Each product is self-contained with its own block types, rules, and content. The core provides the unified RenderBlocks experience.

**Key principles:**
- Products are independent and can be developed/marketed in isolation
- Core provides shared UX: navigation, viewport/scaling, theming
- Each product owns its own block types, rendering, and interaction rules
- Common scaling behavior ensures consistent feel across products
- No forced abstractions between products

---

## Monorepo Structure

RenderBlocks uses **pnpm workspaces** for independent product development with shared packages.

```
renderblocks/                    # Monorepo root
├── package.json                 # Workspace config
├── pnpm-workspace.yaml          # Workspace definitions
├── turbo.json                   # (optional) Turborepo for caching
│
├── apps/
│   └── web/                     # Main web application
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── App.tsx          # Shell + product routing
│           └── main.tsx
│
├── packages/
│   ├── core/                    # @renderblocks/core
│   │   ├── package.json
│   │   └── src/
│   │       ├── shell/           # AppShell, HomeScreen, Router
│   │       ├── viewport/        # useViewport, useZoom, useBounds
│   │       ├── theme/           # useDarkMode, colors
│   │       ├── audio/           # useTTS, useSoundEffects
│   │       ├── entitlements/    # useEntitlements, ProductGate
│   │       └── index.ts         # Public exports
│   │
│   ├── shared/                  # @renderblocks/shared
│   │   ├── package.json
│   │   └── src/
│   │       ├── touch/           # useLongPress, useGestures
│   │       ├── animation/       # springPresets
│   │       ├── geometry/        # collision, positioning
│   │       └── index.ts
│   │
│   └── ui/                      # @renderblocks/ui (optional)
│       ├── package.json
│       └── src/
│           ├── Button.tsx
│           ├── Modal.tsx
│           └── index.ts
│
├── products/
│   ├── numbers/                 # @renderblocks/numbers
│   │   ├── package.json
│   │   └── src/
│   │       ├── components/
│   │       │   ├── NumberBlock.tsx
│   │       │   ├── Mirror.tsx
│   │       │   └── SubtractMenu.tsx
│   │       ├── hooks/
│   │       │   └── useNumberBlocks.ts
│   │       ├── types.ts
│   │       └── index.tsx        # Product entry point
│   │
│   ├── matching/                # @renderblocks/matching
│   │   ├── package.json
│   │   └── src/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── data/
│   │       └── index.tsx
│   │
│   ├── phonics/                 # @renderblocks/phonics
│   │   └── ...
│   │
│   └── math/                    # @renderblocks/math
│       └── ...
│
└── tooling/                     # Shared dev configs
    ├── eslint/
    ├── typescript/
    └── tailwind/
```

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'products/*'
```

```json
// package.json (root)
{
  "name": "renderblocks",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @renderblocks/web dev",
    "dev:numbers": "pnpm --filter @renderblocks/numbers dev",
    "build": "pnpm -r build",
    "build:numbers": "pnpm --filter @renderblocks/numbers build"
  }
}
```

### Package Dependencies

```json
// products/numbers/package.json
{
  "name": "@renderblocks/numbers",
  "dependencies": {
    "@renderblocks/core": "workspace:*",
    "@renderblocks/shared": "workspace:*"
  }
}
```

### Import Patterns

```typescript
// In products/numbers/src/index.tsx
import { AppShell, useViewport, useZoom } from '@renderblocks/core';
import { useLongPress, springPresets } from '@renderblocks/shared';

// Product owns its own components
import { NumberBlock } from './components/NumberBlock';
import { useNumberBlocks } from './hooks/useNumberBlocks';
```

---

## Product Package Structure

Each product in `products/` follows this internal structure:

```
products/numbers/
├── package.json
├── tsconfig.json
├── vite.config.ts               # For standalone dev/testing
└── src/
    ├── components/              # Product-specific components
    │   ├── NumberBlock.tsx
    │   ├── Mirror.tsx
    │   └── SubtractMenu.tsx
    ├── hooks/                   # Product-specific state/logic
    │   └── useNumberBlocks.ts
    ├── utils/                   # Product-specific helpers
    ├── types.ts                 # Product-specific types
    ├── constants.ts             # Colors, dimensions, etc.
    └── index.tsx                # Product entry point
```

---

## Core Modules

Core provides the shared "RenderBlocks experience" across all products.

### shell/
App-wide chrome and navigation. Every product renders inside the shell.

- **AppShell**: Header, footer slots, consistent layout
- **HomeScreen**: Product selector with purchase status
- **Router**: Product-based routing
- **Settings**: App preferences (audio, theme, etc.)

### viewport/
**Critical shared behavior.** All products use the same scaling/bounds system for consistent UX.

- **useViewport**: Screen dimensions, resize handling, orientation
- **useZoom**: Zoom level with pinch/scroll controls
- **useBounds**: Clamp elements to screen, prevent overflow
- **useAutoScale**: Scale canvas when content exceeds bounds

This ensures blocks in all products feel the same: same zoom behavior, same edge handling, same touch responsiveness.

### theme/
Visual consistency across products.

- **useDarkMode**: System preference detection, toggle, persistence
- **colors**: RenderBlocks brand color tokens

### audio/
Sound services available to all products.

- **useTTS**: Text-to-speech synthesis
- **useSoundEffects**: Play audio files (success, error, etc.)

---

## Shared Utilities (@renderblocks/shared)

Optional helpers that products can import. Not required.

### touch/
Common touch interaction patterns.

- **useLongPress**: Detect long press for context actions
- **useGestures**: Pinch, swipe detection (if needed)

### animation/
Framer Motion presets for consistent feel.

- **springPresets**: Standard spring configs (bouncy, snappy, gentle)

### geometry/
Position and collision math.

- **collision**: Box overlap detection
- **positioning**: Clamp to bounds, center calculations

---

## Development Workflow

### Working on a Single Product

```bash
# Start dev server for just numbers product
pnpm dev:numbers

# Or with filter
pnpm --filter @renderblocks/numbers dev
```

Each product has its own `vite.config.ts` for standalone development.

### Working on Core

```bash
# Changes to core are picked up by dependent products
pnpm --filter @renderblocks/core build --watch
```

### Running Full App

```bash
# Start the main web app (includes all products)
pnpm dev
```

---

## Adding a New Product

1. Create folder: `products/your-product/`
2. Add `package.json` with dependencies on `@renderblocks/core`
3. Add entry component: `src/index.tsx`
4. Register in product registry (`apps/web/src/products.ts`)
5. Build components, hooks, types as needed
6. Import from `@renderblocks/core` for shell integration
7. Import from `@renderblocks/shared` for optional utilities

### Product Entry Point

```typescript
// products/your-product/src/index.tsx
import { useViewport, useBounds } from '@renderblocks/core';

export interface YourProductProps {
  onExit: () => void;
}

export function YourProduct({ onExit }: YourProductProps) {
  const viewport = useViewport();

  return (
    <div>
      {/* Product content */}
    </div>
  );
}

// Product metadata for registry
export const metadata = {
  id: 'your-product',
  name: 'RenderBlocks YourProduct',
  description: 'Product description',
  icon: '🎯',
  storeProductId: 'com.renderblocks.yourproduct',
};
```

---

## Current State → Migration Path

The existing codebase is a flat `src/` structure. Migration to monorepo:

```
Current                          → Monorepo Location
─────────────────────────────────────────────────────
src/components/blocks/           → products/numbers/src/components/
src/components/layout/AppShell   → packages/core/src/shell/
src/components/ui/Mirror         → products/numbers/src/components/
src/components/ui/SubtractMenu   → products/numbers/src/components/
src/hooks/useNumberBlocks        → products/numbers/src/hooks/
src/hooks/useDarkMode            → packages/core/src/theme/
src/hooks/useVoiceInput          → packages/core/src/audio/
src/types/                       → products/numbers/src/types.ts
src/utils/                       → packages/shared/src/ or products/numbers/
src/App.tsx                      → apps/web/src/App.tsx (simplified)
```

Migration can be incremental - start by extracting core, then move numbers to product folder.

---

## Monetization Model

RenderBlocks is a **suite of educational products** under one brand. Each mode is a standalone product that can be marketed, purchased, and updated independently.

### Product Structure

```
RenderBlocks (free shell)
├── RenderBlocks Numbers    (in-app purchase)
├── RenderBlocks Matching   (in-app purchase)
├── RenderBlocks Phonics    (in-app purchase)
├── RenderBlocks Math       (in-app purchase)
└── RenderBlocks Bundle     (all products, discounted)
```

### Entitlements Model

```typescript
// core/entitlements/types.ts

// Each mode is a purchasable product
interface ProductDefinition {
  id: string;                    // e.g., 'numbers', 'matching'
  name: string;                  // e.g., 'RenderBlocks Numbers'
  description: string;
  icon: string;
  storeProductId: string;        // App store product ID
  component: React.LazyExoticComponent<...>;
}

// User's purchased products
interface Entitlements {
  products: Set<string>;         // Purchased product IDs
  hasBundle: boolean;            // Owns all-access bundle
}

// Check if user owns a product
function hasProduct(productId: string): boolean;
function hasAnyProduct(): boolean;  // For "premium user" checks
```

### Gating Philosophy

**Every mode has a free tier.** Users can experience core functionality before purchasing. Each mode is its own sales funnel.

### Per-Product Tiers

| Product | Free Tier (Onramp) | Paid Unlocks |
|---------|-------------------|--------------|
| RenderBlocks Numbers | Numbers 1-10, combine/split | 11-100, voice, save state |
| RenderBlocks Matching | 5 basic word sets | Full library, custom sets |
| RenderBlocks Phonics | Letter sounds A-E | Full alphabet, blending |
| RenderBlocks Math | Basic equations | Advanced operations, levels |

### Marketing Independence

Each product can be:
- Marketed separately with focused messaging
- Updated on its own release cycle
- Priced individually based on content depth
- Featured in App Store categories independently

### Core Entitlements Module

```
core/
├── entitlements/
│   ├── types.ts             # Product, entitlement types
│   ├── useEntitlements.ts   # Check owned products
│   ├── ProductGate.tsx      # Wrapper that shows purchase prompt if not owned
│   ├── PurchasePrompt.tsx   # Product purchase UI
│   └── products.ts          # Product registry
```

### Product Registration

```typescript
// core/entitlements/products.ts
export const products: ProductDefinition[] = [
  {
    id: 'numbers',
    name: 'RenderBlocks Numbers',
    description: 'Build and combine number blocks',
    icon: '🔢',
    storeProductId: 'com.renderblocks.numbers',
    component: lazy(() => import('../../modes/numberblocks/NumberblocksMode')),
  },
  {
    id: 'matching',
    name: 'RenderBlocks Matching',
    description: 'Match pictures to words',
    icon: '🖼️',
    storeProductId: 'com.renderblocks.matching',
    component: lazy(() => import('../../modes/word-match/WordMatchMode')),
  },
];
```

### Usage in Modes

```typescript
// Feature gating within a mode
function NumberblocksMode() {
  const { hasProduct } = useEntitlements();
  const isPurchased = hasProduct('numbers');

  return (
    <>
      {/* Free tier: 1-10 */}
      <Mirror maxValue={isPurchased ? 100 : 10} />

      {/* Gated feature */}
      <ProductGate
        productId="numbers"
        fallback={<PurchasePrompt productId="numbers" feature="voice" />}
      >
        <VoiceControls />
      </ProductGate>
    </>
  );
}
```

### Home Screen

All products visible, free tiers accessible:

```typescript
function HomeScreen() {
  const { hasProduct } = useEntitlements();

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          isPurchased={hasProduct(product.id)}
          onSelect={() => launchMode(product.id)}
        />
      ))}
    </div>
  );
}
```

### Payment Integration

```
core/
├── entitlements/
│   ├── storage.ts           # Persist purchases locally
│   └── providers/
│       ├── appStore.ts      # iOS App Store
│       ├── playStore.ts     # Google Play
│       └── stripe.ts        # Web payments
│       └── bundle.ts        # Bundle discount logic
```

### Bundle Strategy

- Individual products: $X each
- RenderBlocks Bundle: All current + future products at discount
- Bundle purchasers get new products automatically

---

## Future Considerations

- **Cross-mode progress**: If modes share a progression system, add `core/progress/`
- **User profiles**: If multi-user, add `core/users/`
- **Cloud sync**: If saving state, add `core/storage/`
- **Analytics**: If tracking usage, add `core/analytics/`

Keep core minimal. Only add when truly universal.
