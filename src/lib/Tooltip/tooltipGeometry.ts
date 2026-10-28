import type { TooltipDefaults } from '../../shared/Tooltip/Types/tooltip.types.ts'
import type {
    TooltipGeometry,
    TooltipPoint,
    TooltipRect,
} from './Types/tooltip-geometry.types.ts'

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, Math.max(min, max)))
}

export function computeTooltipGeometry(
    anchor: TooltipRect,
    width: number,
    height: number,
    boundary: TooltipRect,
    options: TooltipDefaults,
    rtl = false,
): TooltipGeometry {
    const padding = options.collisionPadding ?? 0
    const edges =
        typeof padding === 'number'
            ? { top: padding, right: padding, bottom: padding, left: padding }
            : { top: 0, right: 0, bottom: 0, left: 0, ...padding }
    const clip = {
        top: boundary.top + edges.top,
        right: boundary.right - edges.right,
        bottom: boundary.bottom - edges.bottom,
        left: boundary.left + edges.left,
    }
    let side = options.side ?? 'top'
    const align = options.align ?? 'center'
    const arrowSize = options.showArrow === false ? 0 : 6
    const gap = (options.sideOffset ?? 8) + arrowSize
    const space = {
        top: anchor.top - clip.top,
        right: clip.right - anchor.right,
        bottom: clip.bottom - anchor.bottom,
        left: anchor.left - clip.left,
    }
    const opposite = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
    } as const
    const horizontal = side === 'top' || side === 'bottom'
    const length = horizontal ? height : width
    if (
        options.avoidCollisions !== false &&
        space[side] < length + gap &&
        space[opposite[side]] > space[side]
    )
        side = opposite[side]
    const verticalSide = side === 'top' || side === 'bottom'
    const effectiveAlign =
        verticalSide && rtl && align !== 'center'
            ? align === 'start'
                ? 'end'
                : 'start'
            : align
    const alignOffset = options.alignOffset ?? 0
    let x = verticalSide
        ? effectiveAlign === 'start'
            ? anchor.left + alignOffset
            : effectiveAlign === 'end'
              ? anchor.right - width - alignOffset
              : anchor.left + (anchor.width - width) / 2
        : side === 'left'
          ? anchor.left - width - gap
          : anchor.right + gap
    let y = !verticalSide
        ? align === 'start'
            ? anchor.top + alignOffset
            : align === 'end'
              ? anchor.bottom - height - alignOffset
              : anchor.top + (anchor.height - height) / 2
        : side === 'top'
          ? anchor.top - height - gap
          : anchor.bottom + gap
    if (options.avoidCollisions !== false) {
        if (verticalSide) {
            x = clamp(x, clip.left, clip.right - width)
            if (options.sticky !== 'always')
                x = clamp(
                    x,
                    anchor.left - width + arrowSize,
                    anchor.right - arrowSize,
                )
        } else {
            y = clamp(y, clip.top, clip.bottom - height)
            if (options.sticky !== 'always')
                y = clamp(
                    y,
                    anchor.top - height + arrowSize,
                    anchor.bottom - arrowSize,
                )
        }
    }
    const arrowPadding = options.arrowPadding ?? 0
    const desiredX = anchor.left + anchor.width / 2 - x
    const desiredY = anchor.top + anchor.height / 2 - y
    const arrowX = clamp(desiredX, 6 + arrowPadding, width - 6 - arrowPadding)
    const arrowY = clamp(desiredY, 6 + arrowPadding, height - 6 - arrowPadding)
    const arrowHidden =
        arrowSize > 0 &&
        Math.abs(verticalSide ? arrowX - desiredX : arrowY - desiredY) > 0.5
    return {
        x,
        y,
        side,
        align,
        arrowX,
        arrowY,
        arrowHidden,
        detached:
            anchor.bottom <= boundary.top ||
            anchor.top >= boundary.bottom ||
            anchor.right <= boundary.left ||
            anchor.left >= boundary.right,
        availableWidth: Math.max(
            0,
            verticalSide ? clip.right - clip.left : space[side] - gap,
        ),
        availableHeight: Math.max(
            0,
            verticalSide ? space[side] - gap : clip.bottom - clip.top,
        ),
        transformOrigin: verticalSide
            ? `${arrowX}px ${side === 'top' ? height + arrowSize : -arrowSize}px`
            : `${side === 'left' ? width + arrowSize : -arrowSize}px ${arrowY}px`,
        triggerWidth: anchor.width,
        triggerHeight: anchor.height,
    }
}

export function composedParent(node: Node): Element | null {
    if (node.parentElement) return node.parentElement
    const root = node.getRootNode()
    return root.nodeType === 11 && 'host' in root
        ? (root as ShadowRoot).host
        : null
}

export function isComposedAncestor(ancestor: EventTarget | null, node: Node) {
    let current: Node | null = node
    while (current) {
        if (current === ancestor) return true
        current = composedParent(current)
    }
    return false
}

