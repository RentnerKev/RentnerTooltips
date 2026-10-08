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

[Full API and usage guide](https://npm.rentner.dev/docs/tooltips) · [Local Playground](./playground) · [MIT license](./LICENSE)
