import { describe, expect, test } from 'bun:test'
import type { TooltipDefaults } from '../../../shared/Tooltip/Types/tooltip.types.ts'
import type {
    TooltipPosition,
    TooltipRect,
} from '../../../lib/Tooltip/Types/tooltip-geometry.types.ts'
import {
    sameTooltipDefaults,
    snapshotTooltipDefaults,
    mergeTooltipDefaults,
} from '../../../lib/Tooltip/tooltipDefaults.ts'
import { sameTooltipPosition } from '../../../lib/Tooltip/tooltipPositionEquality.ts'
import { createTooltipMeasurements } from '../../../lib/Tooltip/tooltipMeasurements.ts'
import { computeTooltipGeometry } from '../../../lib/Tooltip/tooltipGeometry.ts'

describe('value-stable tooltip configuration', () => {
    test('merges live collision containers with own-enumerable, defined override semantics', () => {
        const inherited = {
            collisionPadding: { left: 8 },
            collisionBoundary: [] as Element[],
        }
        const merged = mergeTooltipDefaults(inherited, {
            collisionPadding: undefined,
        })
        expect(merged.collisionPadding).toBe(inherited.collisionPadding)
        const replacement = { left: 160 }
        inherited.collisionPadding = replacement
        expect(merged.collisionPadding).toBe(replacement)
        const local = Object.defineProperty({}, 'collisionPadding', {
            value: { left: 200 },
        })
        expect(mergeTooltipDefaults(inherited, local).collisionPadding).toBe(
            replacement,
        )
        expect(Object.keys(mergeTooltipDefaults({}, local))).toEqual([])
        expect(
            mergeTooltipDefaults(inherited, { collisionPadding: 0 })
                .collisionPadding,
        ).toBe(0)
    })
    test('owns input containers, preserves falsy overrides and detects later mutations', () => {
        const first = {} as Element
        const second = {} as Element
        const boundary = [first, null]
        const padding = { top: 0, right: 8 }
        const value: TooltipDefaults = {
            sideOffset: 0,
            showArrow: false,
            portalContainer: null,
            portalZIndex: 0,
            portalClassName: '',
            collisionBoundary: boundary,
            collisionPadding: padding,
        }
        const snapshot = snapshotTooltipDefaults(value)
        expect(snapshot).toEqual(value)
        expect(snapshot.collisionBoundary).not.toBe(boundary)
        expect(snapshot.collisionPadding).not.toBe(padding)
        expect(
            sameTooltipDefaults(snapshot, {
                ...value,
                collisionBoundary: [first, null],
                collisionPadding: { right: 8, top: 0 },
            }),
        ).toBe(true)
        boundary.push(second)
        expect(sameTooltipDefaults(snapshot, value)).toBe(false)
        boundary.pop()
        padding.top = 12
        expect(sameTooltipDefaults(snapshot, value)).toBe(false)
        expect(snapshot.collisionPadding).toEqual({ top: 0, right: 8 })
    })

    test('compares every supported property and does not erase false, zero or null', () => {
        const baseline: TooltipDefaults = {
            side: 'top',
            sideOffset: 8,
            align: 'start',
            alignOffset: 0,
            avoidCollisions: true,
            collisionBoundary: null,
            collisionPadding: 8,
            arrowPadding: 0,
            sticky: 'partial',
            hideWhenDetached: false,
            portalContainer: null,
            portalClassName: '',
            portalZIndex: 0,
            size: 'sm',
            showArrow: false,
        }
        const changes: Required<TooltipDefaults> = {
            side: 'bottom',
            sideOffset: 0,
            align: 'end',
            alignOffset: 2,
            avoidCollisions: false,
            collisionBoundary: [{} as Element],
            collisionPadding: 0,
            arrowPadding: 4,
            sticky: 'always',
            hideWhenDetached: true,
            portalContainer: {} as Element,
            portalClassName: 'custom',
            portalZIndex: 1,
            size: 'lg',
            showArrow: true,
        }
        for (const [key, value] of Object.entries(changes))
            expect(
                sameTooltipDefaults(baseline, { ...baseline, [key]: value }),
            ).toBe(false)
        expect(
            sameTooltipDefaults(
                { collisionPadding: {} },
                { collisionPadding: { top: 0 } },
            ),
        ).toBe(true)
        expect(
            sameTooltipDefaults(
                { collisionPadding: {} },
                { collisionPadding: { top: undefined } },
            ),
        ).toBe(false)
        expect(sameTooltipDefaults({}, { portalContainer: null })).toBe(false)
    })

    test('reads frozen provider values without mutating their configuration', () => {
        const padding = Object.freeze({ top: 0, right: 8 })
        const boundary = [{} as Element, null]
        Object.freeze(boundary)
        const value = Object.freeze({
            collisionBoundary: boundary,
            collisionPadding: padding,
            sideOffset: 0,
        })
        expect(sameTooltipDefaults(snapshotTooltipDefaults(value), value)).toBe(
            true,
        )
        expect(boundary).toHaveLength(2)
        expect(padding).toEqual({ top: 0, right: 8 })
    })

    test('ignores nonenumerable padding edges just as geometry object spread does', () => {
        const padding = Object.defineProperty({}, 'top', { value: 20 })
        const value = { collisionPadding: padding }
        const snapshot = snapshotTooltipDefaults(value)
        expect(snapshot.collisionPadding).toEqual({})
        expect(sameTooltipDefaults(snapshot, value)).toBe(true)
        expect(
            sameTooltipDefaults(value, { collisionPadding: { top: 0 } }),
        ).toBe(true)
    })
})

