import { CustomTooltip } from '../../../shared/Tooltip/Components/CustomTooltip.tsx'
import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { TooltipProvider } from '../../../shared/Tooltip/Components/TooltipProvider.tsx'
import { useCustomTooltipLogic } from '../../../shared/Tooltip/Hooks/useCustomTooltipLogic.ts'
import type { TooltipProps } from '../../../shared/Tooltip/Types/tooltip.types.ts'

function Probe(props: Omit<TooltipProps, 'children' | 'content'>) {
    const { state } = useCustomTooltipLogic(props)
    return (
        <output>
            {JSON.stringify({
                defaults: state.defaults,
                content: state.contentClassName,
                arrow: state.arrowClassName,
            })}
        </output>
    )
}

test('inherits provider defaults and defined nested/local overrides including false, zero and null', () => {
    const markup = renderToStaticMarkup(
        <TooltipProvider
            side="right"
            sideOffset={14}
            portalZIndex={12000}
            showArrow
            size="lg"
            classNames={{ content: 'provider', arrow: 'provider-arrow' }}
        >
            <TooltipProvider side="left" sideOffset={0} showArrow={false}>
                <Probe
                    align="end"
                    portalContainer={null}
                    portalZIndex={0}
                    classNames={{ content: 'local', arrow: '' }}
                />
            </TooltipProvider>
        </TooltipProvider>,
    )
    expect(markup).toBe(
        renderToStaticMarkup(
            <output>
                {JSON.stringify({
                    defaults: {
                        side: 'left',
                        sideOffset: 0,
                        portalZIndex: 0,
                        showArrow: false,
                        size: 'lg',
                        align: 'end',
                        portalContainer: null,
                    },
                    content: 'local',
                    arrow: '',
                })}
            </output>,
        ),
    )
})

test('slots replace visual defaults and undefined local settings retain inherited values', () => {
    const markup = renderToStaticMarkup(
        <TooltipProvider
            side="bottom"
            classNames={{ content: 'p-2 bg-white', animation: '' }}
        >
            <Probe side={undefined} classNames={{ content: undefined }} />
        </TooltipProvider>,
    )
    expect(markup).toContain('p-2 bg-white')
    expect(markup).not.toContain('rounded-rentner-control')
    expect(markup).toContain('bottom')
})

test('replaces disabled trigger visuals while preserving legacy classes and keyboard semantics', () => {
    const markup = renderToStaticMarkup(
        <TooltipProvider
            classNames={{ disabledTrigger: 'rounded-none bg-white' }}
        >
            <CustomTooltip
                content="Unavailable"
                disabledTrigger
                disabledTriggerClassName="legacy-size"
            >
                <button type="button" disabled aria-label="Delete">
                    Delete
                </button>
            </CustomTooltip>
        </TooltipProvider>,
    )
    expect(markup).toContain('rounded-none bg-white')
    expect(markup).not.toContain('rounded-sm')
    expect(markup).toContain('legacy-size')
    expect(markup).toContain('focus-visible:ring-rentner-accent')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('aria-disabled="true"')
})
