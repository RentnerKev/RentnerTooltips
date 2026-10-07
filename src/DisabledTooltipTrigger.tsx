import {
    cloneElement,
    forwardRef,
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import type {
    ComponentPropsWithoutRef,
    CSSProperties,
    KeyboardEventHandler,
    MouseEventHandler,
    ReactElement,
} from 'react'

import {
    releaseNativeLabelId,
    retainNativeLabelId,
    subscribeNativeLabels,
} from './nativeLabelObserver.js'

interface DisabledTriggerChildProps {
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

interface DisabledTooltipTriggerProps extends Omit<
    ComponentPropsWithoutRef<'span'>,
    'children'
> {
    children: ReactElement
}

const nativeDisableableElements = new Set([
    'button',
    'input',
    'select',
    'textarea',
])

function getRootElementById(root: Node | undefined, id: string) {
    if (!root) return null
    const rootWithIdLookup = root as Node & {
        getElementById?: (elementId: string) => Element | null
    }
    return rootWithIdLookup.getElementById?.(id) ?? null
}

function preventChildActivation(event: {
    preventDefault(): void
    stopPropagation(): void
}) {
    event.preventDefault()
    event.stopPropagation()
}

export const DisabledTooltipTrigger = forwardRef<
    HTMLSpanElement,
    DisabledTooltipTriggerProps
>(function DisabledTooltipTrigger(
    { children, className, ...triggerProps },
    forwardedRef,
) {
    const disabledChild = children as ReactElement<DisabledTriggerChildProps>
    const wrapperRef = useRef<HTMLSpanElement | null>(null)
    const labelPrefix = useId()
    const nextLabelId = useRef(0)
    const [nativeLabelIds, setNativeLabelIds] = useState<string>()
    const controlId = disabledChild.props.id
    const controlType = disabledChild.type
    const hasExplicitLabel = Boolean(
        disabledChild.props['aria-label'] ||
        disabledChild.props['aria-labelledby'] ||
        triggerProps['aria-label'] ||
        triggerProps['aria-labelledby'],
    )
    const setWrapperRef = useCallback(
        (element: HTMLSpanElement | null) => {
            wrapperRef.current = element
            if (typeof forwardedRef === 'function') forwardedRef(element)
            else if (forwardedRef) forwardedRef.current = element
        },
        [forwardedRef],
    )
    useLayoutEffect(() => {
        if (hasExplicitLabel) return
        const owner = {}
        let currentLabels: HTMLLabelElement[] = []
        let observedRoot: Node | null = null
        let unsubscribe: (() => void) | undefined

        function syncLabels() {
            const wrapper = wrapperRef.current
            const root = wrapper?.getRootNode()
            if (wrapper && root && root !== observedRoot) {
                unsubscribe?.()
                unsubscribe = subscribeNativeLabels(wrapper, syncLabels)
                observedRoot = root
            }
            const child = wrapper?.firstElementChild
            const control =
                child &&
                typeof controlType === 'string' &&
                child.localName === controlType
                    ? (child as
                          | HTMLButtonElement
                          | HTMLInputElement
                          | HTMLSelectElement
                          | HTMLTextAreaElement)
                    : null
            const labels = Array.from(control?.labels ?? [])
            for (const label of currentLabels) {
                if (!labels.includes(label)) releaseNativeLabelId(label, owner)
            }
            const ids = labels.map((label) =>
                retainNativeLabelId(label, owner, () => {
                    let assignedId = `${labelPrefix}-native-label-${nextLabelId.current++}`
                    while (getRootElementById(root, assignedId)) {
                        assignedId = `${labelPrefix}-native-label-${nextLabelId.current++}`
                    }
                    return assignedId
                }),
            )
            currentLabels = labels
            const nextIds = ids.join(' ') || undefined
            setNativeLabelIds((previousIds) =>
                previousIds === nextIds ? previousIds : nextIds,
            )
        }
        syncLabels()
        return () => {
            unsubscribe?.()
            for (const label of currentLabels)
                releaseNativeLabelId(label, owner)
        }
        // React id changes must refresh the proxy name before paint as well.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlId, controlType, hasExplicitLabel, labelPrefix])
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
    const labelledBy =
        ariaLabelledBy ?? (ariaLabel ? undefined : nativeLabelIds)
    const isButton =
        disabledChild.type === 'button' ||
        (disabledChild.type === 'input' &&
            ['button', 'submit', 'reset', 'image'].includes(
                disabledChild.props.type ?? 'text',
            ))
    const hasNativeDisabledState =
        typeof disabledChild.type === 'string' &&
        nativeDisableableElements.has(disabledChild.type)

    if (!hasNativeDisabledState) {
        throw new TypeError(
            'disabledTrigger requires a native button, input, select, or textarea child.',
        )
    }

    return (
        <span
            {...triggerProps}
            ref={setWrapperRef}
            role={isButton ? 'button' : 'group'}
            tabIndex={0}
            aria-disabled="true"
            aria-description={ariaDescription}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            data-tooltip-disabled-trigger=""
            className={wrapperClassName}
        >
            {cloneElement(disabledChild, {
                disabled: true,
                contentEditable: false,
                draggable: false,
                onClick: preventChildActivation,
                onKeyDown: preventChildActivation,
                onKeyUp: preventChildActivation,
                style: {
                    ...disabledChild.props.style,
                    pointerEvents: 'none',
                },
                tabIndex: -1,
            })}
        </span>
    )
})
