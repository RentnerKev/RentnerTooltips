import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useContext } from 'react'
import { DisabledTooltipTrigger } from './DisabledTooltipTrigger.js'
import {
    TooltipProvider,
    TooltipProviderDepthContext,
} from './TooltipProvider.js'
import { defaultTooltipDesign } from './types.js'
import type { TooltipProps } from './types.js'

export function CustomTooltip({
    children,
    content,
    disabled = false,
    disabledTrigger = false,
    disabledTriggerClassName,
    open,
    defaultOpen,
    onOpenChange,
    delayDuration,
    disableHoverableContent,
    side = 'top',
    sideOffset = 8,
    align,
    alignOffset,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    arrowPadding,
    sticky,
    hideWhenDetached,
    portalContainer,
    customDesign,
}: TooltipProps) {
    const providerDepth = useContext(TooltipProviderDepthContext)
    const design = { ...defaultTooltipDesign, ...customDesign }

    if (disabled) return children

    const trigger = disabledTrigger ? (
        <DisabledTooltipTrigger className={disabledTriggerClassName}>
            {children}
        </DisabledTooltipTrigger>
    ) : (
        children
    )

    const tooltip = (
        <TooltipPrimitive.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            delayDuration={delayDuration}
            disableHoverableContent={disableHoverableContent}
        >
            <TooltipPrimitive.Trigger asChild>
                {trigger}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal container={portalContainer}>
                <TooltipPrimitive.Content
                    side={side}
                    sideOffset={sideOffset}
                    align={align}
                    alignOffset={alignOffset}
                    avoidCollisions={avoidCollisions}
                    collisionBoundary={collisionBoundary}
                    collisionPadding={collisionPadding}
                    arrowPadding={arrowPadding}
                    sticky={sticky}
                    hideWhenDetached={hideWhenDetached}
                    className={`z-[9999] ${design.baseClasses} ${design.animationClasses} ${design.contentClasses}`}
                >
                    {content}
                    <TooltipPrimitive.Arrow
                        width={12}
                        height={6}
                        className={design.arrowClasses}
                    />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    )

    return providerDepth > 0 ? (
        tooltip
    ) : (
        <TooltipProvider>{tooltip}</TooltipProvider>
    )
}

export { TooltipProvider }
export type { TooltipProviderProps } from './types.js'
