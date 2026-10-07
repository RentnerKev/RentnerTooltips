import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { DisabledTooltipTrigger } from './DisabledTooltipTrigger.js'
import { TooltipProvider } from './TooltipProvider.js'
import type { TooltipProps } from '../Types/tooltip.types.js'
import { useCustomTooltipLogic } from '../Hooks/useCustomTooltipLogic.js'

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
    const { state, handler } = useCustomTooltipLogic({
        children,
        content,
        disabled,
        open,
        defaultOpen,
        onOpenChange,
        disableHoverableContent,
        customDesign,
    })

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
            open={state.isOpen}
            onOpenChange={handler.handleOpenChange}
            delayDuration={delayDuration}
            disableHoverableContent={disableHoverableContent}
        >
            <TooltipPrimitive.Trigger
                asChild
                onFocus={handler.handleFocus}
                onBlur={handler.handleDismissal}
                onPointerDown={handler.handleDismissal}
                onClick={handler.handleDismissal}
                onPointerLeave={handler.handlePointerLeave}
            >
                {trigger}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal container={portalContainer}>
                <TooltipPrimitive.Content
                    onEscapeKeyDown={handler.handleDismissal}
                    onPointerDownOutside={handler.handleDismissal}
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
                    className={`z-[9999] ${state.design.baseClasses} ${state.design.animationClasses} ${state.design.contentClasses}`}
                >
                    {content}
                    <TooltipPrimitive.Arrow
                        width={12}
                        height={6}
                        className={state.design.arrowClasses}
                    />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    )

    return state.providerDepth > 0 ? (
        tooltip
    ) : (
        <TooltipProvider>{tooltip}</TooltipProvider>
    )
}
