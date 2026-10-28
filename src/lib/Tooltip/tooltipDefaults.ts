import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
} from '../../shared/Tooltip/Types/tooltip.types.ts'

type ScalarDefault = Exclude<
    keyof TooltipDefaults,
    'collisionBoundary' | 'collisionPadding'
>
const scalarDefaults: Record<ScalarDefault, true> = {
    side: true,
    sideOffset: true,
    align: true,
    alignOffset: true,
    avoidCollisions: true,
    arrowPadding: true,
    sticky: true,
    hideWhenDetached: true,
    portalContainer: true,
    portalClassName: true,
    portalZIndex: true,
    size: true,
    showArrow: true,
}
const scalarDefaultKeys = Object.keys(scalarDefaults) as ScalarDefault[]
const paddingEdges = ['top', 'right', 'bottom', 'left'] as const

function sameBoundary(
    left: TooltipDefaults['collisionBoundary'],
    right: TooltipDefaults['collisionBoundary'],
) {
    if (left === right) return true
    return (
        Array.isArray(left) &&
        Array.isArray(right) &&
        left.length === right.length &&
        left.every((element, index) => element === right[index])
    )
}

function samePadding(
    left: TooltipDefaults['collisionPadding'],
    right: TooltipDefaults['collisionPadding'],
) {
    if (Object.is(left, right)) return true
    if (
        typeof left !== 'object' ||
        !left ||
        typeof right !== 'object' ||
        !right
    )
        return false
    return paddingEdges.every((edge) =>
        Object.is(
            Object.prototype.propertyIsEnumerable.call(left, edge)
                ? left[edge]
                : 0,
            Object.prototype.propertyIsEnumerable.call(right, edge)
                ? right[edge]
                : 0,
        ),
    )
}

export function sameTooltipDefaults(
    left: TooltipDefaults,
    right: TooltipDefaults,
): boolean {
    return (
        scalarDefaultKeys.every((key) => Object.is(left[key], right[key])) &&
        sameBoundary(left.collisionBoundary, right.collisionBoundary) &&
        samePadding(left.collisionPadding, right.collisionPadding)
    )
}

// Snapshots are only comparison baselines. Geometry keeps caller-owned
// containers live, including mutations between React commits.
export function snapshotTooltipDefaults(
    value: TooltipDefaults,
): TooltipDefaults {
    return {
        ...value,
        ...(Array.isArray(value.collisionBoundary)
            ? { collisionBoundary: [...value.collisionBoundary] }
            : {}),
        ...(value.collisionPadding && typeof value.collisionPadding === 'object'
            ? { collisionPadding: { ...value.collisionPadding } }
            : {}),
    }
}

export function liveTooltipCollisionDefaults(
    value: TooltipDefaults,
    read: () => TooltipDefaults,
): TooltipDefaults {
    const result = { ...value }
    for (const key of ['collisionBoundary', 'collisionPadding'] as const) {
        if (Object.prototype.propertyIsEnumerable.call(value, key))
            Object.defineProperty(result, key, {
                enumerable: true,
                configurable: true,
                get: () => read()[key],
            })
    }
    return result
}

export function mergeTooltipDefaults<
    T extends TooltipDefaults | TooltipClassNames | TooltipCustomDesign,
>(inherited: T, local?: T): T {
    const result = { ...inherited }
    if (local) {
        for (const key of Object.keys(local) as (keyof T)[]) {
            if (local[key] !== undefined) result[key] = local[key]
        }
    }
    // Preserve live provider delegation through nested providers and local
    // defaults. The remaining design/slot/scalar keys retain spread semantics.
    for (const key of ['collisionBoundary', 'collisionPadding'] as const) {
        const source =
            local &&
            Object.prototype.propertyIsEnumerable.call(local, key) &&
            (local as TooltipDefaults)[key] !== undefined
                ? local
                : inherited
        if (Object.prototype.propertyIsEnumerable.call(source, key))
            Object.defineProperty(result, key, {
                enumerable: true,
                configurable: true,
                get: () => (source as TooltipDefaults)[key],
            })
    }
    return result
}
