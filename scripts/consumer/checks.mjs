export async function check({ page, expect }) {
    const visibleContent = page.locator(
        '[data-radix-popper-content-wrapper] > [data-state]',
    )
    /* eslint-disable no-await-in-loop -- Each trigger changes the visible tooltip. */
    for (const [id, contentClasses, arrowClasses] of [
        ['consumer-local-design', 'text-lg italic', 'fill-orange-500'],
        ['consumer-nested-design', 'text-sm font-semibold', 'fill-blue-500'],
    ]) {
        await page.getByTestId(id).focus()
        await expect(visibleContent).toBeVisible()
        await expect(visibleContent).toHaveClass(new RegExp(contentClasses))
        await expect(visibleContent.locator('svg')).toHaveClass(arrowClasses)
        if (id === 'consumer-local-design') {
            await expect(visibleContent).not.toHaveClass(
                /text-sm|font-semibold/,
            )
        }
        await page.keyboard.press('Escape')
        await expect(visibleContent).toBeHidden()
    }
    /* eslint-enable no-await-in-loop */
    await page.getByRole('button', { name: 'Show help' }).hover()
    const help = page.getByRole('tooltip', {
        name: 'Consumer help',
        exact: true,
    })
    await expect(help).toBeVisible()
    await expect(visibleContent).toHaveClass(/text-sm font-semibold/)
    await expect(visibleContent.locator('svg')).toHaveClass('fill-orange-500')
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

    const amountWrapper = page
        .locator('[data-tooltip-disabled-trigger]')
        .filter({ has: page.locator('#consumer-amount') })
    await page.getByRole('button', { name: 'Add amount label' }).click()
    await expect(amountWrapper).toHaveAccessibleName('Prefix Amount')
    const ids = await page
        .locator('label[for="consumer-amount"]')
        .evaluateAll((labels) => labels.map((label) => label.id))
    expect(ids.every(Boolean)).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
    await page.getByRole('button', { name: 'Remount amount control' }).click()
    await expect(amountWrapper).toHaveAccessibleName('Prefix Amount')
    await expect(page.locator('#consumer-amount')).toBeDisabled()
    await amountWrapper.focus()
    await expect(amountWrapper).toBeFocused()
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Remove amount label' }).click()
    await expect(amountWrapper).toHaveAccessibleName('Amount')
    await page.getByTestId('scroll-start').focus()
    const beforeFocusScroll = await page.evaluate(() => window.scrollY)
    await page.keyboard.press('Tab')
    await expect(
        page.getByRole('group', { name: 'Offscreen amount', exact: true }),
    ).toBeFocused()
    const offscreenHelp = page.getByRole('tooltip', {
        name: 'Offscreen amount explanation',
        exact: true,
    })
    await expect(offscreenHelp).toBeVisible()
    // Let the focus scroll finish, then check that the tooltip did not flash closed.
    await page.waitForTimeout(150)
    await expect(offscreenHelp).toBeVisible()
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(
        beforeFocusScroll,
    )
    await page.keyboard.press('Escape')
    await expect(offscreenHelp).toBeHidden()

    await page.getByTestId('controlled-scroll-start').focus()
    await page.keyboard.press('Tab')
    await expect(
        page.getByRole('button', {
            name: 'Controlled offscreen help',
            exact: true,
        }),
    ).toBeFocused()
    const controlledHelp = page.getByRole('tooltip', {
        name: 'Controlled offscreen explanation',
        exact: true,
    })
    await expect(controlledHelp).toBeVisible()
    await page.waitForTimeout(150)
    await expect(controlledHelp).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(controlledHelp).toBeHidden()
    /* eslint-disable no-await-in-loop -- Each focus changes the shared tooltip state. */
    for (const id of ['immediate-leave', 'inherited-leave']) {
        // Focus and pointer leave in the same task to exercise the active scroll guard.
        await page.getByTestId(id).evaluate((trigger) => {
            trigger.focus()
            trigger.dispatchEvent(
                new PointerEvent('pointerout', {
                    bubbles: true,
                    relatedTarget: document.body,
                    pointerType: 'mouse',
                }),
            )
        })
        await expect(page.getByTestId(id)).toHaveAttribute(
            'data-state',
            'closed',
        )
    }
    /* eslint-enable no-await-in-loop */
}
