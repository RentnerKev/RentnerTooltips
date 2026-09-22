import { describe, expect, test } from 'bun:test'
import { useContext } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as publicApi from '../index'
import { CustomTooltip } from '../CustomTooltip'
import {
    TooltipProvider,
    TooltipProviderDepthContext,
} from '../TooltipProvider'

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

    test('keeps standalone tooltips compatible through a fallback provider', () => {
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
        expect(markup).toContain('class="inline-flex custom-wrapper"')
        expect(markup).toContain('style="pointer-events:none"')
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
