import { expect, test } from '@playwright/test'

test('applies provider, nested and local defaults in the actual portal with scoped theme tokens', async ({
    page,
}) => {
    await page.goto('/')
    const host = page.getByTestId('defaults-portal-host')
    const content = host.locator(
        '[data-radix-popper-content-wrapper] > [data-state]',
    )
    await page.getByTestId('defaults-trigger').focus()
    await expect(content).toBeVisible()
    await expect(content).toHaveAttribute('data-side', 'right')
    await expect(content).toHaveAttribute('data-align', 'start')
    await expect(content).toHaveClass(/tooltip-contract-portal/)
    await expect(content).toHaveCSS('z-index', '12345')
    await expect(content).toHaveCSS('font-size', '16px')
    await expect(content).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(content.locator('svg')).toHaveCount(0)
    const triggerBox = await page.getByTestId('defaults-trigger').boundingBox()
    const contentBox = await content.boundingBox()
    expect(
        Math.abs(contentBox!.x - triggerBox!.x - triggerBox!.width - 14),
    ).toBeLessThan(2)
    await page.keyboard.press('Escape')
    await page.getByTestId('defaults-local-trigger').focus()
    await expect(content).toHaveAttribute('data-side', 'bottom')
    await expect(content).toHaveCSS('z-index', '54321')
    await expect(content).toHaveCSS('font-size', '12px')
    await expect(content).not.toHaveClass(/rounded-rentner-control/)
    await expect(content.locator('svg')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await page.getByTestId('defaults-nested-trigger').focus()
    await expect(content).toHaveAttribute('data-side', 'left')
    await expect(content).toHaveCSS('z-index', '23456')
    await expect(content).toHaveCSS('font-size', '16px')
})
