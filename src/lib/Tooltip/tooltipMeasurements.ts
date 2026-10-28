import type {
    TooltipMeasurements,
    TooltipRect,
} from './Types/tooltip-geometry.types.ts'

// A fresh instance belongs to one synchronous update; no DOM values survive
// into another frame, option update, resize, or scroll event.
export function createTooltipMeasurements(): TooltipMeasurements {
    const rectangles = new Map<Element, TooltipRect>()
    const styles = new Map<Element, CSSStyleDeclaration>()
    return {
        rect(element) {
            let rect = rectangles.get(element)
            if (!rect) {
                rect = element.getBoundingClientRect()
                rectangles.set(element, rect)
            }
            return rect
        },
        style(element) {
            let style = styles.get(element)
            if (!style) {
                style =
                    element.ownerDocument.defaultView!.getComputedStyle(element)
                styles.set(element, style)
            }
            return style
        },
    }
}
