import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
} from '../../shared/Tooltip/Types/tooltip.types.ts'

export function mergeTooltipDefaults<
    T extends TooltipDefaults | TooltipClassNames | TooltipCustomDesign,
>(inherited: T, local?: T): T {
    const result = { ...inherited }
    if (local) {
        for (const key of Object.keys(local) as (keyof T)[]) {
            if (local[key] !== undefined) result[key] = local[key]
        }
    }
    return result
}
