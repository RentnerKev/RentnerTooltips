import { useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { TooltipDefaults } from '../Types/tooltip.types.ts'
import type { TooltipPosition } from '../../../lib/Tooltip/Types/tooltip-geometry.types.ts'
import { createTooltipMeasurements } from '../../../lib/Tooltip/tooltipMeasurements.ts'
import { sameTooltipPosition } from '../../../lib/Tooltip/tooltipPositionEquality.ts'
import {
    sameTooltipDefaults,
    snapshotTooltipDefaults,
    liveTooltipCollisionDefaults,
} from '../../../lib/Tooltip/tooltipDefaults.ts'
import {
    composedParent,
    computeTooltipGeometry,
    fixedTooltipOrigin,
    tooltipBoundary,
    relativeTooltipRect,
    tooltipReferenceHidden,
} from '../../../lib/Tooltip/tooltipGeometry.ts'

export function useTooltipPosition(
    isOpen: boolean,
    triggerNode: HTMLElement | null,
    contentRef: RefObject<HTMLDivElement | null>,
    positionerRef: RefObject<HTMLDivElement | null>,
    defaults: TooltipDefaults,
    portalDocument: Document | null,
) {
    const [position, setPosition] = useState<TooltipPosition | null>(null)
    const liveOptions = useRef<TooltipDefaults | null>(null)
    const comparedOptions = useRef<TooltipDefaults | null>(null)
    const updatePosition = useRef<(() => void) | null>(null)
    const {
        side,
        sideOffset,
        align,
        alignOffset,
        avoidCollisions,
        arrowPadding,
        sticky,
        hideWhenDetached,
        showArrow,
        portalContainer,
    } = defaults
    useLayoutEffect(() => {
        if (!isOpen) return
        const next = liveTooltipCollisionDefaults(
            {
                side,
                sideOffset,
                align,
                alignOffset,
                avoidCollisions,
                collisionBoundary: defaults.collisionBoundary,
                collisionPadding: defaults.collisionPadding,
                arrowPadding,
                sticky,
                hideWhenDetached,
                showArrow,
            },
            () => defaults,
        )
        liveOptions.current = next
        if (
            comparedOptions.current &&
            sameTooltipDefaults(comparedOptions.current, next)
        )
            return
        comparedOptions.current = snapshotTooltipDefaults(next)
        // Option changes affect geometry before paint, without replacing the
        // observers/listeners that still belong to the same DOM nodes.
        updatePosition.current?.()
    })
    useLayoutEffect(() => {
        if (
            !isOpen ||
            !portalDocument ||
            !(portalContainer ?? portalDocument.body)
        )
            return
        const trigger = triggerNode
        const content = contentRef.current
        const positioner = positionerRef.current
        const view = trigger?.ownerDocument.defaultView
        if (!trigger || !content || !positioner || !view) return
        let frame = 0
        let moveObserver: IntersectionObserver | undefined
        let observedAnchor:
            | { left: number; top: number; width: number; height: number }
            | undefined
        function update() {
            const options = liveOptions.current
            if (!options) return
            comparedOptions.current = snapshotTooltipDefaults(options)
            const measurements = createTooltipMeasurements()
            const anchorRect = measurements.rect(trigger!)
            const origin = fixedTooltipOrigin(positioner!, measurements)
            const boundary = relativeTooltipRect(
                tooltipBoundary(trigger!, options, measurements),
                origin,
            )
            const geometry = computeTooltipGeometry(
                relativeTooltipRect(anchorRect, origin),
                content!.offsetWidth,
                content!.offsetHeight,
                boundary,
                options,
                measurements.style(trigger!).direction === 'rtl',
            )
            const next: TooltipPosition = {
                ...geometry,
                separateDescription:
                    trigger!.getRootNode() !== positioner!.getRootNode(),
                style: {
                    position: 'fixed' as const,
                    left: geometry.x,
                    top: geometry.y,
                    width: 'max-content',
                    maxWidth:
                        options.avoidCollisions === false
                            ? undefined
                            : Math.max(
                                  1,
                                  Math.min(
                                      boundary.width,
                                      geometry.availableWidth,
                                  ),
                              ),
                    visibility:
                        options.hideWhenDetached &&
                        (geometry.detached ||
                            tooltipReferenceHidden(
                                trigger!,
                                anchorRect,
                                measurements,
                            ))
                            ? ('hidden' as const)
                            : undefined,
                },
            }
            setPosition((previous) =>
                previous && sameTooltipPosition(previous, next)
                    ? previous
                    : next,
            )
            if (
                view!.IntersectionObserver &&
                (!observedAnchor ||
                    observedAnchor.left !== anchorRect.left ||
                    observedAnchor.top !== anchorRect.top ||
                    observedAnchor.width !== anchorRect.width ||
                    observedAnchor.height !== anchorRect.height)
            ) {
                moveObserver?.disconnect()
                observedAnchor = {
                    left: anchorRect.left,
                    top: anchorRect.top,
                    width: anchorRect.width,
                    height: anchorRect.height,
                }
                if (anchorRect.width > 0 && anchorRect.height > 0) {
                    const root = trigger!.ownerDocument.documentElement
                    // Observe layout shifts without a permanent RAF measurement loop.
                    const margins = [
                        -Math.floor(anchorRect.top),
                        -Math.floor(root.clientWidth - anchorRect.right),
                        -Math.floor(root.clientHeight - anchorRect.bottom),
                        -Math.floor(anchorRect.left),
                    ]
                    moveObserver = new view!.IntersectionObserver(
                        (entries) => {
                            if (entries[0]?.intersectionRatio !== 1) schedule()
                        },
                        {
                            rootMargin: margins
                                .map((value) => `${value}px`)
                                .join(' '),
                            threshold: 1,
                        },
                    )
                    moveObserver.observe(trigger!)
                }
            }
        }
        function schedule() {
            view!.cancelAnimationFrame(frame)
            frame = view!.requestAnimationFrame(update)
        }
        updatePosition.current = update
        update()
        const observer = new view.ResizeObserver(schedule)
        observer.observe(content)
        const roots = new Set<Node>()
        let element: Element | null = trigger
        while (element) {
            roots.add(element.getRootNode())
            observer.observe(element)
            element = composedParent(element)
        }
        roots.add(positioner.getRootNode())
        for (const root of roots)
            root.addEventListener('scroll', schedule, true)
        view.addEventListener('resize', schedule)
        view.visualViewport?.addEventListener('resize', schedule)
        view.visualViewport?.addEventListener('scroll', schedule)
        return () => {
            if (updatePosition.current === update) updatePosition.current = null
            view.cancelAnimationFrame(frame)
            observer.disconnect()
            moveObserver?.disconnect()
            for (const root of roots)
                root.removeEventListener('scroll', schedule, true)
            view.removeEventListener('resize', schedule)
            view.visualViewport?.removeEventListener('resize', schedule)
            view.visualViewport?.removeEventListener('scroll', schedule)
        }
    }, [
        isOpen,
        portalDocument,
        triggerNode,
        contentRef,
        positionerRef,
        portalContainer,
    ])
    return position
}
