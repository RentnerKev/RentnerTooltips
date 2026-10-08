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

export interface TooltipProviderProps {
    children: ReactNode
    customDesign?: TooltipCustomDesign
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
