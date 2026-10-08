import { forwardRef } from 'react'
import type { DisabledTooltipTriggerProps } from '../Types/disabled-tooltip-trigger.types.ts'
import { useDisabledTooltipTriggerLogic } from '../Hooks/useDisabledTooltipTriggerLogic.ts'

export const DisabledTooltipTrigger = forwardRef<
    HTMLSpanElement,
    DisabledTooltipTriggerProps
>(function DisabledTooltipTrigger(
    { children, className, ...triggerProps },
    forwardedRef,
) {
    const {
        state,
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
            {state.disabledChild}
        </span>
    )
})
