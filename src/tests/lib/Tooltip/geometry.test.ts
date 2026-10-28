import { describe, expect, test } from 'bun:test'
import {
    computeTooltipGeometry,
    hoverHull,
    insideHoverHull,
} from '../../../lib/Tooltip/tooltipGeometry.ts'
import {
    createTooltipTiming,
    activateTooltip,
    isActiveTooltip,
} from '../../../lib/Tooltip/tooltipCoordination.ts'

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

const boundary = rect(0, 0, 800, 600)
const anchor = rect(300, 200, 60, 40)

describe('native tooltip geometry', () => {
    test.each([
        ['top', 280, 146],
        ['bottom', 280, 254],
        ['left', 186, 200],
        ['right', 374, 200],
    ] as const)(
        'places %s with the arrow outside the requested gap',
        (side, x, y) => {
            const result = computeTooltipGeometry(anchor, 100, 40, boundary, {
                side,
            })
            expect(result.x).toBe(x)
            expect(result.y).toBe(y)
            expect(result.side).toBe(side)
            expect(result.arrowHidden).toBe(false)
        },
    )

    test('flips only when the opposite side offers more room and retains explicit noncolliding placement', () => {
        const edge = rect(300, 0, 60, 40)
        expect(computeTooltipGeometry(edge, 100, 40, boundary, {}).side).toBe(
            'bottom',
        )
        const fixed = computeTooltipGeometry(edge, 100, 40, boundary, {
            avoidCollisions: false,
        })
        expect(fixed.side).toBe('top')
        expect(fixed.y).toBe(-54)
    })

    test('applies offsets, per-side collision padding, and RTL alignment', () => {
        const result = computeTooltipGeometry(
            rect(2, 200, 40, 30),
            120,
            40,
            boundary,
            {
                side: 'bottom',
                align: 'start',
                alignOffset: 5,
                collisionPadding: { left: 12 },
                sticky: 'always',
                showArrow: false,
            },
        )
        expect(result.x).toBe(12)
        expect(result.y).toBe(238)
        const rtl = computeTooltipGeometry(
            anchor,
            100,
            40,
            boundary,
            { align: 'start', alignOffset: 5 },
            true,
        )
        expect(rtl.x).toBe(255)
    })

    test('partial stickiness preserves anchor overlap while always allows full collision shifting', () => {
        const outside = rect(-100, 200, 20, 30)
        const partial = computeTooltipGeometry(outside, 100, 40, boundary, {})
        const always = computeTooltipGeometry(outside, 100, 40, boundary, {
            sticky: 'always',
        })
        expect(partial.x).toBeLessThan(0)
        expect(always.x).toBe(0)
        expect(always.detached).toBe(true)
        expect(always.arrowHidden).toBe(true)
    })

    test('alignment offsets inset start/end edges and do not alter centered placement', () => {
        expect(
            computeTooltipGeometry(anchor, 100, 40, boundary, {
                align: 'end',
                alignOffset: 5,
            }).x,
        ).toBe(255)
        expect(
            computeTooltipGeometry(anchor, 100, 40, boundary, {
                side: 'right',
                align: 'end',
                alignOffset: 5,
            }).y,
        ).toBe(195)
        expect(
            computeTooltipGeometry(anchor, 100, 40, boundary, {
                align: 'center',
                alignOffset: 5,
            }).x,
        ).toBe(280)
    })

    test('clamps arrow padding without pretending a shifted arrow still points to the trigger', () => {
        const result = computeTooltipGeometry(
            rect(0, 200, 8, 30),
            120,
            40,
            boundary,
            { arrowPadding: 12, sticky: 'always' },
        )
        expect(result.arrowX).toBe(18)
        expect(result.arrowHidden).toBe(true)
        expect(result.availableWidth).toBe(800)
    })

    test('keeps a diagonal pointer route to hoverable content but rejects movement away', () => {
        const hull = hoverHull({ x: 100, y: 100 }, rect(90, 120, 100, 50))
        expect(insideHoverHull({ x: 120, y: 125 }, hull)).toBe(true)
        expect(insideHoverHull({ x: 105, y: 110 }, hull)).toBe(true)
        expect(insideHoverHull({ x: 220, y: 110 }, hull)).toBe(false)
        expect(insideHoverHull({ x: 30, y: 30 }, hull)).toBe(false)
    })
})

test('document coordination replaces only the active tooltip and cleanup cannot dismiss a newer one', () => {
    const document = {} as Document
    let firstCloses = 0
    let secondCloses = 0
    const stopFirst = activateTooltip(document, 'first', () => firstCloses++)
    const stopSecond = activateTooltip(document, 'second', () => secondCloses++)
    expect(firstCloses).toBe(1)
    stopFirst()
    activateTooltip(document, 'third', () => undefined)()
    expect(secondCloses).toBe(1)
    stopSecond()
})

test('provider timing starts cold, stays warm while open, and expires its shared skip window', () => {
    const timing = createTooltipTiming()
    expect(timing.isWarm()).toBe(false)
    timing.opened('first')
    expect(timing.isWarm()).toBe(true)
    timing.closed('first', -1)
    expect(timing.isWarm()).toBe(false)
    timing.opened('second')
    timing.closed('second', 300)
    expect(timing.isWarm()).toBe(true)
})

test('active Escape ownership follows the newest tooltip even when an older controlled owner refuses closing', () => {
    const document = {} as Document
    let closeRequests = 0
    const stopOlder = activateTooltip(document, 'older', () => closeRequests++)
    const stopNewer = activateTooltip(document, 'newer', () => undefined)
    expect(closeRequests).toBe(1)
    expect(isActiveTooltip(document, 'newer')).toBe(true)
    expect(isActiveTooltip(document, 'older')).toBe(false)
    stopNewer()
    expect(isActiveTooltip(document, 'older')).toBe(true)
    stopOlder()
    expect(isActiveTooltip(document, 'older')).toBe(false)
})
