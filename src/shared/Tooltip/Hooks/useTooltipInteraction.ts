import {
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import type { FocusEvent, PointerEvent } from 'react'
import {
    TooltipBehaviorContext,
    TooltipHoverableContentContext,
} from '../TooltipContext.ts'
import type { TooltipInteractionOptions } from '../Types/tooltip-behavior.types.ts'
import type { TooltipPoint } from '../../../lib/Tooltip/Types/tooltip-geometry.types.ts'
import {
    activateTooltip,
    createTooltipTiming,
    isActiveTooltip,
} from '../../../lib/Tooltip/tooltipCoordination.ts'
import {
    hoverHull,
    insideHoverHull,
    isComposedAncestor,
} from '../../../lib/Tooltip/tooltipGeometry.ts'

export function useTooltipInteraction(options: TooltipInteractionOptions) {
    const inherited = useContext(TooltipBehaviorContext)
    const inheritedHover = useContext(TooltipHoverableContentContext)
    const [fallback] = useState(
        () =>
            inherited ?? {
                delayDuration: 200,
                skipDelayDuration: 300,
                timing: createTooltipTiming(),
            },
    )
    const behavior = inherited ?? fallback
    const id = useId()
    const triggerRef = useRef<HTMLElement | null>(null)
    const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null)
    const setTriggerRef = useCallback((node: HTMLElement | null) => {
        triggerRef.current = node
        setTriggerNode(node)
    }, [])
    const contentRef = useRef<HTMLDivElement | null>(null)
    const positionerRef = useRef<HTMLDivElement | null>(null)
    const portalDocument = triggerNode?.ownerDocument ?? null
    const [internalOpen, setInternalOpen] = useState(
        options.defaultOpen ?? false,
    )
    const [delayed, setDelayed] = useState(false)
    if (options.disabled && internalOpen !== (options.defaultOpen ?? false))
        setInternalOpen(options.defaultOpen ?? false)
    const isOpen = !options.disabled && (options.open ?? internalOpen)
    const current = useRef(options)
    const requested = useRef(isOpen)
    const timer = useRef<{ view: Window; id: number } | null>(null)
    const settlement = useRef<{
        view: Window
        frame: number
        onScroll: (event: Event) => void
    } | null>(null)
    const grace = useRef<TooltipPoint[] | null>(null)
    const pointerHeld = useRef(false)
    const pointerAttempted = useRef(false)
    const pointerDocument = useRef<Document | null>(null)

    useLayoutEffect(() => {
        current.current = options
        requested.current = isOpen
    })

    const clearTimer = useCallback(() => {
        if (timer.current) timer.current.view.clearTimeout(timer.current.id)
        timer.current = null
    }, [])
    const cancelSettlement = useCallback(() => {
        if (settlement.current) {
            settlement.current.view.cancelAnimationFrame(
                settlement.current.frame,
            )
            settlement.current.view.removeEventListener(
                'scroll',
                settlement.current.onScroll,
                true,
            )
        }
        settlement.current = null
    }, [])
    const requestOpen = useCallback((next: boolean, fromDelay = false) => {
        if (current.current.disabled) return
        if (next === requested.current) return
        requested.current = next
        if (next) setDelayed(fromDelay)
        if (current.current.open === undefined) setInternalOpen(next)
        current.current.onOpenChange?.(next)
    }, [])
    const clearGrace = useCallback(() => {
        grace.current = null
        behavior.timing.endTransit(id)
    }, [behavior, id])
    const close = useCallback(() => {
        clearTimer()
        cancelSettlement()
        clearGrace()
        requestOpen(false)
    }, [clearTimer, cancelSettlement, clearGrace, requestOpen])
    useLayoutEffect(() => {
        if (isOpen) return
        clearTimer()
        cancelSettlement()
        clearGrace()
    }, [isOpen, clearTimer, cancelSettlement, clearGrace])
    const releasePointer = useCallback(function releasePointer() {
        pointerHeld.current = false
        pointerDocument.current?.removeEventListener(
            'pointerup',
            releasePointer,
        )
        pointerDocument.current?.removeEventListener(
            'pointercancel',
            releasePointer,
        )
        pointerDocument.current = null
    }, [])

    useLayoutEffect(() => {
        pointerAttempted.current = false
        return () => {
            if (!triggerNode) return
            clearTimer()
            cancelSettlement()
            releasePointer()
            clearGrace()
        }
    }, [triggerNode, clearTimer, cancelSettlement, releasePointer, clearGrace])

    useEffect(
        () => () => {
            clearTimer()
            cancelSettlement()
            releasePointer()
            clearGrace()
        },
        [clearTimer, cancelSettlement, releasePointer, clearGrace],
    )
    useEffect(() => {
        if (!options.disabled) return
        clearTimer()
        cancelSettlement()
        clearGrace()
    }, [options.disabled, clearTimer, cancelSettlement, clearGrace])

    useLayoutEffect(() => {
        if (!isOpen) return
        const document = portalDocument
        if (!document) return
        behavior.timing.opened(id)
        const deactivate = activateTooltip(document, id, close)
        return () => {
            behavior.timing.closed(id, behavior.skipDelayDuration)
            deactivate()
        }
    }, [isOpen, behavior, id, close, portalDocument])

    useEffect(() => {
        if (!isOpen) return
        const trigger = triggerNode
        const document = portalDocument
        const view = document?.defaultView
        if (!trigger || !document || !view) return
        function handleEscape(event: KeyboardEvent) {
            if (
                event.key === 'Escape' &&
                !event.defaultPrevented &&
                isActiveTooltip(document!, id)
            ) {
                event.preventDefault()
                close()
            }
        }
        function handleOutside(event: globalThis.PointerEvent) {
            const path = event.composedPath()
            if (
                !path.includes(trigger!) &&
                (!contentRef.current || !path.includes(contentRef.current))
            )
                close()
        }
        function handleMove(event: globalThis.PointerEvent) {
            if (!grace.current || event.pointerType === 'touch') return
            const path = event.composedPath()
            if (
                path.includes(trigger!) ||
                (contentRef.current && path.includes(contentRef.current))
            ) {
                clearGrace()
            } else if (
                !insideHoverHull(
                    { x: event.clientX, y: event.clientY },
                    grace.current,
                )
            )
                close()
        }
        function handleScroll(event: Event) {
            if (settlement.current) return
            const target = event.composedPath()[0] ?? event.target
            if (
                target === view ||
                target === document ||
                isComposedAncestor(target, trigger!)
            )
                close()
        }
        document.addEventListener('keydown', handleEscape)
        document.addEventListener('pointerdown', handleOutside)
        document.addEventListener('pointermove', handleMove)
        view.addEventListener('scroll', handleScroll, true)
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.removeEventListener('pointerdown', handleOutside)
            document.removeEventListener('pointermove', handleMove)
            view.removeEventListener('scroll', handleScroll, true)
        }
    }, [isOpen, close, triggerNode, id, portalDocument, clearGrace])

    function handlePointerMove(event: PointerEvent<HTMLElement>) {
        if (
            event.pointerType === 'touch' ||
            pointerHeld.current ||
            pointerAttempted.current ||
            behavior.timing.isInTransit() ||
            timer.current ||
            requested.current
        )
            return
        const view = event.currentTarget.ownerDocument.defaultView
        if (!view) return
        pointerAttempted.current = true
        clearGrace()
        const warm = behavior.skipDelayDuration > 0 && behavior.timing.isWarm()
        const delay = warm
            ? 0
            : (options.delayDuration ?? behavior.delayDuration)
        if (delay <= 0) requestOpen(true)
        else
            timer.current = {
                view,
                id: view.setTimeout(() => {
                    timer.current = null
                    requestOpen(true, true)
                }, delay),
            }
    }
    function handleFocus(event: FocusEvent<HTMLElement>) {
        if (pointerHeld.current) return
        clearTimer()
        cancelSettlement()
        const view = event.currentTarget.ownerDocument.defaultView
        if (view) {
            // Focus scrolling can arrive after the opening render. Give it two
            // quiet frames; deliberate scrolls afterwards retain normal dismissal.
            const trigger = event.currentTarget
            const pending = {
                view,
                frame: 0,
                onScroll(scrollEvent: Event) {
                    if (
                        isComposedAncestor(
                            scrollEvent.composedPath()[0] ?? scrollEvent.target,
                            trigger,
                        )
                    )
                        schedule()
                },
            }
            const schedule = () => {
                pending.view.cancelAnimationFrame(pending.frame)
                pending.frame = pending.view.requestAnimationFrame(() => {
                    pending.frame = pending.view.requestAnimationFrame(() => {
                        if (settlement.current === pending) cancelSettlement()
                    })
                })
            }
            settlement.current = pending
            view.addEventListener('scroll', pending.onScroll, true)
            schedule()
        }
        requestOpen(true)
    }
    function handlePointerDown(event: PointerEvent<HTMLElement>) {
        close()
        releasePointer()
        pointerAttempted.current = true
        pointerHeld.current = true
        pointerDocument.current = event.currentTarget.ownerDocument
        pointerDocument.current.addEventListener('pointerup', releasePointer)
        pointerDocument.current.addEventListener(
            'pointercancel',
            releasePointer,
        )
    }
    function handlePointerLeave(event: PointerEvent<HTMLElement>) {
        pointerAttempted.current = false
        clearTimer()
        if (event.pointerType === 'touch') return
        const target =
            event.currentTarget === triggerRef.current
                ? contentRef.current
                : triggerRef.current
        if (
            (options.disableHoverableContent ?? inheritedHover) ||
            !target ||
            !requested.current
        )
            close()
        else {
            grace.current = hoverHull(
                { x: event.clientX, y: event.clientY },
                target.getBoundingClientRect(),
            )
            behavior.timing.beginTransit(id)
        }
    }
    function handleContentEnter() {
        clearGrace()
    }
    return {
        state: {
            triggerNode,
            id,
            isOpen,
            portalDocument,
            dataState: isOpen
                ? delayed
                    ? 'delayed-open'
                    : 'instant-open'
                : 'closed',
        },
        refs: { triggerRef, setTriggerRef, contentRef, positionerRef },
        handler: {
            handleFocus,
            handlePointerMove,
            handlePointerDown,
            handlePointerLeave,
            handleContentEnter,
            close,
        },
    }
}
