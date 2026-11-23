import type { TooltipDefaults } from '../../shared/Tooltip/Types/tooltip.types.ts'
import type {
    TooltipGeometry,
    TooltipPoint,
    TooltipRect,
} from './Types/tooltip-geometry.types.ts'

const OPPOSITE_SIDE = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
} as const

const CONTAIN_REGEX = /paint|layout|strict|content/
const WILL_CHANGE_REGEX = /transform|translate|scale|rotate|perspective|filter/
const OVERFLOW_CLIP_REGEX = /auto|scroll|hidden|clip/

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
    let padTop: number
    let padRight: number
    let padBottom: number
    let padLeft: number
    if (typeof padding === 'number') {
        padTop = padding
        padRight = padding
        padBottom = padding
        padLeft = padding
    } else {
        padTop = padding.top ?? 0
        padRight = padding.right ?? 0
        padBottom = padding.bottom ?? 0
        padLeft = padding.left ?? 0
    }
    const clipTop = boundary.top + padTop
    const clipRight = boundary.right - padRight
    const clipBottom = boundary.bottom - padBottom
    const clipLeft = boundary.left + padLeft
    let side = options.side ?? 'top'
    const align = options.align ?? 'center'
    const arrowSize = options.showArrow === false ? 0 : 6
    const gap = (options.sideOffset ?? 8) + arrowSize
    const spaceTop = anchor.top - clipTop
    const spaceRight = clipRight - anchor.right
    const spaceBottom = clipBottom - anchor.bottom
    const spaceLeft = anchor.left - clipLeft
    const horizontal = side === 'top' || side === 'bottom'
    const length = horizontal ? height : width
    const primarySpace =
        side === 'top'
            ? spaceTop
            : side === 'bottom'
              ? spaceBottom
              : side === 'left'
                ? spaceLeft
                : spaceRight
    const oppositeSpace =
        side === 'top'
            ? spaceBottom
            : side === 'bottom'
              ? spaceTop
              : side === 'left'
                ? spaceRight
                : spaceLeft
    let activeSpace = primarySpace
    if (
        options.avoidCollisions !== false &&
        primarySpace < length + gap &&
        oppositeSpace > primarySpace
    ) {
        side = OPPOSITE_SIDE[side]
        activeSpace = oppositeSpace
    }
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
            x = clamp(x, clipLeft, clipRight - width)
            if (options.sticky !== 'always')
                x = clamp(
                    x,
                    anchor.left - width + arrowSize,
                    anchor.right - arrowSize,
                )
        } else {
            y = clamp(y, clipTop, clipBottom - height)
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
            verticalSide ? clipRight - clipLeft : activeSpace - gap,
        ),
        availableHeight: Math.max(
            0,
            verticalSide ? activeSpace - gap : clipBottom - clipTop,
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
    const collisionBoundary = options.collisionBoundary
    if (collisionBoundary) {
        const count = Array.isArray(collisionBoundary)
            ? collisionBoundary.length
            : 1
        for (let index = 0; index < count; index++) {
            const element = Array.isArray(collisionBoundary)
                ? collisionBoundary[index]
                : collisionBoundary
            if (!element) continue
            const rect = element.getBoundingClientRect()
            left = Math.max(left, rect.left)
            top = Math.max(top, rect.top)
            right = Math.min(right, rect.right)
            bottom = Math.min(bottom, rect.bottom)
        }
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
            (Boolean(style.translate) && style.translate !== 'none') ||
            (Boolean(style.scale) && style.scale !== 'none') ||
            (Boolean(style.rotate) && style.rotate !== 'none') ||
            style.perspective !== 'none' ||
            style.filter !== 'none' ||
            (Boolean(style.backdropFilter) &&
                style.backdropFilter !== 'none') ||
            style.contentVisibility === 'auto' ||
            CONTAIN_REGEX.test(style.contain) ||
            WILL_CHANGE_REGEX.test(style.willChange)
        ) {
            const rect = parent.getBoundingClientRect()
            const element = parent as HTMLElement
            const elementWidth = element.offsetWidth
            const elementHeight = element.offsetHeight
            // Fixed popup children do not give an otherwise empty portal root
            // any dimensions. Measure the popup only when an axis needs recovery.
            const popupRect =
                !elementWidth || !elementHeight
                    ? positioner.getBoundingClientRect()
                    : null
            const scaleX = elementWidth
                ? rect.width / elementWidth
                : positioner.offsetWidth && popupRect
                  ? popupRect.width / positioner.offsetWidth
                  : 1
            const scaleY = elementHeight
                ? rect.height / elementHeight
                : positioner.offsetHeight && popupRect
                  ? popupRect.height / positioner.offsetHeight
                  : scaleX
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
    // CSS zoom scales fixed descendants even without a fixed containing block.
    const rect = positioner.getBoundingClientRect()
    const scaleX = positioner.offsetWidth
        ? rect.width / positioner.offsetWidth
        : 1
    const scaleY = positioner.offsetHeight
        ? rect.height / positioner.offsetHeight
        : scaleX
    return { x: 0, y: 0, scaleX: scaleX || 1, scaleY: scaleY || 1 }
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

export function tooltipReferenceHidden(
    trigger: HTMLElement,
    anchorRect?: TooltipRect,
) {
    const rect = anchorRect ?? trigger.getBoundingClientRect()
    const document = trigger.ownerDocument
    const view = document.defaultView!
    const viewport = view.visualViewport
    let left = viewport?.offsetLeft ?? 0
    let top = viewport?.offsetTop ?? 0
    let right = left + (viewport?.width ?? document.documentElement.clientWidth)
    let bottom =
        top + (viewport?.height ?? document.documentElement.clientHeight)
    if (
        rect.right <= left ||
        rect.left >= right ||
        rect.bottom <= top ||
        rect.top >= bottom
    )
        return true
    let parent = composedParent(trigger)
    while (parent) {
        const style = view.getComputedStyle(parent)
        const clipsX = OVERFLOW_CLIP_REGEX.test(style.overflowX)
        const clipsY = OVERFLOW_CLIP_REGEX.test(style.overflowY)
        if (clipsX || clipsY) {
            const clip = parent.getBoundingClientRect()
            if (clipsX) {
                left = Math.max(left, clip.left)
                right = Math.min(right, clip.right)
                if (rect.right <= left || rect.left >= right) return true
            }
            if (clipsY) {
                top = Math.max(top, clip.top)
                bottom = Math.min(bottom, clip.bottom)
                if (rect.bottom <= top || rect.top >= bottom) return true
            }
        }
        parent = composedParent(parent)
    }
    return false
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
    for (let index = 0; index < points.length; index++) {
        const p = points[index]!
        while (
            lower.length >= 2 &&
            cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0
        )
            lower.pop()
        lower.push(p)
    }
    const upper: TooltipPoint[] = []
    for (let index = points.length - 1; index >= 0; index--) {
        const p = points[index]!
        while (
            upper.length >= 2 &&
            cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0
        )
            upper.pop()
        upper.push(p)
    }
    lower.pop()
    upper.pop()
    for (let index = 0; index < upper.length; index++) lower.push(upper[index]!)
    return lower
}

export function insideHoverHull(point: TooltipPoint, hull: TooltipPoint[]) {
    const length = hull.length
    for (let index = 0; index < length; index++) {
        const next = index + 1 === length ? 0 : index + 1
        if (cross(hull[index]!, hull[next]!, point) < 0) return false
    }
    return true
}
