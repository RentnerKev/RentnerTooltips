import type { ReactElement, ReactNode } from 'react'

export interface TooltipCustomDesign {
    baseClasses?: string
    animationClasses?: string
    contentClasses?: string
    arrowClasses?: string
}

/** Visual slots replace their defaults; positioning and accessibility stay intact. */
export interface TooltipClassNames {
    content?: string
    animation?: string
    arrow?: string
    disabledTrigger?: string
}

export interface TooltipDefaults {
    side?: 'top' | 'right' | 'bottom' | 'left'
    sideOffset?: number
    align?: 'start' | 'center' | 'end'
    alignOffset?: number
    avoidCollisions?: boolean
    collisionBoundary?: Element | null | (Element | null)[]
    collisionPadding?:
        | number
        | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
    arrowPadding?: number
    sticky?: 'partial' | 'always'
    hideWhenDetached?: boolean
    portalContainer?: Element | DocumentFragment | null
    portalClassName?: string
    portalZIndex?: number
    size?: 'sm' | 'md' | 'lg'
    showArrow?: boolean
}

export interface TooltipProviderProps extends TooltipDefaults {
    children: ReactNode
    customDesign?: TooltipCustomDesign
    classNames?: TooltipClassNames
    delayDuration?: number
    skipDelayDuration?: number
    disableHoverableContent?: boolean
}

export interface TooltipProps extends TooltipDefaults {
    children: ReactElement
    content: ReactNode
    disabled?: boolean
    disabledTrigger?: boolean
    disabledTriggerClassName?: string
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    delayDuration?: number
    disableHoverableContent?: boolean
    customDesign?: TooltipCustomDesign
    classNames?: TooltipClassNames
}
