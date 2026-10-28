import { useLayoutEffect, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { TooltipDefaults } from '../Types/tooltip.types.ts'
import type { TooltipGeometry } from '../../../lib/Tooltip/Types/tooltip-geometry.types.ts'
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
    const [position, setPosition] = useState<
        | (TooltipGeometry & {
              style: CSSProperties
              separateDescription: boolean
          })
        | null
    >(null)
    const {
        side,
        sideOffset,
        align,
        alignOffset,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        arrowPadding,
        sticky,
        hideWhenDetached,
        showArrow,
        portalContainer,
    } = defaults
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
            const origin = fixedTooltipOrigin(positioner!)
            const anchorRect = trigger!.getBoundingClientRect()
            const options = {
                side,
                sideOffset,
                align,
                alignOffset,
                avoidCollisions,
                collisionBoundary,
                collisionPadding,
                arrowPadding,
                sticky,
                hideWhenDetached,
                showArrow,
            }
            const boundary = relativeTooltipRect(
                tooltipBoundary(trigger!, options),
                origin,
            )
            const geometry = computeTooltipGeometry(
                relativeTooltipRect(anchorRect, origin),
                content!.offsetWidth,
                content!.offsetHeight,
                boundary,
                options,
                view!.getComputedStyle(trigger!).direction === 'rtl',
            )
            const next = {
                ...geometry,
                separateDescription:
                    trigger!.getRootNode() !== positioner!.getRootNode(),
                style: {
                    position: 'fixed' as const,
                    left: geometry.x,
                    top: geometry.y,
                    width: 'max-content',
                    maxWidth:
                        avoidCollisions === false
                            ? undefined
                            : Math.max(
                                  1,
                                  Math.min(
                                      boundary.width,
                                      geometry.availableWidth,
                                  ),
                              ),
                    visibility:
                        hideWhenDetached &&
                        (geometry.detached || tooltipReferenceHidden(trigger!))
                            ? ('hidden' as const)
                            : undefined,
                },
            }
            setPosition((previous) =>
                previous && JSON.stringify(previous) === JSON.stringify(next)
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
        update()
        const observer = new view.ResizeObserver(schedule)
        observer.observe(trigger)
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
        side,
        sideOffset,
        align,
        alignOffset,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        arrowPadding,
        sticky,
        hideWhenDetached,
        showArrow,
        portalContainer,
    ])
    return position
}
