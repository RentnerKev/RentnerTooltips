import { cloneElement } from 'react'
import type { CSSProperties, ReactElement } from 'react'

interface DisabledTriggerChildProps {
    'aria-description'?: string
    'aria-describedby'?: string
    'aria-label'?: string
    'aria-labelledby'?: string
    style?: CSSProperties
}

interface DisabledTooltipTriggerProps {
    children: ReactElement
    className?: string
}

export function DisabledTooltipTrigger({
    children,
    className,
}: DisabledTooltipTriggerProps) {
    const disabledChild = children as ReactElement<DisabledTriggerChildProps>
    const wrapperClassName = ['inline-flex', className]
        .filter(Boolean)
        .join(' ')

    return (
        <span
            tabIndex={0}
            aria-disabled="true"
            aria-description={disabledChild.props['aria-description']}
            aria-describedby={disabledChild.props['aria-describedby']}
            aria-label={disabledChild.props['aria-label']}
            aria-labelledby={disabledChild.props['aria-labelledby']}
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
}
