import { cloneElement, useMemo } from 'react'
import { composeTooltipRefs } from '../../../lib/Tooltip/composeTooltipRefs.ts'
import type { ReactElement } from 'react'
import type { TooltipTriggerElement } from '../Types/tooltip-behavior.types.ts'
import type { CustomTooltipLogicResult } from '../Types/custom-tooltip-logic.types.ts'

function composeHandler<E extends { defaultPrevented: boolean }>(
    child: ((event: E) => void) | undefined,
    own: (event: E) => void,
) {
    return (event: E) => {
        child?.(event)
        if (!event.defaultPrevented) own(event)
    }
}

export function useTooltipTrigger(
    element: ReactElement,
    { state, handler, refs }: CustomTooltipLogicResult,
) {
    const child = element as TooltipTriggerElement
    const childRef = child.props.ref
    const triggerRef = refs.setTriggerRef
    const setTriggerRef = useMemo(
        () => composeTooltipRefs(triggerRef, childRef),
        [childRef, triggerRef],
    )
    return cloneElement(child, {
        ref: setTriggerRef,
        'aria-describedby':
            [
                child.props['aria-describedby'],
                state.isOpen ? state.id : undefined,
            ]
                .filter(Boolean)
                .join(' ') || undefined,
        'data-state': state.dataState,
        onFocus: composeHandler(child.props.onFocus, handler.handleFocus),
        onBlur: composeHandler(child.props.onBlur, handler.close),
        onPointerMove: composeHandler(
            child.props.onPointerMove,
            handler.handlePointerMove,
        ),
        onPointerLeave: composeHandler(
            child.props.onPointerLeave,
            handler.handlePointerLeave,
        ),
        onPointerDown: composeHandler(
            child.props.onPointerDown,
            handler.handlePointerDown,
        ),
        onClick: composeHandler(child.props.onClick, handler.close),
    })
}
