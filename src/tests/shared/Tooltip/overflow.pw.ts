import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const fixtureURL = `/@fs/${fileURLToPath(new URL('../../../../playground/src/Components/NativeTooltipFixture.tsx', import.meta.url)).replaceAll('\\', '/')}`

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 320, height: 280 })
    await page.goto('/')
    await page.evaluate(async (url) => {
        ;(await import(url)).mountFixture(true)
    }, fixtureURL)
    await expect(page.getByTestId('long-token-trigger')).toBeAttached()
})

for (const kind of ['token', 'prose'] as const) {
    test(`contains long ${kind} in a narrow viewport and at increased CSS zoom without introducing focusable scrolling`, async ({ page }) => {
        const trigger = page.getByTestId(`long-${kind}-trigger`)
        await trigger.focus()
        const tooltip = page.getByRole('tooltip')
        await expect(tooltip).toBeVisible()
        const body = tooltip.locator('[data-tooltip-body]')
        const check = async () => {
            await expect.poll(async () => tooltip.evaluate((element) => {
                const bounds = element.getBoundingClientRect()
                return bounds.left >= 7 && bounds.top >= 7 && bounds.right <= innerWidth - 7 && bounds.bottom <= innerHeight - 7
            })).toBe(true)
            await expect(tooltip).toHaveCSS('overflow-wrap', 'anywhere')
            await expect(body).toHaveCSS('overflow', 'hidden')
            expect(await body.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
            await expect(trigger).toHaveAccessibleDescription((await body.textContent())!)
            await expect(trigger).toBeFocused()
            await expect(tooltip.locator('a, button, input, [tabindex]')).toHaveCount(0)
            await expect(tooltip).not.toHaveAttribute('tabindex')
            await expect(tooltip.locator('svg')).toHaveCount(1)
        }
        await check()
        await page.locator('body').evaluate((element) => { element.style.zoom = '1.5' })
        await check()
        await page.keyboard.press('Escape')
        await expect(tooltip).toHaveCount(0)
        await expect(trigger).toBeFocused()
    })
}

test('preserves replacement content classes and the avoidCollisions=false sizing escape hatch', async ({ page }) => {
    await page.getByTestId('long-custom-trigger').focus()
    const custom = page.getByRole('tooltip')
    await expect(custom).toHaveCSS('white-space', 'nowrap')
    await expect(custom).toHaveCSS('overflow-wrap', 'normal')
    await page.keyboard.press('Escape')
    await page.getByTestId('long-unconstrained-trigger').focus()
    const tooltip = page.getByRole('tooltip')
    await expect(tooltip).toBeVisible()
    expect((await tooltip.boundingBox())!.width).toBeGreaterThan(320)
    await expect(tooltip.locator('[data-tooltip-body]')).toHaveCSS('max-height', 'none')
    await expect(tooltip.locator('[data-tooltip-body]')).toHaveCSS('overflow', 'visible')
})

for (const dimension of ['height', 'both'] as const) {
    test(`aligns through a scaled portal with zero ${dimension}`, async ({ page }) => {
        await page.setViewportSize({ width: 1000, height: 800 })
        const portal = page.getByTestId('transformed-portals')
        await portal.evaluate((element, axes) => {
            element.parentElement!.style.transform = 'none'
            Object.assign(element.style, { transform: 'scale(1.25)', transformOrigin: 'top left', height: '0px', ...(axes === 'both' ? { width: '0px' } : {}) })
        }, dimension)
        const trigger = page.getByTestId('transformed-trigger')
        await trigger.focus()
        const tooltip = page.getByRole('tooltip', { name: 'Transformed help', exact: true })
        await expect(tooltip).toBeVisible()
        await expect.poll(async () => {
            const anchor = (await trigger.boundingBox())!
            const bounds = (await tooltip.boundingBox())!
            return Math.abs(bounds.y - anchor.y - anchor.height - 12.5)
        }).toBeLessThan(1)
        const anchor = (await trigger.boundingBox())!
        expect(Math.abs((await tooltip.boundingBox())!.x - anchor.x)).toBeLessThan(1)
    })
}