function position(): TooltipPosition {
    const anchor = {
        left: 100,
        top: 100,
        right: 140,
        bottom: 130,
        width: 40,
        height: 30,
    }
    const boundary = {
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
    }
    const geometry = computeTooltipGeometry(anchor, 80, 24, boundary, {})
    return {
        ...geometry,
        separateDescription: false,
        style: {
            position: 'fixed',
            left: geometry.x,
            top: geometry.y,
            width: 'max-content',
            maxWidth: 800,
            visibility: undefined,
        },
    }
}

test('position equality covers every geometry/DOM/style output without serialization', () => {
    const baseline = position()
    expect(sameTooltipPosition(baseline, structuredClone(baseline))).toBe(true)
    for (const field of Object.keys(baseline)) {
        if (field === 'style') continue
        const changed = structuredClone(baseline) as unknown as Record<
            string,
            unknown
        >
        const old = changed[field]
        changed[field] =
            typeof old === 'number'
                ? old + 1
                : typeof old === 'boolean'
                  ? !old
                  : `${old}-changed`
        expect(
            sameTooltipPosition(
                baseline,
                changed as unknown as TooltipPosition,
            ),
        ).toBe(false)
    }
    for (const field of Object.keys(baseline.style)) {
        const changed = structuredClone(baseline)
        const style = changed.style as unknown as Record<string, unknown>
        const old = style[field]
        style[field] = typeof old === 'number' ? old + 1 : `${old}-changed`
        expect(sameTooltipPosition(baseline, changed)).toBe(false)
    }
})

test('position equality retains the old numeric and optional-field bailout semantics', () => {
    for (const [left, right] of [
        [0, -0],
        [NaN, NaN],
        [Infinity, -Infinity],
        [NaN, Infinity],
        [1, 2],
    ]) {
        const before = position()
        const after = position()
        before.x = before.style.left = left
        after.x = after.style.left = right
        expect(sameTooltipPosition(before, after)).toBe(
            JSON.stringify(before) === JSON.stringify(after),
        )
    }
})

test('measurements deduplicate reads only inside one synchronous update', () => {
    let rectReads = 0
    let styleReads = 0
    let rect: TooltipRect = {
        left: 0,
        top: 0,
        right: 40,
        bottom: 30,
        width: 40,
        height: 30,
    }
    let style = { direction: 'ltr' } as CSSStyleDeclaration
    const element = {
        getBoundingClientRect: () => {
            rectReads++
            return rect
        },
        ownerDocument: {
            defaultView: {
                getComputedStyle: () => {
                    styleReads++
                    return style
                },
            },
        },
    } as unknown as Element
    const first = createTooltipMeasurements()
    expect(first.rect(element)).toBe(first.rect(element))
    expect(first.style(element)).toBe(first.style(element))
    expect(rectReads).toBe(1)
    expect(styleReads).toBe(1)
    rect = { ...rect, left: 20, right: 60 }
    style = { direction: 'rtl' } as CSSStyleDeclaration
    const next = createTooltipMeasurements()
    expect(next.rect(element).left).toBe(20)
    expect(next.style(element).direction).toBe('rtl')
    expect(rectReads).toBe(2)
    expect(styleReads).toBe(2)
})
