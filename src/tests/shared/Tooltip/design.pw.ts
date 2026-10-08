import { expect, test } from '@playwright/test'
import { defaultTooltipDesign } from '../../../config/tooltip.config.ts'
import { playgroundDesign } from '../../../../playground/src/config/playground.config.ts'

test.describe('provider tooltip designs', () => {
    test('renders global, local, nested, and standalone designs in the visible portal content', async ({
        page,
    }) => {
        await page.goto('/')
        const content = page.locator(
            '[data-radix-popper-content-wrapper] > [data-state]',
        )
        const cases = [
            ['provider-trigger', playgroundDesign],
            [
                'local-design-trigger',
                {
                    ...playgroundDesign,
                    contentClasses: 'text-sm font-semibold',
                },
            ],
            [
                'nested-design-trigger',
                { ...playgroundDesign, contentClasses: 'text-base italic' },
            ],
            [
                'nested-local-design-trigger',
                {
                    ...playgroundDesign,
                    arrowClasses: 'fill-bench-orange',
                    contentClasses: 'text-lg font-bold',
                },
            ],
            ['provider-trigger', playgroundDesign],
            ['default-design-trigger', defaultTooltipDesign],
        ] as const

        /* eslint-disable no-await-in-loop -- Each trigger owns the one visible tooltip. */
        for (const [id, design] of cases) {
            const trigger = page.getByTestId(id)
            await trigger.scrollIntoViewIfNeeded()
            await trigger.hover()
            await expect(content).toBeVisible()
            await expect(content).toHaveClass(
                `z-[9999] ${design.baseClasses} ${design.animationClasses} ${design.contentClasses}`,
            )
            await expect(content.locator('svg')).toHaveClass(
                design.arrowClasses!,
            )
            if (id !== 'default-design-trigger') {
                await expect(
                    page
                        .locator('#tooltip-portal-host')
                        .locator(
                            '[data-radix-popper-content-wrapper] > [data-state]',
                        ),
                ).toHaveCount(1)
            }
            await page.keyboard.press('Escape')
            await expect(content).toBeHidden()
        }
        /* eslint-enable no-await-in-loop */
    })

    test('keeps outer hoverable content through a nested design provider', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('nested-design-trigger').hover()
        const content = page.locator(
            '[data-radix-popper-content-wrapper] > [data-state]',
        )
        await expect(content).toBeVisible()
        await content.hover()
        await expect(content).toBeVisible()
        await page.mouse.move(0, 0)
        await expect(content).toBeHidden()
    })

    test('keeps outer delay and shares skip delay through nested design providers', async ({
        page,
    }) => {
        await page.clock.install({ time: new Date('2026-10-08T10:00:00Z') })
        await page.goto('/')
        await page
            .getByRole('checkbox', {
                name: 'Close when leaving trigger Provider hover behavior.',
            })
            .check()
        // Browser actions must not consume the shared 250 ms skip-delay window.
        await page.clock.pauseAt(new Date('2026-10-08T11:00:00Z'))
        const nested = page.getByTestId('nested-design-trigger')
        const sibling = page.getByTestId('local-design-trigger')
        await nested.hover()
        await page.clock.runFor(349)
        await expect(nested).toHaveAttribute('data-state', 'closed')
        await page.clock.runFor(1)
        await expect(nested).toHaveAttribute('data-state', 'delayed-open')
        await sibling.hover()
        await expect(sibling).toHaveAttribute('data-state', 'instant-open')
        await expect(nested).toHaveAttribute('data-state', 'closed')
        await nested.hover()
        await expect(nested).toHaveAttribute('data-state', 'instant-open')
        await expect(sibling).toHaveAttribute('data-state', 'closed')
        await page.mouse.move(0, 0)
        await expect(nested).toHaveAttribute('data-state', 'closed')
        await page.clock.runFor(250)
        await sibling.hover()
        await expect(sibling).toHaveAttribute('data-state', 'closed')
        await page.clock.runFor(350)
        await expect(sibling).toHaveAttribute('data-state', 'delayed-open')
    })
})
