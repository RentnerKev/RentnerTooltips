import { describe, expect, test } from 'bun:test'
import { useContext } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as publicApi from '../../../index.ts'
import { CustomTooltip } from '../../../shared/Tooltip/Components/CustomTooltip.tsx'
import { TooltipProvider } from '../../../shared/Tooltip/Components/TooltipProvider.tsx'
import { TooltipProviderDepthContext } from '../../../shared/Tooltip/TooltipContext.ts'

function ProviderDepthProbe() {
    const providerDepth = useContext(TooltipProviderDepthContext)

    return <output>{providerDepth}</output>
}

describe('tooltip API', () => {
    test('exposes the intended runtime API', () => {
        expect(Object.keys(publicApi).toSorted()).toEqual([
            'CustomTooltip',
            'TooltipProvider',
            'defaultTooltipDesign',
        ])
    })

    test('supports standalone tooltips through a fallback provider', () => {
        const markup = renderToStaticMarkup(
            <CustomTooltip content="Helpful information">
                <button type="button">Hover me</button>
            </CustomTooltip>,
        )

        expect(markup).toContain('data-state="closed"')
        expect(markup).toContain('>Hover me</button>')
    })

    test('reuses the outer package provider instead of nesting another one', () => {
        const markup = renderToStaticMarkup(
            <TooltipProvider delayDuration={500} skipDelayDuration={100}>
                <TooltipProvider delayDuration={0}>
                    <ProviderDepthProbe />
                    <CustomTooltip content="Shared provider">
                        <button type="button">Trigger</button>
                    </CustomTooltip>
                </TooltipProvider>
            </TooltipProvider>,
        )

        expect(markup).toContain('<output>1</output>')
        expect(markup.match(/data-state="closed"/g)).toHaveLength(1)
    })

    test('can disable tooltip behavior without changing the trigger', () => {
        const markup = renderToStaticMarkup(
            <CustomTooltip content="Hidden" disabled>
                <button type="button" disabled>
                    Disabled action
                </button>
            </CustomTooltip>,
        )

        expect(markup).toBe(
            '<button type="button" disabled="">Disabled action</button>',
        )
    })

    test('makes a disabled native trigger hoverable and keyboard focusable', () => {
        const markup = renderToStaticMarkup(
            <CustomTooltip
                content="This action is unavailable"
                disabledTrigger
                disabledTriggerClassName="custom-wrapper"
            >
                <button
                    type="button"
                    disabled
                    aria-label="Download"
                    aria-describedby="download-help"
                    // oxlint-disable-next-line jsx-a11y/role-supports-aria-props -- aria-description is global in WAI-ARIA 1.3; this regression checks its existing proxy forwarding.
                    aria-description="Downloads are unavailable"
                >
                    Download
                </button>
            </CustomTooltip>,
        )

        expect(markup).toContain('tabindex="0"')
        expect(markup).toContain('aria-disabled="true"')
        expect(markup).toContain('aria-label="Download"')
        expect(markup).toContain('aria-describedby="download-help"')
        expect(markup).toContain('aria-description="Downloads are unavailable"')
        expect(markup).toContain('data-tooltip-disabled-trigger=""')
        expect(markup).toContain('role="button"')
        expect(markup).toContain('custom-wrapper')
        expect(markup).toContain('style="pointer-events:none"')
    })

    test('forwards Radix trigger state to the disabled wrapper', () => {
        const markup = renderToStaticMarkup(
            <CustomTooltip
                content="This action is unavailable"
                disabledTrigger
                open
            >
                <button type="button" disabled>
                    Download
                </button>
            </CustomTooltip>,
        )

        expect(markup).toContain('data-state="instant-open"')
    })

    test('preserves an explicit field label on a disabled group', () => {
        const markup = renderToStaticMarkup(
            <CustomTooltip content="Unavailable amount" disabledTrigger>
                <input aria-labelledby="amount-label" defaultValue="12" />
            </CustomTooltip>,
        )
        expect(markup).toContain('role="group"')
        expect(markup).toContain('aria-labelledby="amount-label"')
    })

    test('rejects children that cannot be disabled natively', () => {
        expect(() =>
            renderToStaticMarkup(
                <CustomTooltip content="Unavailable" disabledTrigger>
                    <a href="/danger">Danger</a>
                </CustomTooltip>,
            ),
        ).toThrow(
            'disabledTrigger requires a native button, input, select, or textarea child.',
        )
    })

    test('accepts delay, collision, positioning, and portal options', () => {
        const markup = renderToStaticMarkup(
            <CustomTooltip
                content="Configured"
                delayDuration={0}
                disableHoverableContent
                side="right"
                sideOffset={12}
                align="start"
                alignOffset={4}
                avoidCollisions={false}
                collisionBoundary={null}
                collisionPadding={{ top: 8, right: 12, bottom: 8, left: 12 }}
                arrowPadding={4}
                sticky="always"
                hideWhenDetached
                portalContainer={null}
            >
                <button type="button">Configured trigger</button>
            </CustomTooltip>,
        )

        expect(markup).toContain('data-state="closed"')
        expect(markup).toContain('>Configured trigger</button>')
    })
})
