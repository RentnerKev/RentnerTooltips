import type { FocusEventHandler, PointerEventHandler } from 'react'
import type { TooltipCustomDesign } from './tooltip.types.js'
export interface FocusSettlement {
    trigger: HTMLElement
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
