import type {
    ComponentPropsWithoutRef,
    CSSProperties,
    KeyboardEventHandler,
    MouseEventHandler,
    ReactElement,
    RefCallback,
} from 'react'

export interface DisabledTriggerChildProps {
    'aria-description'?: string
    'aria-describedby'?: string
    'aria-label'?: string
    'aria-labelledby'?: string
    contentEditable?: boolean
    disabled?: boolean
    draggable?: boolean
    id?: string
    onClick?: MouseEventHandler
    onKeyDown?: KeyboardEventHandler
    onKeyUp?: KeyboardEventHandler
    style?: CSSProperties
    tabIndex?: number
    type?: string
}

export interface DisabledTooltipTriggerProps extends Omit<
    ComponentPropsWithoutRef<'span'>,
    'children'
> {
    children: ReactElement
}

export interface DisabledTooltipTriggerLogicResult {
    state: {
        disabledChild: ReactElement<DisabledTriggerChildProps>
        wrapperClassName: string
        ariaDescription?: string
        ariaDescribedBy?: string
        ariaLabel?: string
        labelledBy?: string
        isButton: boolean
    }
    handler: {
        handlePreventChildActivation: (event: {
            preventDefault(): void
            stopPropagation(): void
        }) => void
    }
    refs: { setWrapperRef: RefCallback<HTMLSpanElement> }
}
