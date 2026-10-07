# @rentnerkev/tooltips

A lightweight, customizable React tooltip component built on Radix UI. The
package provides a shared provider, trigger, portal, collision handling, and
the accessible tooltip relationship. Standalone tooltips remain supported.

## Requirements

Use React 19 with React DOM 19, an ESM-capable build, and Tailwind CSS 4 for
the documented styling. Import this package's `tailwind.css` entry into your
Tailwind stylesheet. It uses `@source` for published classes and `@theme` for
global tokens such as `--color-primary`. Check for token name collisions with
your app and override them in a later `@theme` block if needed.

In a React Server Components app, import and render the tooltip provider and
tooltips from a module beginning with `'use client'`. See the
[Tailwind directives](https://tailwindcss.com/docs/functions-and-directives)
and [React client boundary](https://react.dev/reference/rsc/use-client) guides.

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
import { CustomTooltip, TooltipProvider } from '@rentnerkev/tooltips'

export function Example() {
    return (
        <TooltipProvider delayDuration={200}>
            <CustomTooltip content="Helpful information" side="top">
                <button type="button">Hover me</button>
            </CustomTooltip>
        </TooltipProvider>
    )
}
```

Use one `TooltipProvider` around a section that contains multiple tooltips. A
`CustomTooltip` inside that provider reuses it instead of creating another
Radix provider. Standalone `CustomTooltip` usage creates a fallback provider
with the default 200 ms delay.

The trigger must be a single React element. For keyboard support, it should be
focusable, such as a `button` or link. Custom trigger components must forward
the props and ref provided by Radix. Radix handles hover, focus, touch, and
ARIA behavior.

Keyboard tooltips stay open while the browser scrolls their focused trigger
into view. Escape, pointer dismissal, focus leaving the trigger, and opening
another tooltip keep their normal dismissal behavior.

`disabled` removes the tooltip behavior. Re-enabling an uncontrolled tooltip
starts from `defaultOpen` again; a controlled tooltip follows its `open` prop.

## API

### `CustomTooltip`

| Prop                       | Type                                        | Default         | Description                                                                          |
| -------------------------- | ------------------------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| `children`                 | `ReactElement`                              | –               | A single element that triggers the tooltip.                                          |
| `content`                  | `ReactNode`                                 | –               | The accessible content of the tooltip.                                               |
| `disabled`                 | `boolean`                                   | `false`         | Returns the trigger without any tooltip behavior.                                    |
| `disabledTrigger`          | `boolean`                                   | `false`         | Wraps a disabled control in a focusable tooltip trigger and blocks child activation. |
| `disabledTriggerClassName` | `string`                                    | `undefined`     | Adds classes to the disabled-trigger wrapper.                                        |
| `delayDuration`            | `number`                                    | Provider value  | Overrides the provider delay for this tooltip.                                       |
| `disableHoverableContent`  | `boolean`                                   | Provider value  | Closes the tooltip when the pointer leaves the trigger.                              |
| `open`                     | `boolean`                                   | `undefined`     | Controls the open state.                                                             |
| `defaultOpen`              | `boolean`                                   | `undefined`     | Sets the uncontrolled initial open state.                                            |
| `onOpenChange`             | `(open: boolean) => void`                   | `undefined`     | Receives open-state changes.                                                         |
| `side`                     | `'top' \| 'right' \| 'bottom' \| 'left'`    | `'top'`         | The preferred position.                                                              |
| `sideOffset`               | `number`                                    | `8`             | Distance from the trigger in pixels.                                                 |
| `align`                    | `'start' \| 'center' \| 'end'`              | `'center'`      | Alignment along the selected side.                                                   |
| `alignOffset`              | `number`                                    | `0`             | Offset from the selected alignment.                                                  |
| `avoidCollisions`          | `boolean`                                   | `true`          | Allows Radix to move content away from boundaries.                                   |
| `collisionBoundary`        | `Element \| null \| Array<Element \| null>` | `[]`            | Custom collision boundary or boundaries.                                             |
| `collisionPadding`         | `number \| SidePadding`                     | `0`             | Space kept between content and collision boundaries.                                 |
| `arrowPadding`             | `number`                                    | `0`             | Space kept between the arrow and content edges.                                      |
| `sticky`                   | `'partial' \| 'always'`                     | `'partial'`     | Controls how content behaves at a boundary.                                          |
| `hideWhenDetached`         | `boolean`                                   | `false`         | Hides content when its trigger is detached.                                          |
| `portalContainer`          | `Element \| DocumentFragment \| null`       | `document.body` | Custom portal destination.                                                           |
| `customDesign`             | `TooltipCustomDesign`                       | Default design  | Overrides individual classes for the content, animation, and arrow.                  |

`disabledTrigger` accepts a native `button`, `input`, `select`, or `textarea`
child. Other child types throw an error because they cannot be disabled
reliably. Native disabled controls cannot
receive pointer or keyboard events themselves. It keeps supported native
controls disabled, removes the child from the tab order, blocks its click and
keyboard handlers, and makes an outer `span` focusable so the explanatory
tooltip remains available. This also protects against a child that was
accidentally left enabled:

```tsx
<CustomTooltip
    content="Only administrators can delete this entry."
    disabledTrigger
>
    <button type="button" disabled>
        Delete
    </button>
</CustomTooltip>
```

Use `disabled` instead when the tooltip itself should not be active.

The disabled wrapper exposes a disabled button for button triggers, and a
labelled group for other native controls. The original control keeps its
native disabled semantics. Child `aria-label` and `aria-labelledby` values
also label the focusable wrapper. Native `<label htmlFor>` and enclosing
labels are preserved in the browser. When native labels provide the wrapper's
name, it follows its current native control and updates when associated labels
are inserted, removed, reassociated, reordered, or when the control is
replaced. Labels without an ID receive unique generated IDs while they are
associated; those IDs remain stable through reordering and are removed when
the labels are no longer associated or the wrapper unmounts. Existing label
IDs are left intact. Changes to label text remain reflected in the accessible
name. For labels provided outside the native HTML label mechanism, pass
`aria-labelledby` on the child.

### `TooltipProvider`

| Prop                      | Type        | Default | Description                                                    |
| ------------------------- | ----------- | ------- | -------------------------------------------------------------- |
| `children`                | `ReactNode` | –       | The subtree that shares provider settings.                     |
| `delayDuration`           | `number`    | `200`   | Delay before a tooltip opens.                                  |
| `skipDelayDuration`       | `number`    | `300`   | Time window for moving between tooltips without another delay. |
| `disableHoverableContent` | `boolean`   | `false` | Closes content when the pointer leaves its trigger.            |

Nested package providers reuse the nearest outer provider, so they do not
create additional Radix provider instances. Use `CustomTooltip.delayDuration`
when one tooltip needs a local delay override.

### Collision and portal configuration

```tsx
<CustomTooltip
    content="Kept inside the panel"
    side="right"
    collisionBoundary={panelElement}
    collisionPadding={{ top: 8, right: 12, bottom: 8, left: 12 }}
    portalContainer={overlayElement}
>
    <button type="button">Details</button>
</CustomTooltip>
```

The collision and portal types are derived from the installed Radix Tooltip
version, so all accepted boundary and padding shapes stay type-safe.

`TooltipProps`, `TooltipProviderProps`, and `TooltipCustomDesign` are exported
TypeScript types. `defaultTooltipDesign` is also exported for extending the
default design.

```tsx
import { CustomTooltip, defaultTooltipDesign } from '@rentnerkev/tooltips'

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

The package ships an opt-in Tailwind entry. Import it after Tailwind CSS in your
main stylesheet:

```css
@import 'tailwindcss';
@import '@rentnerkev/tooltips/tailwind.css';
```

The entry scans only the published JavaScript files under `dist`. It provides
the shared `primary`, `primary-hover`, `background-dark`, `surface-dark`,
`input-dark`, `border-dark`, `secondary-text`, and `muted-foreground` theme
tokens plus the package's transform/opacity enter animation. The animation
uses `motion-safe:` and is disabled automatically for reduced-motion users.
Override the tokens with a later `@theme` block when needed.

If you do not use Tailwind, override the design classes through `customDesign`
with classes from your own stylesheet.

## Public exports

- `CustomTooltip`
- `TooltipProvider`
- `defaultTooltipDesign`
- `TooltipProps`
- `TooltipProviderProps`
- `TooltipCustomDesign`

## Development

```bash
bun install --frozen-lockfile
bun run verify
```

`bun run verify` checks types, Oxlint, Oxfmt, unit tests, browser tests, the
build, and the published package contents with `bun pm pack --dry-run`. Install
the Playwright browsers once with `bunx playwright install chromium firefox webkit`.

The published root components and `./tooltip` / `./types` entries retain their
API and paths. Their presentation templates live under
`src/shared/Tooltip/Components`, with owning logic hooks and typed contracts
under the same domain's `Hooks` and `Types`. DOM label subscriptions
live in `src/lib/Tooltip`; the default design is declarative configuration in
`src/config`. Unit and browser tests share `src/tests`, with browser tests
mirroring their shared UI or lib owner.

Repository-only validation and release scripts live under `.github/scripts`.
TypeScript handles structured policy, GitHub API data and release notes; shell
handles verified downloads and process orchestration. Their strict typecheck is
part of `bun run typecheck`. See [repository automation](.github/AUTOMATION.md)
for the trust boundaries and publication policy.

### Playground

The interactive positioning bench demonstrates provider reuse, opening delay,
collision boundaries, a custom portal container, disabled tooltips, and disabled
native controls. Its built-in theme switch validates the Tailwind-first design
in both light and dark modes.

```bash
bun run playground:install
bun run playground:dev
```

## License

MIT
