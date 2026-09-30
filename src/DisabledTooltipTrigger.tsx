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
        if (hasExplicitLabel) {
            return
        }
        const assignedIds = new Map<HTMLLabelElement, string>()
        let currentControl:
            | HTMLButtonElement
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement
            | null = null
        let currentLabels: HTMLLabelElement[] = []
        let observedRoot: Node | null = null

        function getCurrentControl() {
            const control = wrapperRef.current?.firstElementChild as
                | HTMLButtonElement
                | HTMLInputElement
                | HTMLSelectElement
                | HTMLTextAreaElement
                | null
            if (
                !control ||
                typeof controlType !== 'string' ||
                control.localName !== controlType ||
                control.id !== (controlId ?? '')
            ) {
                return null
            }
            return control
        }

        function observeCurrentRoot(observer: MutationObserver) {
            const root = wrapperRef.current?.getRootNode()
            if (!root || root === observedRoot) return

            observer.disconnect()
            // Labels can live outside the wrapper; compare only this control's
            // live labels instead of rescanning the owning tree.
            observer.observe(root, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['id', 'for'],
            })
            observedRoot = root
        }

        function syncLabels() {
            const control = getCurrentControl()
            const labels = Array.from(control?.labels ?? [])
            for (const [label, assignedId] of assignedIds) {
                if (!labels.includes(label) || label.id !== assignedId) {
                    if (label.id === assignedId) label.removeAttribute('id')
                    assignedIds.delete(label)
                }
            }

            const ids = labels.map((label) => {
                if (!label.id) {
                    const root = control?.getRootNode()
                    let assignedId = `${labelPrefix}-native-label-${nextLabelId.current++}`
                    while (getRootElementById(root, assignedId)) {
                        assignedId = `${labelPrefix}-native-label-${nextLabelId.current++}`
                    }
                    label.id = assignedId
                    assignedIds.set(label, assignedId)
                }
                return label.id
            })
            currentControl = control
            currentLabels = labels
            const nextIds = ids.join(' ') || undefined
            setNativeLabelIds((previousIds) =>
                previousIds === nextIds ? previousIds : nextIds,
            )
        }

        const observer = new MutationObserver((records) => {
            observeCurrentRoot(observer)
            const control = getCurrentControl()
            const labels = Array.from(control?.labels ?? [])
            let shouldSync =
                control !== currentControl ||
                labels.length !== currentLabels.length ||
                labels.some((label, index) => label !== currentLabels[index])

            if (!shouldSync) {
                shouldSync = records.some((record) => {
                    if (
                        record.type !== 'attributes' ||
                        record.attributeName !== 'id'
                    ) {
                        return false
                    }

                    const label = record.target as HTMLLabelElement
                    return (
                        currentLabels.includes(label) &&
                        assignedIds.get(label) !== label.id
                    )
                })
            }

            if (shouldSync) syncLabels()
        })
        observeCurrentRoot(observer)
        syncLabels()

        return () => {
            observer.disconnect()
            for (const [label, assignedId] of assignedIds) {
                if (label.id === assignedId) label.removeAttribute('id')
            }
        }
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
