import type { FocusEventHandler, PointerEventHandler } from 'react'
import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
    TooltipProps,
} from './tooltip.types.ts'
export interface FocusSettlement {
    view: Window
    frame: number
    onScroll: (event: Event) => void
}

export interface CustomTooltipLogicResult {
    state: {
        isOpen: boolean
        providerDepth: number
        design: Required<TooltipCustomDesign>
        contentClassName: string
        animationClassName: string
        arrowClassName: string
        defaults: TooltipDefaults
        classNames: TooltipClassNames
    }
    handler: {
        handleOpenChange: (open: boolean) => void
        handleFocus: FocusEventHandler<HTMLElement>
        handleDismissal: (event: { defaultPrevented: boolean }) => void
        handlePointerLeave: PointerEventHandler<HTMLElement>
    }
}

export type CustomTooltipLogicProps = Omit<
    TooltipProps,
    | 'children'
    | 'content'
    | 'disabledTrigger'
    | 'disabledTriggerClassName'
    | 'delayDuration'
>
