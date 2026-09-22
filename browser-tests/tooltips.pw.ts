import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('tooltip playground', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('opens through hover and focus, portals content, closes with Escape, and passes axe', async ({
        page,
    }) => {
        const trigger = page.getByTestId('provider-trigger')

        await trigger.hover()
        const tooltip = page.getByRole('tooltip')
        await expect(tooltip).toContainText('Inherited')
        await expect(tooltip).toBeVisible()
        const portalHost = page.locator('#tooltip-portal-host')
        await expect(portalHost.getByRole('tooltip')).toHaveCount(1)
        const portalId = await tooltip.evaluate(
            (element) => element.closest('#tooltip-portal-host')?.id,
        )
        expect(portalId).toBe('tooltip-portal-host')

        const results = await new AxeBuilder({ page }).analyze()
        expect(results.violations).toEqual([])

        await page.keyboard.press('Escape')
        await expect(tooltip).toBeHidden()

        await trigger.focus()
        await expect(tooltip).toBeVisible()
    })

    test('keeps a disabled native trigger focusable and interactive', async ({
        page,
    }) => {
        const wrapper = page.locator('[data-tooltip-disabled-trigger]')

        await wrapper.hover()
        await expect(page.getByRole('tooltip')).toContainText(
            'control stays disabled',
        )
        await page.keyboard.press('Escape')
        await page.mouse.move(0, 0)
        await expect(page.getByRole('tooltip')).toBeHidden()

        await wrapper.focus()

        await expect(page.getByRole('tooltip')).toContainText(
            'control stays disabled',
        )
        await expect(wrapper).toHaveAttribute('data-state', 'instant-open')
        await expect(wrapper).toHaveAttribute('aria-disabled', 'true')
    })

    test('disables tooltip animation when reduced motion is requested', async ({
        page,
    }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.getByTestId('provider-trigger').hover()

        const tooltip = page.getByRole('tooltip')
        await expect(tooltip).toBeVisible()
        await expect
            .poll(() =>
                tooltip.evaluate(
                    (element) => getComputedStyle(element).animationName,
                ),
            )
            .toBe('none')
    })

    test('switches the playground between light and dark themes', async ({
        page,
    }) => {
        const toggle = page.getByRole('checkbox', { name: /dark mode/i })
        await expect(toggle).not.toBeChecked()
        await toggle.check()
        await expect(toggle).toBeChecked()
        await expect(page.locator('.dark')).toHaveCount(1)
    })
})
