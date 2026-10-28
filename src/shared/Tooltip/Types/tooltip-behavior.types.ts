import type {
    FocusEventHandler,
    PointerEventHandler,
    MouseEventHandler,
    Ref,
    ReactElement,
} from 'react'

export interface TooltipTiming {
    isWarm: () => boolean
    opened: (id: string) => void
    closed: (id: string, skipDelay: number) => void
    isInTransit: () => boolean
    beginTransit: (id: string) => void
    endTransit: (id: string) => void
}

export interface TooltipBehavior {
    delayDuration: number
    skipDelayDuration: number
    timing: TooltipTiming
}

export interface TooltipTriggerProps {
    ref?: Ref<HTMLElement>
    'aria-describedby'?: string
    'data-state'?: string
    onFocus?: FocusEventHandler<HTMLElement>
    onBlur?: FocusEventHandler<HTMLElement>
    onPointerMove?: PointerEventHandler<HTMLElement>
    onPointerLeave?: PointerEventHandler<HTMLElement>
    onPointerDown?: PointerEventHandler<HTMLElement>
    onClick?: MouseEventHandler<HTMLElement>
}

export interface TooltipInteractionOptions {
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    delayDuration?: number
    disableHoverableContent?: boolean
    disabled?: boolean
}

export type TooltipTriggerElement = ReactElement<TooltipTriggerProps>
