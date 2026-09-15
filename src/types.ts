import type { ReactElement, ReactNode } from 'react'

export interface TooltipCustomDesign {
    baseClasses?: string
    animationClasses?: string
    contentClasses?: string
    arrowClasses?: string
}

export const defaultTooltipDesign: Required<TooltipCustomDesign> = {
    baseClasses:
        'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-lg border border-border-dark bg-surface-dark px-3 py-1.5 text-xs font-medium text-gray-200 shadow-xl data-[side=bottom]:slide-in-from-top-2',
    animationClasses: 'animate-in fade-in zoom-in-95',
    contentClasses: '',
    arrowClasses: 'fill-surface-dark stroke-border-dark',
}

export interface TooltipProps {
    children: ReactElement
    content: ReactNode
    side?: 'top' | 'right' | 'bottom' | 'left'
    customDesign?: TooltipCustomDesign
}
