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
        const nativeChild = page.getByTestId('disabled-trigger')
        const wrapper = page
            .locator('[data-tooltip-disabled-trigger]')
            .filter({ has: nativeChild })
        const enabledChild = page.getByTestId('accidentally-enabled-trigger')
        const enabledWrapper = page
            .locator('[data-tooltip-disabled-trigger]')
            .filter({ has: enabledChild })

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
        await expect(enabledChild).toBeDisabled()

        await page.getByRole('button', { name: 'SE', exact: true }).focus()
        await page.keyboard.press('Tab')
        await expect(page.getByTestId('provider-trigger')).toBeFocused()
        await page.keyboard.press('Tab')
        await expect(wrapper).toBeFocused()
        await page.keyboard.press('Tab')
        await expect(enabledWrapper).toBeFocused()

        await page.keyboard.press('Enter')
        await page.keyboard.press(' ')
        // Deliberately attempt a pointer activation on the aria-disabled proxy.
        await enabledWrapper.click({ force: true })
        await expect(
            page.getByTestId('enabled-trigger-activations'),
        ).toHaveText('0')

        const results = await new AxeBuilder({ page })
            .include('[data-tooltip-disabled-trigger]')
            .analyze()
        expect(results.violations).toEqual([])
    })

    test('supports controlled open state and reports open changes', async ({
        page,
    }) => {
        const trigger = page.getByTestId('controlled-trigger')
        const state = page.getByTestId('controlled-state')

        await expect(state).toHaveText('closed')
        await trigger.hover()
        const tooltip = page.getByRole('tooltip')
        await expect(tooltip).toContainText('controlled by application state')
        await expect(state).toHaveText('open')

        await page.keyboard.press('Escape')
        await expect(tooltip).toBeHidden()
        await expect(state).toHaveText('closed')
    })

    test('preserves native labels on the focusable disabled field wrappers', async ({
        page,
    }) => {
        /* eslint-disable no-await-in-loop -- Focus and Escape are checked in order on the same page. */
        for (const [name, explanation] of [
            ['Amount', 'The amount cannot be edited.'],
            ['Notes', 'Notes cannot be edited.'],
            ['Category', 'The category cannot be edited.'],
        ]) {
            const wrapper = page.getByRole('group', { name, exact: true })
            await wrapper.focus()
            await expect(wrapper).toBeFocused()
            await expect(wrapper).toHaveAccessibleName(name)
            await expect(wrapper).toHaveAttribute('aria-disabled', 'true')
            await expect(
                wrapper.locator('input, textarea, select'),
            ).toBeDisabled()
            const tooltip = page.getByRole('tooltip', {
                name: explanation,
                exact: true,
            })
            await expect(tooltip).toBeVisible()
            await page.keyboard.press('Escape')
            await expect(tooltip).toBeHidden()
        }
        /* eslint-enable no-await-in-loop */
        await page.locator('label[for="disabled-amount"]').evaluate((label) => {
            label.textContent = 'Updated amount'
        })
        await expect(
            page.getByRole('group', { name: 'Updated amount', exact: true }),
        ).toBeVisible()
        const amountWrapper = page.locator('#disabled-amount').locator('..')
        await page.locator('label[for="disabled-amount"]').evaluate((label) => {
            const replacement = document.createElement('label')
            replacement.htmlFor = 'disabled-amount'
            replacement.textContent = 'Replacement amount'
            label.replaceWith(replacement)
        })
        await expect(amountWrapper).toHaveAccessibleName('Replacement amount')
        await page.locator('label[for="disabled-amount"]').evaluate((label) => {
            label.htmlFor = 'disabled-notes'
            const replacement = document.createElement('label')
            replacement.htmlFor = 'disabled-amount'
            replacement.textContent = 'Final amount'
            label.after(replacement)
        })
        await expect(amountWrapper).toHaveAccessibleName('Final amount')
        const results = await new AxeBuilder({ page })
            .include('section[aria-label="Unavailable fields"]')
            .analyze()
        expect(results.violations).toEqual([])
    })

    test('flips a top tooltip away from the viewport edge', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 800, height: 600 })
        const trigger = page.getByTestId('standalone-trigger')
        await trigger.evaluate((element) => {
            const target = element as HTMLElement
            target.style.position = 'fixed'
            target.style.top = '0px'
            target.style.left = '50%'
            target.style.transform = 'translateX(-50%)'
        })

        await trigger.hover()
        const tooltip = page.getByRole('tooltip')
        await expect(tooltip).toBeVisible()
        await expect(tooltip).toHaveAttribute('data-side', 'bottom')
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
