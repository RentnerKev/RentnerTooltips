import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const moduleURL = `/@fs/${fileURLToPath(new URL('../src/nativeLabelObserver.ts', import.meta.url)).replaceAll('\\', '/')}`

test('shares root observers, skips unrelated mutations, and disconnects the final subscriber', async ({
    page,
}) => {
    await page.goto('/')
    const result = await page.evaluate(async (url) => {
        const { subscribeNativeLabels } = await import(url)
        const host = document.createElement('div')
        document.body.append(host)
        const root = host.attachShadow({ mode: 'open' })
        const NativeObserver = window.MutationObserver
        let observations = 0
        let disconnects = 0
        window.MutationObserver = class extends NativeObserver {
            private tracksRoot = false
            override observe(target: Node, options?: MutationObserverInit) {
                if (target === root) {
                    observations++
                    this.tracksRoot = true
                }
                super.observe(target, options)
            }
            override disconnect() {
                if (this.tracksRoot) disconnects++
                super.disconnect()
            }
        }
        const tick = () =>
            new Promise<void>((resolve) =>
                root.ownerDocument.defaultView!.setTimeout(resolve, 0),
            )
        let callbacks = 0
        const wrappers = Array.from({ length: 100 }, () => {
            const wrapper = document.createElement('span')
            wrapper.dataset.tooltipDisabledTrigger = ''
            root.append(wrapper)
            return wrapper
        })
        const unsubscribe = wrappers.map((wrapper) =>
            subscribeNativeLabels(wrapper, () => callbacks++),
        )
        await tick()
        callbacks = 0
        const unrelated = document.createElement('div')
        root.append(unrelated)
        await tick()
        for (let index = 0; index < 30; index++) {
            unrelated.append(document.createTextNode('unrelated'))
            // Each edit must deliver a separate mutation batch.
            // eslint-disable-next-line no-await-in-loop
            await tick()
        }
        const unrelatedCallbacks = callbacks
        const label = document.createElement('label')
        root.append(label)
        await tick()
        const relevantCallbacks = callbacks
        unsubscribe.slice(0, -1).forEach((stop) => stop())
        const partialDisconnects = disconnects
        unsubscribe.at(-1)!()
        label.htmlFor = 'changed-after-cleanup'
        await tick()
        const finalCallbacks = callbacks
        window.MutationObserver = NativeObserver
        host.remove()
        return {
            observations,
            partialDisconnects,
            disconnects,
            unrelatedCallbacks,
            relevantCallbacks,
            finalCallbacks,
        }
    }, moduleURL)
    expect(result).toEqual({
        observations: 1,
        partialDisconnects: 0,
        disconnects: 1,
        unrelatedCallbacks: 0,
        relevantCallbacks: 100,
        finalCallbacks: 100,
    })
})

test('preserves shared generated ids until the final owner releases them', async ({
    page,
}) => {
    await page.goto('/')
    const result = await page.evaluate(async (url) => {
        const { retainNativeLabelId, releaseNativeLabelId } = await import(url)
        const label = document.createElement('label')
        const first = {},
            second = {}
        retainNativeLabelId(label, first, () => 'generated-label')
        retainNativeLabelId(label, second, () => 'unexpected-id')
        releaseNativeLabelId(label, first)
        const sharedId = label.id
        releaseNativeLabelId(label, second)
        const releasedId = label.id
        retainNativeLabelId(label, first, () => 'next-label')
        label.id = 'consumer-replacement'
        releaseNativeLabelId(label, first)
        return { sharedId, releasedId, consumerId: label.id }
    }, moduleURL)
    expect(result).toEqual({
        sharedId: 'generated-label',
        releasedId: '',
        consumerId: 'consumer-replacement',
    })
})

test('keeps wrapped labels and moves subscriptions between document and shadow roots', async ({
    page,
}) => {
    await page.goto('/')
    const wrapper = page.locator('#disabled-amount').locator('..')
    await wrapper.evaluate((element) => {
        document.querySelector('label[for="disabled-amount"]')!.remove()
        const label = document.createElement('label')
        label.textContent = 'Wrapped amount'
        element.before(label)
        label.append(element)
    })
    await expect(wrapper).toHaveAccessibleName('Wrapped amount 12')
    await wrapper.evaluate((element) => {
        const competing = document.createElement('input')
        competing.dataset.testid = 'competing-wrapped-control'
        element.before(competing)
    })
    await expect(wrapper).not.toHaveAttribute('aria-labelledby')
    await page
        .getByTestId('competing-wrapped-control')
        .evaluate((element) => element.remove())
    await expect(wrapper).toHaveAccessibleName('Wrapped amount 12')
    await wrapper.evaluate((element) => {
        const host = document.createElement('div')
        host.id = 'shadow-label-host'
        document.body.append(host)
        host.attachShadow({ mode: 'open' }).append(element.parentElement!)
    })
    const moved = page.locator(
        '#shadow-label-host [data-tooltip-disabled-trigger]',
    )
    await expect(moved).toHaveAccessibleName('Wrapped amount 12')
    await moved.evaluate((element) => {
        const label = element.parentElement!
        label.id = 'shadow-consumer-label'
        label.prepend('Updated ')
    })
    await expect(moved).toHaveAttribute(
        'aria-labelledby',
        'shadow-consumer-label',
    )
    await expect(moved).toHaveAccessibleName('Updated Wrapped amount 12')
    await moved.evaluate((element) =>
        document.body.append(element.parentElement!),
    )
    const returned = page.locator('#disabled-amount').locator('..')
    await expect(returned).toHaveAccessibleName('Updated Wrapped amount 12')
    await returned.evaluate((element) => {
        element.parentElement!.id = 'document-consumer-label'
    })
    await expect(returned).toHaveAttribute(
        'aria-labelledby',
        'document-consumer-label',
    )
})

test('reconnects after a detached interval and follows live control ids', async ({
    page,
}) => {
    await page.goto('/')
    const wrapper = await page
        .locator('#disabled-amount')
        .locator('..')
        .elementHandle()
    await wrapper!.evaluate((element) => element.remove())
    await expect.poll(() => wrapper!.getAttribute('aria-labelledby')).toBe(null)
    await wrapper!.evaluate((element) => {
        document.body.append(element)
        const control = element.firstElementChild!
        control.id = 'moved-amount'
        const label = document.createElement('label')
        label.htmlFor = 'moved-amount'
        label.textContent = 'Reconnected amount'
        element.before(label)
    })
    const reconnected = page.locator('#moved-amount').locator('..')
    await expect(reconnected).toHaveAccessibleName('Reconnected amount')
    await page
        .locator('label[for="moved-amount"]')
        .evaluate((element) => element.remove())
    await expect(reconnected).not.toHaveAttribute('aria-labelledby')
})
