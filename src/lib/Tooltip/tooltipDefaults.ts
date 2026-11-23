import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
} from '../../shared/Tooltip/Types/tooltip.types.ts'

export function mergeTooltipDefaults<
    T extends TooltipDefaults | TooltipClassNames | TooltipCustomDesign,
>(inherited: T, local?: T): T {
    if (!local) return inherited
    let result: T | undefined
    for (const key in local) {
        if (!Object.hasOwn(local, key)) continue
        const typedKey = key as keyof T
        const value = local[typedKey]
        if (value !== undefined) {
            result ??= { ...inherited }
            result[typedKey] = value
        }
    }
    return result ?? inherited
}
