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

type TooltipPositionState = TooltipGeometry & {
    style: CSSProperties
    separateDescription: boolean
    contentMaxHeight: number
}

function isSameTooltipPosition(
    a: TooltipPositionState,
    b: TooltipPositionState,
): boolean {
    return (
        a.x === b.x &&
        a.y === b.y &&
        a.side === b.side &&
        a.align === b.align &&
        a.arrowX === b.arrowX &&
        a.arrowY === b.arrowY &&
        a.arrowHidden === b.arrowHidden &&
        a.detached === b.detached &&
        a.availableWidth === b.availableWidth &&
        a.availableHeight === b.availableHeight &&
        a.transformOrigin === b.transformOrigin &&
        a.triggerWidth === b.triggerWidth &&
        a.triggerHeight === b.triggerHeight &&
        a.contentMaxHeight === b.contentMaxHeight &&
        a.separateDescription === b.separateDescription &&
        a.style.maxWidth === b.style.maxWidth &&
        a.style.visibility === b.style.visibility
    )
}

export function useTooltipPosition(
    isOpen: boolean,
    triggerNode: HTMLElement | null,
    contentRef: RefObject<HTMLDivElement | null>,
    positionerRef: RefObject<HTMLDivElement | null>,
    defaults: TooltipDefaults,
    portalDocument: Document | null,
) {
    const [position, setPosition] = useState<TooltipPositionState | null>(null)
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
        const scheduled: {
            frame: number
            moveObserver?: IntersectionObserver
            observedAnchor?: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
        } = { frame: 0 }
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
            const contentStyle = view!.getComputedStyle(content!)
            const contentChrome =
                Number.parseFloat(contentStyle.paddingTop) +
                Number.parseFloat(contentStyle.paddingBottom) +
                Number.parseFloat(contentStyle.borderTopWidth) +
                Number.parseFloat(contentStyle.borderBottomWidth)
            const next = {
                ...geometry,
                contentMaxHeight: Math.max(
                    0,
                    geometry.availableHeight - contentChrome,
                ),
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
                        (geometry.detached ||
                            tooltipReferenceHidden(trigger!, anchorRect))
                            ? ('hidden' as const)
                            : undefined,
                },
            }
            setPosition((previous) =>
                previous && isSameTooltipPosition(previous, next)
                    ? previous
                    : next,
            )
            if (
                view!.IntersectionObserver &&
                (!scheduled.observedAnchor ||
                    scheduled.observedAnchor.left !== anchorRect.left ||
                    scheduled.observedAnchor.top !== anchorRect.top ||
                    scheduled.observedAnchor.width !== anchorRect.width ||
                    scheduled.observedAnchor.height !== anchorRect.height)
            ) {
                scheduled.moveObserver?.disconnect()
                scheduled.observedAnchor = {
                    left: anchorRect.left,
                    top: anchorRect.top,
                    width: anchorRect.width,
                    height: anchorRect.height,
                }
                if (anchorRect.width > 0 && anchorRect.height > 0) {
                    const root = trigger!.ownerDocument.documentElement
                    // Observe layout shifts without a permanent RAF measurement loop.
                    scheduled.moveObserver = new view!.IntersectionObserver(
                        (entries) => {
                            if (entries[0]?.intersectionRatio !== 1) schedule()
                        },
                        {
                            rootMargin: `${-Math.floor(anchorRect.top)}px ${-Math.floor(root.clientWidth - anchorRect.right)}px ${-Math.floor(root.clientHeight - anchorRect.bottom)}px ${-Math.floor(anchorRect.left)}px`,
                            threshold: 1,
                        },
                    )
                    scheduled.moveObserver.observe(trigger!)
                }
            }
        }
        function schedule() {
            view!.cancelAnimationFrame(scheduled.frame)
            scheduled.frame = view!.requestAnimationFrame(update)
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
            view.cancelAnimationFrame(scheduled.frame)
            observer.disconnect()
            scheduled.moveObserver?.disconnect()
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
