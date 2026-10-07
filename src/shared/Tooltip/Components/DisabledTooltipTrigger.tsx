import { cloneElement, forwardRef } from 'react'
import type { DisabledTooltipTriggerProps } from '../Types/disabled-tooltip-trigger.types.js'
import { useDisabledTooltipTriggerLogic } from '../Hooks/useDisabledTooltipTriggerLogic.js'

export const DisabledTooltipTrigger = forwardRef<
    HTMLSpanElement,
    DisabledTooltipTriggerProps
>(function DisabledTooltipTrigger(
    { children, className, ...triggerProps },
    forwardedRef,
) {
    const {
        state,
        handler,
        refs: { setWrapperRef },
    } = useDisabledTooltipTriggerLogic(
        { children, className, ...triggerProps },
        forwardedRef,
    )
    return (
        <span
            {...triggerProps}
            ref={setWrapperRef}
            role={state.isButton ? 'button' : 'group'}
            tabIndex={0}
            aria-disabled="true"
            aria-description={state.ariaDescription}
            aria-describedby={state.ariaDescribedBy}
            aria-label={state.ariaLabel}
            aria-labelledby={state.labelledBy}
            data-tooltip-disabled-trigger=""
            className={state.wrapperClassName}
        >
            {cloneElement(state.disabledChild, {
                disabled: true,
                contentEditable: false,
                draggable: false,
                onClick: handler.handlePreventChildActivation,
                onKeyDown: handler.handlePreventChildActivation,
                onKeyUp: handler.handlePreventChildActivation,
                style: {
                    ...state.disabledChild.props.style,
                    pointerEvents: 'none',
                },
                tabIndex: -1,
            })}
        </span>
    )
})
