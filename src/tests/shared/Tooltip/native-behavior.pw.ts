import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const fixtureURL = `/@fs/${fileURLToPath(new URL('../../../../playground/src/Components/NativeTooltipFixture.tsx', import.meta.url)).replaceAll('\\', '/')}`

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.evaluate(async (url) => {
        ;(await import(url)).mountFixture()
    }, fixtureURL)
    await expect(page.getByTestId('composed-trigger')).toBeVisible()
})

test('composes child callbacks, persistent descriptions, forwarded refs and React19 ref cleanup', async ({
    page,
}) => {
    const trigger = page.getByTestId('composed-trigger')
    await expect(page.getByTestId('ref-mounts')).toHaveText('1')
    await trigger.focus()
    const tooltip = page.getByRole('tooltip', {
        name: 'Composed help',
        exact: true,
    })
    await expect(tooltip).toBeVisible()
    const id = await tooltip.getAttribute('id')
    await expect(trigger).toHaveAttribute(
        'aria-describedby',
        `persistent-description ${id}`,
    )
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute(
        'aria-describedby',
        'persistent-description',
    )
    await trigger.click()
    await expect(page.getByTestId('child-clicks')).toHaveText('1')
    await page.getByRole('button', { name: 'Toggle tooltip mount' }).click()
    await expect(page.getByTestId('ref-cleanups')).toHaveText('1')
    await expect(page.getByRole('tooltip')).toHaveCount(0)
})

test('preserves native implicit button submission and explicit button types', async ({
    page,
}) => {
    await page.getByTestId('implicit-type-trigger').click()
    await expect(page.getByTestId('implicit-type-trigger')).not.toHaveAttribute(
        'type',
    )
    await expect(page.getByTestId('native-submits')).toHaveText('1')
    await page.getByTestId('explicit-submit-trigger').click()
    await expect(page.getByTestId('native-submits')).toHaveText('2')
})

test('retains unbounded placement when collision avoidance is disabled', async ({
    page,
}) => {
    await page.getByTestId('unconstrained-trigger').focus()
    const tooltip = page.getByRole('tooltip')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toHaveAttribute('data-side', 'right')
    const boundary = (await page
        .getByTestId('native-collision-boundary')
        .boundingBox())!
    const content = (await tooltip.boundingBox())!
    expect(content.width).toBeGreaterThan(boundary.width)
    expect(content.x + content.width).toBeGreaterThan(
        boundary.x + boundary.width + 10,
    )
})

