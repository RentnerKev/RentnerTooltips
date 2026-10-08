<p align="center">
    <img src="https://raw.githubusercontent.com/RentnerKev/RentnerTooltips/main/assets/readme/banner.png" alt="RentnerTooltips" width="100%">
</p>

<p align="center">
    <a href="https://github.com/RentnerKev/RentnerTooltips/actions/workflows/ci.yml"><img src="https://github.com/RentnerKev/RentnerTooltips/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
    <a href="https://github.com/RentnerKev/RentnerTooltips/actions/workflows/codeql.yml"><img src="https://github.com/RentnerKev/RentnerTooltips/actions/workflows/codeql.yml/badge.svg?branch=main" alt="CodeQL"></a>
    <a href="https://www.npmjs.com/package/@rentnerkev/tooltips"><img src="https://img.shields.io/npm/v/@rentnerkev/tooltips" alt="npm version"></a>
    <a href="https://www.npmjs.com/package/@rentnerkev/tooltips"><img src="https://img.shields.io/npm/dm/@rentnerkev/tooltips" alt="npm downloads"></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
</p>

Accessible React tooltips with flexible placement, collision handling, disabled triggers, and custom designs.

## Installation

Requires React 19, React DOM 19, and Tailwind CSS 4.

```bash
npm install @rentnerkev/tooltips
# or with Bun
bun add @rentnerkev/tooltips
```

Add to your application stylesheet:

```css
@import 'tailwindcss';
@import '@rentnerkev/tooltips/tailwind.css';
```

## Quick start

```tsx
'use client'

import { CustomTooltip, TooltipProvider } from '@rentnerkev/tooltips'

export function App() {
    return (
        <TooltipProvider delayDuration={200}>
            <CustomTooltip content="Save your changes" side="top">
                <button type="button">Save</button>
            </CustomTooltip>
        </TooltipProvider>
    )
}
```

## Global design and local overrides

Configure shared classes once on the native `TooltipProvider`:

```tsx
import { CustomTooltip, TooltipProvider } from '@rentnerkev/tooltips'
import type { TooltipCustomDesign } from '@rentnerkev/tooltips'

const tooltipDesign = {
    baseClasses:
        'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-lg',
    arrowClasses: 'fill-slate-900',
} satisfies TooltipCustomDesign

export function Actions() {
    return (
        <TooltipProvider customDesign={tooltipDesign} delayDuration={200}>
            <CustomTooltip content="Uses the shared design">
                <button type="button">Save</button>
            </CustomTooltip>
            <CustomTooltip
                content="Overrides only the content classes"
                customDesign={{ contentClasses: 'font-semibold' }}
            >
                <button type="button">Publish</button>
            </CustomTooltip>
            <TooltipProvider customDesign={{ contentClasses: 'text-center' }}>
                <CustomTooltip content="Inherits the shared base and arrow">
                    <button type="button">Details</button>
                </CustomTooltip>
            </TooltipProvider>
        </TooltipProvider>
    )
}
```

Design properties resolve in this order: package defaults, outer provider,
nested providers, then the tooltip's local `customDesign`. Only supplied
properties replace inherited values; each class string replaces that entire
property. Use `''` to clear a property's classes. Without `customDesign`, the
existing default and standalone behavior remains available.

Nested providers scope design overrides while sharing the outer Radix provider,
opening delay, skip-delay window, and hover behavior. Use a tooltip's own
`delayDuration` for a local timing override.

## Screenshots

|                                                                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shared provider and top placement**<br>[![Shared provider and top placement](https://raw.githubusercontent.com/RentnerKev/RentnerTooltips/main/assets/readme/screenshots/shared-provider-top.png)](https://raw.githubusercontent.com/RentnerKev/RentnerTooltips/main/assets/readme/screenshots/shared-provider-top.png)         | **Dark design and right placement**<br>[![Dark design and right placement](https://raw.githubusercontent.com/RentnerKev/RentnerTooltips/main/assets/readme/screenshots/dark-right-placement.png)](https://raw.githubusercontent.com/RentnerKev/RentnerTooltips/main/assets/readme/screenshots/dark-right-placement.png) |
| **Disabled control explanation**<br>[![Disabled control explanation](https://raw.githubusercontent.com/RentnerKev/RentnerTooltips/main/assets/readme/screenshots/disabled-control-explanation.png)](https://raw.githubusercontent.com/RentnerKev/RentnerTooltips/main/assets/readme/screenshots/disabled-control-explanation.png) | **Automatic collision correction**<br>[![Automatic collision correction](https://raw.githubusercontent.com/RentnerKev/RentnerTooltips/main/assets/readme/screenshots/collision-boundary.png)](https://raw.githubusercontent.com/RentnerKev/RentnerTooltips/main/assets/readme/screenshots/collision-boundary.png)       |

Run the local Playground from a repository checkout:

```bash
bun install --cwd playground
bun run playground:dev
```

[Full API and usage guide](https://npm.rentner.dev/docs/tooltips) · [Local Playground](./playground) · [Changelog](./docs/changelog.md) · [MIT license](./LICENSE)

## AI and read-only MCP access

The separate `@rentnerkev/tooltips/ai` entry is for Node.js and Bun tooling. It reads
only this installed package's manifest, README, usage guide, and built TypeScript
declarations. It does not import React, mount UI, run examples, perform network
requests, or require an MCP runtime. Keep it in server/tooling code.

```ts
import {
    getPackageInfo,
    getPackageApi,
    getPackageDocumentation,
    searchPackageDocumentation,
    getPackageExamples,
} from '@rentnerkev/tooltips/ai'

const info = getPackageInfo()
const api = getPackageApi() // All public typed subpaths and dependent declarations
const usage = getPackageDocumentation('usage') // Full guide, including CSS and providers
const readme = getPackageDocumentation('readme')
const matches = searchPackageDocumentation('messages') // Literal, case-insensitive lines
const examples = getPackageExamples() // Fenced examples from the usage guide
```

`getPackageApi({ subpath: '.', symbol: 'CustomTooltip' })` validates the symbol
against the selected public entry and returns its complete declaration context.
Unknown subpaths or symbols throw an error. File paths are not accepted. The
`./ai` entry itself is excluded from this UI API context. The manifest's `exports`
map remains available through `getPackageInfo()`.

Public website discovery is planned at
[llms.txt](https://packages.rentner.dev/llms.txt) and
[the MCP endpoint](https://packages.rentner.dev/mcp). These addresses become
available after the website deployment; this documentation does not claim the
endpoint is already online. The website's read-only tools expose public package
information, API declarations, usage guides, examples, and search, without
accounts, write operations, or access to private project files. The installed
`/ai` entry works locally without that service. Always use the documentation and
declarations for the version installed in your project.
