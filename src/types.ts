import type {
    TooltipContentProps as RadixTooltipContentProps,
    TooltipPortalProps as RadixTooltipPortalProps,
    TooltipProps as RadixTooltipRootProps,
    TooltipProviderProps as RadixTooltipProviderProps,
} from '@radix-ui/react-tooltip'
import type { ReactElement, ReactNode } from 'react'

export interface TooltipCustomDesign {
    baseClasses?: string
    animationClasses?: string
    contentClasses?: string
    arrowClasses?: string
}

export const defaultTooltipDesign: Required<TooltipCustomDesign> = {
    baseClasses:
        'rounded-lg border border-border-dark bg-surface-dark px-3 py-1.5 text-xs font-medium text-gray-200 shadow-xl',
    animationClasses: 'motion-safe:animate-tooltip-enter',
    contentClasses: '',
    arrowClasses: 'fill-surface-dark stroke-border-dark',
}

export interface TooltipProviderProps {
    children: ReactNode
    delayDuration?: RadixTooltipProviderProps['delayDuration']
    skipDelayDuration?: RadixTooltipProviderProps['skipDelayDuration']
    disableHoverableContent?: RadixTooltipProviderProps['disableHoverableContent']
}

export interface TooltipProps {
    children: ReactElement
    content: ReactNode
    disabled?: boolean
    disabledTrigger?: boolean
    disabledTriggerClassName?: string
    open?: RadixTooltipRootProps['open']
    defaultOpen?: RadixTooltipRootProps['defaultOpen']
    onOpenChange?: RadixTooltipRootProps['onOpenChange']
    delayDuration?: RadixTooltipRootProps['delayDuration']
    disableHoverableContent?: RadixTooltipRootProps['disableHoverableContent']
    side?: RadixTooltipContentProps['side']
    sideOffset?: RadixTooltipContentProps['sideOffset']
    align?: RadixTooltipContentProps['align']
    alignOffset?: RadixTooltipContentProps['alignOffset']
    avoidCollisions?: RadixTooltipContentProps['avoidCollisions']
    collisionBoundary?: RadixTooltipContentProps['collisionBoundary']
    collisionPadding?: RadixTooltipContentProps['collisionPadding']
    arrowPadding?: RadixTooltipContentProps['arrowPadding']
    sticky?: RadixTooltipContentProps['sticky']
    hideWhenDetached?: RadixTooltipContentProps['hideWhenDetached']
    portalContainer?: RadixTooltipPortalProps['container']
    customDesign?: TooltipCustomDesign
}
