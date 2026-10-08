import {
    cloneElement,
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import type { ForwardedRef, ReactElement } from 'react'
import {
    getRootElementById,
    releaseNativeLabelId,
    retainNativeLabelId,
    subscribeNativeLabels,
} from '../../../lib/Tooltip/nativeLabelObserver.ts'
import type {
    DisabledTriggerChildProps,
    DisabledTooltipTriggerProps,
    DisabledTooltipTriggerLogicResult,
} from '../Types/disabled-tooltip-trigger.types.ts'

const nativeDisableableElements = new Set([
    'button',
    'input',
    'select',
    'textarea',
])

function preventChildActivation(event: {
    preventDefault(): void
    stopPropagation(): void
}) {
    event.preventDefault()
    event.stopPropagation()
}

export function useDisabledTooltipTriggerLogic(
    { children, className, ...triggerProps }: DisabledTooltipTriggerProps,
    forwardedRef: ForwardedRef<HTMLSpanElement>,
): DisabledTooltipTriggerLogicResult {
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

    return {
        state: {
            disabledChild: cloneElement(disabledChild, {
                disabled: true,
                contentEditable: false,
                draggable: false,
                onClick: preventChildActivation,
                onKeyDown: preventChildActivation,
                onKeyUp: preventChildActivation,
                style: { ...disabledChild.props.style, pointerEvents: 'none' },
                tabIndex: -1,
            }),
            wrapperClassName,
            ariaDescription,
            ariaDescribedBy,
            ariaLabel,
            labelledBy,
            isButton,
        },
        refs: { setWrapperRef },
    }
}
