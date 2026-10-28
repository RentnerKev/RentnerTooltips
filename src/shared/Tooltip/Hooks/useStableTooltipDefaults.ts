import { useLayoutEffect, useState } from 'react'
import type { TooltipDefaults } from '../Types/tooltip.types.ts'
import {
    sameTooltipDefaults,
    snapshotTooltipDefaults,
    liveTooltipCollisionDefaults,
} from '../../../lib/Tooltip/tooltipDefaults.ts'

function createDefaults(value: TooltipDefaults) {
    const snapshot = snapshotTooltipDefaults(value)
    let source = value
    return {
        snapshot,
        commit(next: TooltipDefaults) {
            source = next
        },
        published: liveTooltipCollisionDefaults(snapshot, () => source),
    }
}

export function useStableTooltipDefaults(
    value: TooltipDefaults,
): TooltipDefaults {
    const [previous, setPrevious] = useState(() => createDefaults(value))
    let current = previous
    if (!sameTooltipDefaults(previous.snapshot, value)) {
        current = createDefaults(value)
        setPrevious(current)
    }
    useLayoutEffect(() => {
        // Equal inline containers still become the live source, but only after
        // commit: an abandoned render must not change an existing tooltip.
        current.commit(value)
    }, [current, value])
    return current.published
}
