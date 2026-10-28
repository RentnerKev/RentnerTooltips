// Documents own coordination, so separate windows and SSR never share UI state.
const activeTooltips = new WeakMap<
    Document,
    { id: string; close: () => void }[]
>()

export function activateTooltip(
    document: Document,
    id: string,
    close: () => void,
) {
    const existing = activeTooltips.get(document) ?? []
    const previous = existing.at(-1)
    const owner = { id, close }
    activeTooltips.set(document, [
        ...existing.filter((entry) => entry.id !== id),
        owner,
    ])
    if (previous?.id !== id) previous?.close()
    return () => {
        const remaining = activeTooltips
            .get(document)
            ?.filter((entry) => entry !== owner)
        if (remaining?.length) activeTooltips.set(document, remaining)
        else activeTooltips.delete(document)
    }
}

export function isActiveTooltip(document: Document, id: string) {
    return activeTooltips.get(document)?.at(-1)?.id === id
}
import type { TooltipTiming } from '../../shared/Tooltip/Types/tooltip-behavior.types.ts'

export function createTooltipTiming(): TooltipTiming {
    const open = new Set<string>()
    const transit = new Set<string>()
    let skipUntil = 0
    return {
        isWarm: () => open.size > 0 || Date.now() < skipUntil,
        opened: (id) => {
            open.add(id)
        },
        closed: (id, skipDelay) => {
            open.delete(id)
            transit.delete(id)
            skipUntil = Date.now() + skipDelay
        },
        isInTransit: () => transit.size > 0,
        beginTransit: (id) => {
            transit.add(id)
        },
        endTransit: (id) => {
            transit.delete(id)
        },
    }
}
