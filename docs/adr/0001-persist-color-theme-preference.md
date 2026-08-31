# 0001: Persist color theme preference at the browser boundary

## Status

Accepted

## Context

The application has one monochrome color system resolved through semantic CSS
tokens. A new CorpIT palette must be selectable without replacing the existing
appearance or coupling product components to brand color values. The selected
palette must survive a reload, must not make statically generated routes
dynamic, and must not flash the default palette before React hydration.

Browser Storage can be unavailable or contain malformed values. The preference
is non-sensitive UI state and must not be combined with timer state, locale,
session data, or server data.

## Decision

- `minimal` remains the default and `corpit` is the additional color theme.
- The typed theme contract is owned by `src/components/theme/model`.
- Browser Storage access is isolated in `src/components/theme/adapters` under
  the stable key `clock-app:color-theme`.
- The root layout emits the default `data-color-theme` and a static,
  allowlist-based pre-paint script restores a saved value before hydration.
- `ThemeProvider` owns in-tab state, applies the root attribute, persists
  changes, and synchronizes valid cross-tab storage events.
- Product components continue to consume semantic tokens only. Brand anchors
  and their accessible derivatives are defined in `theme.css`.

## Alternatives

- Replacing the monochrome palette was rejected because it removes an existing
  user-visible choice and makes rollback harder.
- Cookies were rejected because reading them in the root layout would opt the
  statically generated application into request-time rendering.
- A new dependency was rejected because the two-theme contract does not need a
  general-purpose theme library.
- Reading Storage only in `useEffect` was rejected because it produces a visible
  palette flash after hydration.

## Consequences

- The storage key and allowed values become a compatibility contract.
- Storage failure degrades to an in-tab selection and does not block the app.
- Adding another palette requires updating the typed allowlist, localized
  label, tokens, and boundary tests. The bootstrap allowlist is generated from
  the typed contract.
- No PII, authentication data, network egress, or server persistence is added.

## Verification and Rollback

- Unit tests verify parsing, cycling, storage failure, persistence, and
  cross-tab synchronization.
- Browser tests verify selection, root attribute changes, reload persistence,
  keyboard access, and mobile overflow.
- Desktop and mobile screenshots are reviewed for both themes.
- Rollback removes the Provider, bootstrap script, switcher, CorpIT token block,
  and the `clock-app:color-theme` preference. Unknown or retained values are
  ignored by the default theme.
