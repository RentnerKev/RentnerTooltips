import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const fixtureURL = `/@fs/${fileURLToPath(new URL('../../../../playground/src/Components/TooltipOptimizationFixture.tsx', import.meta.url)).replaceAll('\\', '/')}`
const probeURL = `/@fs/${fileURLToPath(new URL('../../../../playground/src/Components/tooltipOperationProbe.ts', import.meta.url)).replaceAll('\\', '/')}`

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
})

test('equal provider values do not fan out to 500 stable consumers, while real and falsy overrides do', async ({
    page,
}) => {
    const result = await page.evaluate(async (url) => {
        const fixture = await import(url)
        fixture.mountFixture('provider')
        fixture.resetRenders()
        for (let tick = 1; tick <= 200; tick++) fixture.updateFixture({ tick })
        const unrelated = fixture.readRenders()
        fixture.updateFixture({
            provider: {
                sideOffset: 0,
                showArrow: false,
                portalContainer: null,
                portalZIndex: 0,
                portalClassName: '',
            },
        })
        const changed = fixture.readRenders()
        fixture.resetRenders()
        fixture.updateFixture({
            provider: {
                sideOffset: 0,
                showArrow: false,
                portalContainer: null,
                portalZIndex: 0,
                portalClassName: '',
            },
        })
        const equivalent = fixture.readRenders()
        fixture.updateFixture({ provider: { sideOffset: 12, showArrow: true } })
        const restored = fixture.readRenders()
        fixture.updateFixture({
            provider: {
                collisionPadding: Object.defineProperty({}, 'top', {
                    value: 20,
                }),
            },
        })
        fixture.resetRenders()
        fixture.updateFixture({ provider: { collisionPadding: {} } })
        const ignoredPadding = fixture.readRenders()
        fixture.unmountFixture()
        return { unrelated, changed, equivalent, restored, ignoredPadding }
    }, fixtureURL)
    expect(result.unrelated).toBe(0)
    expect(result.changed).toBeGreaterThanOrEqual(500)
    expect(result.equivalent).toBe(0)
    expect(result.restored).toBeGreaterThanOrEqual(500)
    expect(result.ignoredPadding).toBe(0)
})

test('one measurement per resize shares the trigger rect and skips 20 nonclipping ancestor rects', async ({
    page,
}) => {
    const result = await page.evaluate(
        async ({ fixtureURL: fixturePath, probeURL: probePath }) => {
            const fixture = await import(fixturePath)
            const helpers = await import(probePath)
            const probe = helpers.observeTooltipOperations()
            fixture.mountFixture('geometry')
            await helpers.settleTooltipOperations()
            probe.reset()
            window.dispatchEvent(new Event('resize'))
            await helpers.settleTooltipOperations()
            const visible = probe.read()
            fixture.updateFixture({ clipping: true })
            await helpers.settleTooltipOperations()
            probe.reset()
            window.dispatchEvent(new Event('resize'))
            await helpers.settleTooltipOperations()
            const clipping = probe.read()
            fixture.unmountFixture()
            const cleanup = probe.read()
            probe.restore()
            return { visible, clipping, cleanup }
        },
        { fixtureURL, probeURL },
    )
    expect(result.visible.triggerReads).toBe(1)
    expect(result.visible.ancestorReads).toBe(0)
    expect(result.clipping.triggerReads).toBe(1)
    expect(result.clipping.ancestorReads).toBe(2)
    expect(result.cleanup.activeResize).toBe(0)
    expect(result.cleanup.activeIntersection).toBe(0)
})

test('equal inline options retain observers, real options measure before paint and dynamic nodes rebind with cleanup', async ({
    page,
}) => {
    const result = await page.evaluate(
        async ({ fixtureURL: fixturePath, probeURL: probePath }) => {
            const fixture = await import(fixturePath)
            const helpers = await import(probePath)
            const probe = helpers.observeTooltipOperations()
            fixture.mountFixture('geometry')
            await helpers.settleTooltipOperations()
            const initial = fixture.readPosition()
            probe.reset()
            for (let tick = 1; tick <= 200; tick++)
                fixture.updateFixture({ tick })
            const equal = probe.read()
            const unchanged = fixture.readPosition()
            fixture.updateFixture({ offset: 0 })
            const synchronous = fixture.readPosition()
            const actual = probe.read()
            fixture.updateFixture({ padding: 160 })
            const padding = fixture.readPosition()
            fixture.updateFixture({ bounded: false })
            const boundary = fixture.readPosition()
            const configured = probe.read()
            fixture.updateFixture({ alternate: true })
            await helpers.settleTooltipOperations()
            const triggerSwap = probe.read()
            const triggerTag = document.querySelector(
                '[data-measured-trigger]',
            )!.tagName
            probe.reset()
            fixture.updateFixture({ customPortal: true })
            await helpers.settleTooltipOperations()
            const portalSwap = probe.read()
            const inPortal = Boolean(
                document.querySelector(
                    '[data-testid="operation-portal"] [data-tooltip-content]',
                ),
            )
            fixture.unmountFixture()
            const cleanup = probe.read()
            probe.restore()
            return {
                initial,
                equal,
                unchanged,
                synchronous,
                actual,
                padding,
                boundary,
                configured,
                triggerSwap,
                triggerTag,
                portalSwap,
                inPortal,
                cleanup,
            }
        },
        { fixtureURL, probeURL },
    )
    expect(result.equal.triggerReads).toBe(0)
    expect(result.equal.resizeCreates).toBe(0)
    expect(result.equal.resizeDisconnects).toBe(0)
    expect(result.equal.intersectionCreates).toBe(0)
    expect(result.equal.intersectionDisconnects).toBe(0)
    expect(result.unchanged).toEqual(result.initial)
    expect(Number.parseFloat(result.synchronous.top)).toBe(
        Number.parseFloat(result.initial.top) - 8,
    )
    expect(result.actual.triggerReads).toBe(1)
    expect(result.actual.resizeCreates).toBe(0)
    expect(Number.parseFloat(result.padding.left)).toBe(260)
    expect(Number.parseFloat(result.boundary.left)).toBe(200)
    expect(result.configured.resizeCreates).toBe(0)
    expect(result.configured.resizeDisconnects).toBe(0)
    expect(result.triggerTag).toBe('A')
    expect(result.triggerSwap.resizeCreates).toBeGreaterThan(0)
    expect(result.triggerSwap.resizeDisconnects).toBeGreaterThan(0)
    expect(result.portalSwap.resizeCreates).toBeGreaterThan(0)
    expect(result.portalSwap.resizeDisconnects).toBeGreaterThan(0)
    expect(result.inPortal).toBe(true)
    expect(result.portalSwap.activeResize).toBe(1)
    expect(result.portalSwap.activeIntersection).toBe(1)
    expect(result.cleanup.activeResize).toBe(0)
    expect(result.cleanup.activeIntersection).toBe(0)
})