export function tooltipBoundary(
    trigger: HTMLElement,
    options: TooltipDefaults,
): TooltipRect {
    const document = trigger.ownerDocument
    const view = document.defaultView!
    const viewport = view.visualViewport
    let left = viewport?.offsetLeft ?? 0
    let top = viewport?.offsetTop ?? 0
    let right = left + (viewport?.width ?? document.documentElement.clientWidth)
    let bottom =
        top + (viewport?.height ?? document.documentElement.clientHeight)
    const boundaries = Array.isArray(options.collisionBoundary)
        ? options.collisionBoundary
        : [options.collisionBoundary]
    for (const element of boundaries) {
        if (!element) continue
        const rect = element.getBoundingClientRect()
        left = Math.max(left, rect.left)
        top = Math.max(top, rect.top)
        right = Math.min(right, rect.right)
        bottom = Math.min(bottom, rect.bottom)
    }
    return {
        left,
        top,
        right,
        bottom,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
    }
}

export function fixedTooltipOrigin(positioner: HTMLElement) {
    const view = positioner.ownerDocument.defaultView!
    let parent = composedParent(positioner)
    while (parent) {
        const style = view.getComputedStyle(parent)
        if (
            style.transform !== 'none' ||
            [style.translate, style.scale, style.rotate].some(
                (value) => Boolean(value) && value !== 'none',
            ) ||
            style.perspective !== 'none' ||
            style.filter !== 'none' ||
            (Boolean(style.backdropFilter) &&
                style.backdropFilter !== 'none') ||
            style.contentVisibility === 'auto' ||
            /paint|layout|strict|content/.test(style.contain) ||
            /transform|translate|scale|rotate|perspective|filter/.test(
                style.willChange,
            )
        ) {
            const rect = parent.getBoundingClientRect()
            const element = parent as HTMLElement
            const scaleX = element.offsetWidth
                ? rect.width / element.offsetWidth
                : 1
            const scaleY = element.offsetHeight
                ? rect.height / element.offsetHeight
                : 1
            return {
                x:
                    rect.left +
                    element.clientLeft * scaleX -
                    element.scrollLeft * scaleX,
                y:
                    rect.top +
                    element.clientTop * scaleY -
                    element.scrollTop * scaleY,
                scaleX: scaleX || 1,
                scaleY: scaleY || 1,
            }
        }
        parent = composedParent(parent)
    }
    return { x: 0, y: 0, scaleX: 1, scaleY: 1 }
}

export function relativeTooltipRect(
    rect: TooltipRect,
    origin: ReturnType<typeof fixedTooltipOrigin>,
): TooltipRect {
    const left = (rect.left - origin.x) / origin.scaleX
    const top = (rect.top - origin.y) / origin.scaleY
    const width = rect.width / origin.scaleX
    const height = rect.height / origin.scaleY
    return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
    }
}

export function tooltipReferenceHidden(trigger: HTMLElement) {
    const rect = trigger.getBoundingClientRect()
    const boundary = tooltipBoundary(trigger, {})
    let parent = composedParent(trigger)
    while (parent) {
        const style =
            trigger.ownerDocument.defaultView!.getComputedStyle(parent)
        const clip = parent.getBoundingClientRect()
        if (/auto|scroll|hidden|clip/.test(style.overflowX)) {
            boundary.left = Math.max(boundary.left, clip.left)
            boundary.right = Math.min(boundary.right, clip.right)
        }
        if (/auto|scroll|hidden|clip/.test(style.overflowY)) {
            boundary.top = Math.max(boundary.top, clip.top)
            boundary.bottom = Math.min(boundary.bottom, clip.bottom)
        }
        parent = composedParent(parent)
    }
    return (
        rect.right <= boundary.left ||
        rect.left >= boundary.right ||
        rect.bottom <= boundary.top ||
        rect.top >= boundary.bottom
    )
}

function cross(origin: TooltipPoint, a: TooltipPoint, b: TooltipPoint) {
    return (
        (a.x - origin.x) * (b.y - origin.y) -
        (a.y - origin.y) * (b.x - origin.x)
    )
}

export function hoverHull(
    point: TooltipPoint,
    target: TooltipRect,
): TooltipPoint[] {
    const points = [
        { x: point.x - 5, y: point.y - 5 },
        { x: point.x + 5, y: point.y - 5 },
        { x: point.x - 5, y: point.y + 5 },
        { x: point.x + 5, y: point.y + 5 },
        { x: target.left, y: target.top },
        { x: target.right, y: target.top },
        { x: target.left, y: target.bottom },
        { x: target.right, y: target.bottom },
        // This array is created here; keep the ES2022 consumer target supported.
        // oxlint-disable-next-line unicorn/no-array-sort
    ].sort((a, b) => a.x - b.x || a.y - b.y)
    const lower: TooltipPoint[] = []
    const upper: TooltipPoint[] = []
    for (const p of points) {
        while (lower.length >= 2 && cross(lower.at(-2)!, lower.at(-1)!, p) <= 0)
            lower.pop()
        lower.push(p)
    }
    for (let index = points.length - 1; index >= 0; index--) {
        const p = points[index]
        while (upper.length >= 2 && cross(upper.at(-2)!, upper.at(-1)!, p) <= 0)
            upper.pop()
        upper.push(p)
    }
    return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

export function insideHoverHull(point: TooltipPoint, hull: TooltipPoint[]) {
    return hull.every(
        (p, index) => cross(p, hull[(index + 1) % hull.length], point) >= 0,
    )
}
