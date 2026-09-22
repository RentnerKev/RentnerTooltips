import { cloneElement, forwardRef } from 'react'
import type {
    ComponentPropsWithoutRef,
    CSSProperties,
    ReactElement,
} from 'react'

interface DisabledTriggerChildProps {
    'aria-description'?: string
    'aria-describedby'?: string
    'aria-label'?: string
    'aria-labelledby'?: string
    style?: CSSProperties
}

interface DisabledTooltipTriggerProps extends Omit<
    ComponentPropsWithoutRef<'span'>,
    'children'
> {
    children: ReactElement
}

export const DisabledTooltipTrigger = forwardRef<
    HTMLSpanElement,
    DisabledTooltipTriggerProps
>(function DisabledTooltipTrigger(
    { children, className, ...triggerProps },
    forwardedRef,
) {
    const disabledChild = children as ReactElement<DisabledTriggerChildProps>
    const wrapperClassName = [
        'inline-flex rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className,
    ]
        .filter(Boolean)
        .join(' ')
    const ariaDescribedBy =
        [
            triggerProps['aria-describedby'],
            disabledChild.props['aria-describedby'],
        ]
            .filter(Boolean)
            .join(' ') || undefined
    const ariaLabelledBy =
        [
            triggerProps['aria-labelledby'],
            disabledChild.props['aria-labelledby'],
        ]
            .filter(Boolean)
            .join(' ') || undefined
    const ariaDescription =
        disabledChild.props['aria-description'] ??
        triggerProps['aria-description']
    const ariaLabel =
        disabledChild.props['aria-label'] ?? triggerProps['aria-label']

    return (
        <span
            {...triggerProps}
            ref={forwardedRef}
            tabIndex={0}
            aria-disabled="true"
            aria-description={ariaDescription}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            data-tooltip-disabled-trigger=""
            className={wrapperClassName}
        >
            {cloneElement(disabledChild, {
                style: {
                    ...disabledChild.props.style,
                    pointerEvents: 'none',
                },
            })}
        </span>
    )
})