test('stays dismissed after Escape until the pointer leaves and reenters', async ({
    page,
}) => {
    const trigger = page.getByTestId('composed-trigger')
    await trigger.hover()
    await expect(
        page.getByRole('tooltip', { name: 'Composed help', exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    const bounds = (await trigger.boundingBox())!
    await page.mouse.move(bounds.x + 2, bounds.y + bounds.height / 2)
    await page.waitForTimeout(150)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await page.mouse.move(0, 0)
    await trigger.hover()
    await expect(
        page.getByRole('tooltip', { name: 'Composed help', exact: true }),
    ).toBeVisible()
})

test('rebinds geometry, outside events and ref cleanup when the live trigger changes element type', async ({
    page,
}) => {
    await page
        .getByRole('button', { name: 'Open changing trigger', exact: true })
        .evaluate((button) => button.click())
    const tooltip = page.getByRole('tooltip', {
        name: 'Changing trigger help',
        exact: true,
    })
    await expect(tooltip).toBeVisible()
    await page
        .getByRole('button', { name: 'Swap changing trigger', exact: true })
        .evaluate((button) => button.click())
    const trigger = page.getByTestId('changing-trigger')
    await expect(trigger).toHaveJSProperty('tagName', 'A')
    await expect(page.getByTestId('changing-refs')).toHaveText(
        'BUTTON,-BUTTON,A',
    )
    await expect
        .poll(async () => {
            const anchor = (await trigger.boundingBox())!
            const content = (await tooltip.boundingBox())!
            return Math.abs(
                content.x + content.width / 2 - anchor.x - anchor.width / 2,
            )
        })
        .toBeLessThan(2)
    // The child cancels trigger dismissal. A stale document listener would
    // incorrectly treat this new link as an outside target.
    await trigger.dispatchEvent('pointerdown', { pointerType: 'mouse' })
    await expect(tooltip).toBeVisible()
    await page.getByTestId('outside').click()
    await expect(tooltip).toHaveCount(0)
})

test('Escape dismisses the newest tooltip before an older controlled tooltip that refuses to close', async ({
    page,
}) => {
    await page
        .getByRole('button', { name: 'Open stubborn tooltip', exact: true })
        .evaluate((button) => button.click())
    const older = page.getByRole('tooltip', {
        name: 'Stubborn tooltip',
        exact: true,
    })
    await expect(older).toBeVisible()
    await page
        .getByRole('button', { name: 'Open sibling tooltip', exact: true })
        .evaluate((button) => button.click())
    const newer = page.getByRole('tooltip', {
        name: 'Sibling tooltip',
        exact: true,
    })
    await expect(newer).toBeVisible()
    await expect(older).toBeVisible()
    await expect(page.getByTestId('stubborn-close-requests')).toHaveText('1')
    await page.keyboard.press('Escape')
    await expect(newer).toHaveCount(0)
    await expect(older).toBeVisible()
    await expect(page.getByTestId('stubborn-close-requests')).toHaveText('1')
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('stubborn-close-requests')).toHaveText('2')
})

for (const { name, styles, gap } of [
    {
        name: 'individual translate',
        styles: {
            translate: '48px 32px',
            scale: 'none',
            rotate: 'none',
            willChange: 'auto',
        },
        gap: 10,
    },
    {
        name: 'individual scale',
        styles: {
            translate: '0px',
            scale: '1.25',
            rotate: 'none',
            willChange: 'auto',
        },
        gap: 12.5,
    },
    {
        name: 'identity rotate',
        styles: {
            translate: 'none',
            scale: 'none',
            rotate: '0deg',
            willChange: 'auto',
        },
        gap: 10,
    },
    {
        name: 'will-change translate',
        styles: {
            translate: 'none',
            scale: 'none',
            rotate: 'none',
            willChange: 'translate',
        },
        gap: 10,
    },
]) {
    test(`positions inside a portal with ${name} and no transform shorthand`, async ({
        page,
    }) => {
        await page
            .getByTestId('transformed-container')
            .evaluate((element, value) => {
                element.style.transform = 'none'
                Object.assign(element.style, value)
            }, styles)
        const trigger = page.getByTestId('transformed-trigger')
        await trigger.focus()
        const tooltip = page.getByRole('tooltip', {
            name: 'Transformed help',
            exact: true,
        })
        await expect(tooltip).toBeVisible()
        const anchor = (await trigger.boundingBox())!
        const content = (await tooltip.boundingBox())!
        expect(Math.abs(content.x - anchor.x)).toBeLessThan(2)
        expect(
            Math.abs(content.y - anchor.y - anchor.height - gap),
        ).toBeLessThan(2)
    })
}

test('honors cancelled trigger events and never opens from touch hovering', async ({
    page,
}) => {
    await page.getByTestId('cancelled-trigger').hover()
    await page.waitForTimeout(150)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await page.getByTestId('cancelled-trigger').focus()
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await page
        .getByTestId('composed-trigger')
        .dispatchEvent('pointermove', { pointerType: 'touch' })
    await page.waitForTimeout(150)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
})

test('skipDelayDuration zero retains the delay even while a controlled sibling remains open', async ({
    page,
}) => {
    await page.clock.install({ time: new Date('2026-10-08T10:00:00Z') })
    await page.clock.pauseAt(new Date('2026-10-08T11:00:00Z'))
    const first = page.getByTestId('zero-skip-first')
    const second = page.getByTestId('zero-skip-second')
    await first.hover()
    await page.clock.runFor(100)
    await expect(first).toHaveAttribute('data-state', 'delayed-open')
    await second.hover()
    await expect(first).not.toHaveAttribute('data-state', 'closed')
    await expect(second).toHaveAttribute('data-state', 'closed')
    await page.clock.runFor(99)
    await expect(second).toHaveAttribute('data-state', 'closed')
    await page.clock.runFor(1)
    await expect(second).toHaveAttribute('data-state', 'delayed-open')
})

test('shared hover transit does not open a sibling crossed on the way to content', async ({
    page,
}) => {
    await page.getByTestId('transit-first').hover()
    const tooltip = page.getByRole('tooltip', {
        name: 'Transit original help',
        exact: true,
    })
    await expect(tooltip).toBeVisible()
    const sibling = page.getByTestId('transit-sibling')
    const bounds = (await sibling.boundingBox())!
    await page.mouse.move(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        { steps: 8 },
    )
    await expect(tooltip).toBeVisible()
    await expect(sibling).toHaveAttribute('data-state', 'closed')
    await tooltip.hover()
    await expect(tooltip).toBeVisible()
    await page.mouse.move(0, 0, { steps: 8 })
    await expect(tooltip).toHaveCount(0)
})

test('portals into a ShadowRoot and preserves hover movement and outside dismissal', async ({
    page,
}) => {
    const trigger = page.getByTestId('native-shadow-trigger')
    await trigger.focus()
    const tooltip = page.getByTestId('native-shadow-host').getByRole('tooltip')
    await expect(tooltip).toHaveText('Shadow help')
    await expect(tooltip).toBeVisible()
    await expect(trigger).toHaveAccessibleDescription('Shadow help')
    const anchor = (await trigger.boundingBox())!
    const content = (await tooltip.boundingBox())!
    expect(Math.abs(content.x - anchor.x)).toBeLessThan(2)
    expect(Math.abs(content.y - anchor.y - anchor.height - 10)).toBeLessThan(2)
    await trigger.evaluate((element) => {
        element.style.transform = 'translateX(32px)'
    })
    await expect
        .poll(async () => {
            const movedAnchor = (await trigger.boundingBox())!
            const movedContent = (await tooltip.boundingBox())!
            return Math.abs(movedContent.x - movedAnchor.x)
        })
        .toBeLessThan(2)
    await tooltip.hover()
    await expect(tooltip).toBeVisible()
    await page.getByTestId('outside').click()
    await expect(page.getByRole('tooltip')).toHaveCount(0)
})

test('positions relative to a scaled and translated portal containing block', async ({
    page,
}) => {
    const trigger = page.getByTestId('transformed-trigger')
    await trigger.focus()
    const tooltip = page.getByRole('tooltip', {
        name: 'Transformed help',
        exact: true,
    })
    await expect(tooltip).toBeVisible()
    const anchor = (await trigger.boundingBox())!
    const content = (await tooltip.boundingBox())!
    expect(Math.abs(content.x - anchor.x)).toBeLessThan(2)
    expect(Math.abs(content.y - anchor.y - anchor.height - 12.5)).toBeLessThan(
        2,
    )
    await page.keyboard.press('Escape')
    await expect(tooltip).toHaveCount(0)
})

test('uses boundary arrays and padding, flips, and hides fully clipped reference targets', async ({
    page,
}) => {
    const trigger = page.getByTestId('native-collision-trigger')
    await trigger.focus()
    const tooltip = page.getByRole('tooltip', {
        name: 'Clipped boundary help',
        exact: true,
    })
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toHaveAttribute('data-side', 'left')
    const boundary = (await page
        .getByTestId('native-collision-boundary')
        .boundingBox())!
    await expect
        .poll(async () => {
            const content = (await tooltip.boundingBox())!
            return (
                content.x >= boundary.x + 9 &&
                content.y >= boundary.y + 9 &&
                content.x + content.width <= boundary.x + boundary.width - 9
            )
        })
        .toBe(true)
    await trigger.evaluate((element) => {
        element.style.top = '160px'
    })
    await page.setViewportSize({ width: 1000, height: 800 })
    await expect(tooltip).toBeHidden()
})

test('controlled requests can be rejected, and external changes remain authoritative', async ({
    page,
}) => {
    await page.getByRole('button', { name: 'Toggle acceptance' }).click()
    await page.getByTestId('native-controlled-trigger').focus()
    await expect(page.getByTestId('controlled-changes')).toHaveText('true')
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await page.getByRole('button', { name: 'Force controlled state' }).click()
    await expect(
        page.getByRole('tooltip', { name: 'Controlled help', exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('controlled-changes')).toHaveText(
        'true,false',
    )
    await expect(
        page.getByRole('tooltip', { name: 'Controlled help', exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Force controlled state' }).click()
    await expect(page.getByRole('tooltip')).toHaveCount(0)
})

test('cancels pending delayed opens when disabled and when unmounted', async ({
    page,
}) => {
    await page.clock.install({ time: new Date('2026-10-08T10:00:00Z') })
    await page.clock.pauseAt(new Date('2026-10-08T11:00:00Z'))
    await page.getByTestId('composed-trigger').hover()
    await page
        .getByRole('button', { name: 'Toggle disabled' })
        .evaluate((button) => button.click())
    await page.clock.runFor(500)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await page
        .getByRole('button', { name: 'Toggle disabled' })
        .evaluate((button) => button.click())
    await page.getByTestId('composed-trigger').hover()
    await page
        .getByRole('button', { name: 'Toggle tooltip mount' })
        .evaluate((button) => button.click())
    await page.clock.runFor(500)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await page.evaluate(async (url) => {
        ;(await import(url)).unmountFixture()
    }, fixtureURL)
    await expect(page.locator('[data-tooltip-positioner]')).toHaveCount(0)
})
