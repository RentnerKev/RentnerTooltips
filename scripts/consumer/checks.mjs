export async function check({ page, expect }) {
    await page.getByRole('button', { name: 'Show help' }).hover()
    const help = page.getByRole('tooltip', {
        name: 'Consumer help',
        exact: true,
    })
    await expect(help).toBeVisible()
    expect(
        await help.evaluate((node) =>
            parseFloat(getComputedStyle(node).paddingLeft),
        ),
    ).toBeGreaterThan(0)
    await page.keyboard.press('Escape')
    await expect(help).toBeHidden()
    const amount = page.getByRole('group', { name: 'Amount', exact: true })
    await amount.focus()
    await expect(amount).toBeFocused()
    await expect(amount).toHaveAccessibleName('Amount')
    await expect(page.locator('#consumer-amount')).toBeDisabled()
    await page.keyboard.press('Escape')
    // The focusable disabled proxy and its disabled native button share the name.
    const proxy = page
        .locator('[data-tooltip-disabled-trigger]')
        .filter({ hasText: 'Unavailable action' })
    await proxy.focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')
    await proxy.click({ force: true })
    await expect(page.getByTestId('activations')).toHaveText('0')
    await page.keyboard.press('Escape')
}
