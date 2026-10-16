import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { DisabledTooltipTrigger } from './DisabledTooltipTrigger.tsx'
import { TooltipProvider } from './TooltipProvider.tsx'
import type { TooltipProps } from '../Types/tooltip.types.ts'
import { useCustomTooltipLogic } from '../Hooks/useCustomTooltipLogic.ts'

export function CustomTooltip({
    children,
    content,
    disabledTrigger = false,
    disabledTriggerClassName,
    delayDuration,
    ...props
}: TooltipProps) {
    const { state, handler } = useCustomTooltipLogic(props)
    if (props.disabled) return children
    const trigger = disabledTrigger ? (
        <DisabledTooltipTrigger
            className={disabledTriggerClassName}
            visualClassName={state.classNames.disabledTrigger}
        >
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
            disableHoverableContent={props.disableHoverableContent}
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
            <TooltipPrimitive.Portal container={state.defaults.portalContainer}>
                <TooltipPrimitive.Content
                    onEscapeKeyDown={handler.handleDismissal}
                    onPointerDownOutside={handler.handleDismissal}
                    side={state.defaults.side ?? 'top'}
                    sideOffset={state.defaults.sideOffset ?? 8}
                    align={state.defaults.align}
                    alignOffset={state.defaults.alignOffset}
                    avoidCollisions={state.defaults.avoidCollisions}
                    collisionBoundary={state.defaults.collisionBoundary}
                    collisionPadding={state.defaults.collisionPadding}
                    arrowPadding={state.defaults.arrowPadding}
                    sticky={state.defaults.sticky}
                    hideWhenDetached={state.defaults.hideWhenDetached}
                    className={[
                        'z-[var(--rentner-tooltip-z,9999)]',
                        state.contentClassName,
                        state.animationClassName,
                        state.defaults.portalClassName,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    style={
                        state.defaults.portalZIndex === undefined
                            ? undefined
                            : { zIndex: state.defaults.portalZIndex }
                    }
                >
                    {content}
                    {state.defaults.showArrow !== false && (
                        <TooltipPrimitive.Arrow
                            width={12}
                            height={6}
                            className={state.arrowClassName}
                        />
                    )}
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
