# Clock App

> Minimal clock with golden ratio aesthetics

---

## Quick Reference

```text
npm run dev          # development
npm run build        # production build
npm run test:run     # run tests
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier
```

---

## Architecture

```text
src/
├─ app/[locale]/          # Next.js routing
├─ features/
│  └─ {feature}/          # Feature UI + model + public barrel
├─ components/            # Shared UI + application shell
├─ lib/
│  ├─ i18n/               # localization config
│  ├─ utils/              # pure functions
│  ├─ web-vitals/         # [client] @/lib/web-vitals
│  └─ index.ts            # [server-safe] barrel
├─ test/                  # test utilities + setup
└─ types/                 # global declarations only
```

### Import Paths

```typescript
import { Clock } from '@/features/clock' // feature public API
import { HomeUtilityMenu } from '@/components/layout/HomeUtilityMenu' // shared component
import { formatTimeInZone } from '@/lib/time' // server-safe time utilities
import { useCurrentTime } from '@/lib/time/client' // explicit client entry
import { WebVitals } from '@/lib/web-vitals' // client components
```

Dependencies flow in one direction: `app -> features -> components -> lib`.
Feature internals use relative imports. See `docs/architecture.md` for details.

---

## Code Style

| Prefer                  | Avoid                   |
| ----------------------- | ----------------------- |
| `type`                  | `interface`             |
| `memo()` components     | unnecessary re-renders  |
| semantic color tokens   | hardcoded colors        |
| relative imports in lib | circular `@/lib` in lib |
| barrel exports          | deep file imports       |

### Patterns

```typescript
// Component with memo
export const X = memo(function X(props: Props) { })

// Shared state hook
useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

// i18n
const t = useTranslations('namespace')

// Test wrapper
<IntlWrapper locale="ja"><Component /></IntlWrapper>
```

### Styling

```typescript
// Semantic tokens
bg-background  text-foreground  text-foreground-muted  border-border

// Avoid
bg-black  text-white  text-white/60  slate-900
```

---

## Golden Ratio Design

```text
φ   = 1.618
1/φ   = 0.618  ─  primary
1/φ²  = 0.382  ─  secondary
1/φ³  = 0.236  ─  tertiary
```

### Visual Anchor: Colon-Centered Layout

```text
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              10 : 30 ₄₅             │
│                 ↑                   │
│           ─ ─ ─ ┼ ─ ─ ─  center     │
│                 ↓                   │
│           Mon, Jan 15, 2024         │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Principle**: The colon ":" is the visual anchor, always centered on screen.

| Element | Positioning | Reason                         |
| ------- | ----------- | ------------------------------ |
| HH:MM   | centered    | colon at exact screen center   |
| :SS     | `absolute`  | doesn't affect colon centering |
| Date    | flow below  | secondary info, follows anchor |

```css
/* Seconds: absolute so it doesn't shift the center */
.seconds {
  position: absolute;
  left: 100%;
}
```

### Typography Scale

| Element | Size                              | Ratio |
| ------- | --------------------------------- | ----- |
| HH:MM   | `clamp(3.82rem, 16.18vw, 10rem)`  | 1     |
| :SS     | `0.382em`                         | 1/φ²  |
| Date    | `clamp(0.875rem, 2.36vw, 1.5rem)` | 1/φ³  |

### Spacing & Layout

| Element       | Value     | Derivation       |
| ------------- | --------- | ---------------- |
| Switcher pos  | `2.36%`   | 1/φ³ × 10        |
| Colon margin  | `0.05em`  | subtle           |
| Seconds gap   | `0.12em`  | clear separation |
| Date margin   | `0.618em` | 1/φ              |
| Date tracking | `0.032em` | time × φ         |

### Animation & Effects

| Property    | Value                              | Derivation |
| ----------- | ---------------------------------- | ---------- |
| Duration    | `1.618s`                           | φ          |
| Easing      | `cubic-bezier(0.382, 0, 0.618, 1)` | 1/φ², 1/φ  |
| Min opacity | `0.382`                            | 1/φ²       |
| Glow spread | `1.618rem`                         | φ          |

---

## Accessibility

```typescript
role="timer"
aria-label={t('currentTime')}
```

```css
@media (prefers-reduced-motion: reduce) {
  animation: none;
}
```

---

## Pre-submit Checklist

```bash
npm run type-check && npm run lint && npm run test:run && npm run build
```
