import type { TooltipCustomDesign } from '../shared/Tooltip/Types/tooltip.types.js'

export const defaultTooltipDesign: Required<TooltipCustomDesign> = {
    baseClasses:
        'rounded-lg border border-border-dark bg-surface-dark px-3 py-1.5 text-xs font-medium text-gray-200 shadow-xl',
    animationClasses: 'motion-safe:animate-tooltip-enter',
    contentClasses: '',
    arrowClasses: 'fill-surface-dark stroke-border-dark',
}
