import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const fixtureURL = `/@fs/${fileURLToPath(new URL('../../../../playground/src/Components/TooltipLiveCollisionFixture.tsx', import.meta.url)).replaceAll('\\', '/')}`
const probeURL = `/@fs/${fileURLToPath(new URL('../../../../playground/src/Components/tooltipOperationProbe.ts', import.meta.url)).replaceAll('\\', '/')}`

for (const mode of ['direct', 'provider', 'nested'] as const) {
    test(`${mode}: caller-owned collision containers stay live between commits and after equivalent replacements`, async ({
        page,
    }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto('/')
        const result = await page.evaluate(
            async ({
                fixtureURL: fixturePath,
                probeURL: probePath,
                mode: fixtureMode,
            }) => {
                const fixture = await import(fixturePath)
                const helpers = await import(probePath)
                const probe = helpers.observeTooltipOperations()
                fixture.mountFixture(fixtureMode)
                await helpers.settleTooltipOperations()
                const initial = fixture.readState()
                probe.reset()
                fixture.replaceEqualContainers()
                const equal = probe.read()
                const replaced = fixture.readState()
                async function measure(event: 'resize' | 'scroll' = 'resize') {
                    ;(event === 'resize' ? window : document).dispatchEvent(
                        new Event(event),
                    )
                    await helpers.settleTooltipOperations()
                    return fixture.readState()
                }
                fixture.mutatePadding(160)
                const padded = await measure()
                fixture.mutatePadding(160, false)
                const nonenumerable = await measure('scroll')
                fixture.mutatePadding(160)
                const enumerable = await measure()
                fixture.mutateBoundary('replace')
                const replacedBoundary = await measure('scroll')
                fixture.mutatePadding(8)
                fixture.mutateBoundary('remove')
                const removed = await measure()
                fixture.mutateBoundary('push')
                const pushed = await measure('scroll')
                fixture.unmountFixture()
                const cleanup = probe.read()
                probe.restore()
                return {
                    initial,
                    equal,
                    replaced,
                    padded,
                    nonenumerable,
                    enumerable,
                    replacedBoundary,
                    removed,
                    pushed,
                    cleanup,
                }
            },
            { fixtureURL, probeURL, mode },
        )
        expect(result.initial.left).toBe(200)
        expect(result.replaced.left).toBe(200)
        expect(result.equal.triggerReads).toBe(0)
        expect(result.equal.resizeCreates).toBe(0)
        expect(result.equal.intersectionCreates).toBe(0)
        if (mode !== 'direct') {
            expect(result.initial.originals).toBe(true)
            expect(result.replaced.originals).toBe(true)
            expect(result.replaced.renders).toBe(result.initial.renders)
        }
        expect(result.padded.left).toBe(260)
        expect(result.nonenumerable.left).toBe(200)
        expect(result.enumerable.left).toBe(260)
        expect(result.replacedBoundary.left).toBe(460)
        expect(result.removed.left).toBe(200)
        expect(result.pushed.left).toBe(308)
        expect(result.cleanup.activeResize).toBe(0)
        expect(result.cleanup.activeIntersection).toBe(0)
    })
}
