import type { FocusEventHandler, PointerEventHandler } from 'react'
import type { TooltipCustomDesign, TooltipProps } from './tooltip.types.ts'
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
    }
    handler: {
        handleOpenChange: (open: boolean) => void
        handleFocus: FocusEventHandler<HTMLElement>
        handleDismissal: (event: { defaultPrevented: boolean }) => void
        handlePointerLeave: PointerEventHandler<HTMLElement>
    }
}

export type CustomTooltipLogicProps = Pick<
    TooltipProps,
    | 'open'
    | 'defaultOpen'
    | 'onOpenChange'
    | 'disabled'
    | 'disableHoverableContent'
    | 'customDesign'
>
