import type { TooltipDefaults } from '../../../shared/Tooltip/Types/tooltip.types.ts'

export interface TooltipRect {
    top: number
    right: number
    bottom: number
    left: number
    width: number
    height: number
}

export interface TooltipPoint {
    x: number
    y: number
}

export interface TooltipGeometry {
    x: number
    y: number
    side: NonNullable<TooltipDefaults['side']>
    align: NonNullable<TooltipDefaults['align']>
    arrowX: number
    arrowY: number
    arrowHidden: boolean
    detached: boolean
    availableWidth: number
    availableHeight: number
    transformOrigin: string
    triggerWidth: number
    triggerHeight: number
}

export interface TooltipPositionStyle {
    position: 'fixed'
    left: number
    top: number
    width: 'max-content'
    maxWidth: number | undefined
    visibility: 'hidden' | undefined
}

export interface TooltipPosition extends TooltipGeometry {
    style: TooltipPositionStyle
    separateDescription: boolean
}

export interface TooltipMeasurements {
    rect: (element: Element) => TooltipRect
    style: (element: Element) => CSSStyleDeclaration
}
