# Changelog

## 2.0.9 - 2026-10-08

### Fixed

- The native `TooltipProvider` accepts `customDesign?: TooltipCustomDesign` and
  shares its design with descendant `CustomTooltip` instances.
- Nested providers inherit and override individual design properties. Tooltip
  overrides take precedence without mutating shared designs or affecting siblings.
- Design scopes reuse the outer Radix provider and its existing timing and hover
  settings. Standalone tooltips and providers without a design retain their
  existing behavior.

### Documentation and verification

- Documented global configuration, local overrides, and nested design scopes in
  the README, API guide, and playground.
- Exposed the design and tooltip prop types through the existing `tooltip`
  subpath alongside the root and `types` entries.
- Added inheritance, override, interaction, and packed-consumer regression checks.

Earlier releases are documented in the
[GitHub release history](https://github.com/RentnerKev/RentnerTooltips/releases).
