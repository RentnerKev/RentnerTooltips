import type {
    TooltipPosition,
    TooltipPositionStyle,
} from './Types/tooltip-geometry.types.ts'

const positionFields: Record<Exclude<keyof TooltipPosition, 'style'>, true> = {
    x: true,
    y: true,
    side: true,
    align: true,
    arrowX: true,
    arrowY: true,
    arrowHidden: true,
    detached: true,
    availableWidth: true,
    availableHeight: true,
    transformOrigin: true,
    triggerWidth: true,
    triggerHeight: true,
    separateDescription: true,
}
const styleFields: Record<keyof TooltipPositionStyle, true> = {
    position: true,
    left: true,
    top: true,
    width: true,
    maxWidth: true,
    visibility: true,
}
const positionKeys = Object.keys(
    positionFields,
) as (keyof typeof positionFields)[]
const styleKeys = Object.keys(styleFields) as (keyof TooltipPositionStyle)[]

function sameField(left: unknown, right: unknown) {
    if (left === right) return true
    // Preserve the previous JSON comparison's numeric behavior, including
    // signed zero and non-finite values, without allocating serialized strings.
    return (
        typeof left === 'number' &&
        typeof right === 'number' &&
        !Number.isFinite(left) &&
        !Number.isFinite(right)
    )
}

export function sameTooltipPosition(
    left: TooltipPosition,
    right: TooltipPosition,
): boolean {
    return (
        positionKeys.every((key) => sameField(left[key], right[key])) &&
        styleKeys.every((key) => sameField(left.style[key], right.style[key]))
    )
}
