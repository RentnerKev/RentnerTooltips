import type { TooltipCustomDesign } from '../shared/Tooltip/Types/tooltip.types.ts'

export const defaultTooltipDesign: Required<TooltipCustomDesign> = {
    baseClasses:
        'rounded-rentner-control border border-rentner-border bg-rentner-surface font-medium text-rentner-foreground shadow-xl',
    animationClasses: 'motion-safe:animate-tooltip-enter',
    contentClasses: '',
    arrowClasses: 'fill-rentner-surface stroke-rentner-border',
}

export const tooltipSizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
} as const
