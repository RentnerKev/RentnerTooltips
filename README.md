# @rentnerkev/tooltips

A lightweight, customizable React tooltip component built on Radix UI. The
component provides the provider, trigger, portal, and accessible tooltip
relationship, so you do not need to configure an additional Radix provider.

## Installation

```bash
npm install @rentnerkev/tooltips
```

Or with Bun:

```bash
bun add @rentnerkev/tooltips
```

## Quick start

```tsx
import { CustomTooltip } from '@rentnerkev/tooltips'

export function Example() {
    return (
        <CustomTooltip content="Helpful information" side="top">
            <button type="button">Hover me</button>
        </CustomTooltip>
    )
}
```

The trigger must be a single React element. For keyboard support, it should be
focusable, such as a `button` or link. Custom trigger components must forward
the props and ref provided by Radix. Radix handles hover, focus, touch, and
ARIA behavior.

## API

### `CustomTooltip`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactElement` | – | A single element that triggers the tooltip. |
| `content` | `ReactNode` | – | The accessible content of the tooltip. |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | The preferred position. |
| `customDesign` | `TooltipCustomDesign` | Default design | Overrides individual classes for the content, animation, and arrow. |

`TooltipProps` and `TooltipCustomDesign` are exported TypeScript types.
`defaultTooltipDesign` is also exported for extending the default design.

```tsx
import {
    CustomTooltip,
    defaultTooltipDesign,
} from '@rentnerkev/tooltips'

const design = {
    ...defaultTooltipDesign,
    contentClasses: 'max-w-xs text-center',
}

export function StyledExample() {
    return (
        <CustomTooltip content="Custom styling" customDesign={design}>
            <button type="button">Learn more</button>
        </CustomTooltip>
    )
}
```

## Styling

The package does not ship a CSS file. The default design uses Tailwind CSS
class names. With Tailwind CSS v4, add the package files as a source:

```css
@import 'tailwindcss';
@source '../node_modules/@rentnerkev/tooltips';
```

If you do not use Tailwind, override the design classes through `customDesign`
with classes from your own stylesheet.

## Public exports

- `CustomTooltip`
- `defaultTooltipDesign`
- `TooltipProps`
- `TooltipCustomDesign`

## Development

```bash
bun install --frozen-lockfile
bun run verify
```

`bun run verify` checks types, Oxlint, Oxfmt, the build, and the published
package contents with `npm pack --dry-run`.

## License

MIT
