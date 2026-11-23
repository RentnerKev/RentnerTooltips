import { expect, test } from 'bun:test'
import * as fc from 'fast-check'
import { computeTooltipGeometry } from '../../../lib/Tooltip/tooltipGeometry.ts'

function rect(left: number, top: number, width: number, height: number) {
    return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
    }
}

const placement = {
    side: fc.constantFrom('top', 'right', 'bottom', 'left'),
    align: fc.constantFrom('start', 'center', 'end'),
    showArrow: fc.boolean(),
}

test('produces finite coordinates for extreme sizes and offsets', () => {
    // Allow extreme finite inputs while leaving room for sums and differences.
    const limit = Number.MAX_VALUE / 16
    const offset = fc.double({ min: -limit, max: limit, noNaN: true })
    const size = fc.double({ min: 0, max: limit, noNaN: true })
    const rectangle = fc.tuple(offset, offset, size, size)
    const input = fc.record({
        anchor: rectangle,
        boundary: rectangle,
        width: size,
        height: size,
        options: fc.record({
            ...placement,
            sideOffset: offset,
            alignOffset: offset,
            arrowPadding: size,
            collisionPadding: fc.oneof(
                size,
                fc.record({
                    top: size,
                    right: size,
                    bottom: size,
                    left: size,
                }),
            ),
            avoidCollisions: fc.boolean(),
            sticky: fc.constantFrom('partial', 'always'),
        }),
        rtl: fc.boolean(),
    })

    fc.assert(
        fc.property(input, (sample) => {
            const result = computeTooltipGeometry(
                rect(...sample.anchor),
                sample.width,
                sample.height,
                rect(...sample.boundary),
                sample.options,
                sample.rtl,
            )

            expect(
                [
                    result.x,
                    result.y,
                    result.arrowX,
                    result.arrowY,
                    result.availableWidth,
                    result.availableHeight,
                ].every(Number.isFinite),
            ).toBe(true)
        }),
        { numRuns: 500 },
    )
})

test('keeps fitting tooltips inside the padded viewport with full collision shifting', () => {
    const coordinate = fc.integer({ min: -32_000, max: 32_000 })
    const viewportSize = fc.integer({ min: 32, max: 8192 })
    const padding = fc.nat(8)
    const progress = fc.nat(100)
    const input = fc.record({
        placement: fc.record(placement),
        viewport: fc.tuple(coordinate, coordinate, viewportSize, viewportSize),
        padding: fc.record({
            top: padding,
            right: padding,
            bottom: padding,
            left: padding,
        }),
        anchorWidth: fc.nat(96),
        anchorHeight: fc.nat(96),
        anchorProgress: progress,
        crossAxisOffset: coordinate,
        widthFraction: progress,
        heightFraction: progress,
        sideOffset: fc.nat(24),
        alignOffset: fc.integer({ min: -128, max: 128 }),
        rtl: fc.boolean(),
    })

    fc.assert(
        fc.property(input, (sample) => {
            const [left, top, viewportWidth, viewportHeight] = sample.viewport
            const viewport = rect(
                left / 4,
                top / 4,
                viewportWidth,
                viewportHeight,
            )
            const clipLeft = viewport.left + sample.padding.left
            const clipTop = viewport.top + sample.padding.top
            const clipRight = viewport.right - sample.padding.right
            const clipBottom = viewport.bottom - sample.padding.bottom
            const clipWidth = clipRight - clipLeft
            const clipHeight = clipBottom - clipTop
            const anchorWidth = Math.min(sample.anchorWidth, clipWidth)
            const anchorHeight = Math.min(sample.anchorHeight, clipHeight)
            const vertical =
                sample.placement.side === 'top' ||
                sample.placement.side === 'bottom'
            const fraction = sample.anchorProgress / 100
            const trigger = rect(
                clipLeft +
                    (vertical
                        ? sample.crossAxisOffset / 4
                        : Math.floor((clipWidth - anchorWidth) * fraction)),
                clipTop +
                    (vertical
                        ? Math.floor((clipHeight - anchorHeight) * fraction)
                        : sample.crossAxisOffset / 4),
                anchorWidth,
                anchorHeight,
            )
            const gap = sample.sideOffset + (sample.placement.showArrow ? 6 : 0)
            const maxWidth = vertical
                ? clipWidth
                : Math.max(trigger.left - clipLeft, clipRight - trigger.right) -
                  gap
            const maxHeight = vertical
                ? Math.max(trigger.top - clipTop, clipBottom - trigger.bottom) -
                  gap
                : clipHeight
            fc.pre(maxWidth >= 1 && maxHeight >= 1)

            const width = Math.max(
                1,
                Math.floor((maxWidth * sample.widthFraction) / 100),
            )
            const height = Math.max(
                1,
                Math.floor((maxHeight * sample.heightFraction) / 100),
            )
            const result = computeTooltipGeometry(
                trigger,
                width,
                height,
                viewport,
                {
                    ...sample.placement,
                    sideOffset: sample.sideOffset,
                    alignOffset: sample.alignOffset,
                    collisionPadding: sample.padding,
                    sticky: 'always',
                },
                sample.rtl,
            )

            expect(result.x).toBeGreaterThanOrEqual(clipLeft)
            expect(result.x + width).toBeLessThanOrEqual(clipRight)
            expect(result.y).toBeGreaterThanOrEqual(clipTop)
            expect(result.y + height).toBeLessThanOrEqual(clipBottom)
        }),
        { numRuns: 500 },
    )
})
