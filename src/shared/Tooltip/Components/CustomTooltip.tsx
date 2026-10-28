import { useContext } from 'react'
import { createPortal } from 'react-dom'
import { DisabledTooltipTrigger } from './DisabledTooltipTrigger.tsx'
import { TooltipProvider } from './TooltipProvider.tsx'
import { TooltipArrow } from './TooltipArrow.tsx'
import { TooltipProviderDepthContext } from '../TooltipContext.ts'
import type { TooltipProps } from '../Types/tooltip.types.ts'
import { useCustomTooltipLogic } from '../Hooks/useCustomTooltipLogic.ts'
import { useTooltipTrigger } from '../Hooks/useTooltipTrigger.ts'

function NativeTooltip({
    children,
    content,
    disabledTrigger = false,
    disabledTriggerClassName,
    ...props
}: TooltipProps) {
    const logic = useCustomTooltipLogic(props)
    const { state, handler, refs } = logic
    const { contentRef, positionerRef } = refs
    const trigger = useTooltipTrigger(
        disabledTrigger ? (
            <DisabledTooltipTrigger
                className={disabledTriggerClassName}
                visualClassName={state.classNames.disabledTrigger}
            >
                {children}
            </DisabledTooltipTrigger>
        ) : (
            children
        ),
        logic,
    )
    const portal = state.defaults.portalContainer ?? state.portalDocument?.body
    return (
        <>
            {trigger}
            {state.isOpen && state.position?.separateDescription && (
                <span id={state.id} hidden>
                    {content}
                </span>
            )}
            {state.isOpen &&
                state.portalDocument &&
                portal &&
                createPortal(
                    <div
                        ref={positionerRef}
                        data-tooltip-positioner=""
                        style={{
                            ...state.position?.style,
                            position: 'fixed',
                            visibility: state.position
                                ? state.position.style.visibility
                                : 'hidden',
                            zIndex:
                                state.defaults.portalZIndex ??
                                'var(--rentner-tooltip-z, 9999)',
                        }}
                    >
                        <div
                            ref={contentRef}
                            id={state.id}
                            role="tooltip"
                            data-tooltip-content=""
                            data-state={state.dataState}
                            data-side={
                                state.position?.side ??
                                state.defaults.side ??
                                'top'
                            }
                            data-align={
                                state.position?.align ??
                                state.defaults.align ??
                                'center'
                            }
                            onPointerLeave={handler.handlePointerLeave}
                            onPointerEnter={handler.handleContentEnter}
                            className={[
                                'z-[var(--rentner-tooltip-z,9999)]',
                                state.contentClassName,
                                state.animationClassName,
                                state.defaults.portalClassName,
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            style={state.contentStyle}
                        >
                            {content}
                            {state.defaults.showArrow !== false && (
                                <TooltipArrow
                                    position={state.position}
                                    className={state.arrowClassName}
                                />
                            )}
                        </div>
                    </div>,
                    portal,
                )}
        </>
    )
}

export function CustomTooltip(props: TooltipProps) {
    const providerDepth = useContext(TooltipProviderDepthContext)
    if (props.disabled) return props.children
    return providerDepth > 0 ? (
        <NativeTooltip {...props} />
    ) : (
        <TooltipProvider>
            <NativeTooltip {...props} />
        </TooltipProvider>
    )
}
