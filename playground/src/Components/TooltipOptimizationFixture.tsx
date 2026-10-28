import {
    StrictMode,
    useContext,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { CustomTooltip, TooltipProvider } from '@rentnerkev/tooltips'
import type { TooltipDefaults } from '../../../src/shared/Tooltip/Types/tooltip.types.ts'
import { TooltipDefaultsContext } from '../../../src/shared/Tooltip/TooltipContext.ts'

let consumerRenders = 0
let root: Root | undefined
let host: HTMLDivElement | undefined
let change: (values: Partial<FixtureOptions>) => void
interface FixtureOptions {
    tick: number
    offset: number
    padding: number
    bounded: boolean
    alternate: boolean
    customPortal: boolean
    clipping: boolean
    provider: TooltipDefaults
}

function CountedTooltip({ index }: { index: number }) {
    useContext(TooltipDefaultsContext)
    consumerRenders++
    return (
        <CustomTooltip content={`Help ${index}`}>
            <button type="button">Target {index}</button>
        </CustomTooltip>
    )
}

function Fixture({ mode }: { mode: 'provider' | 'geometry' }) {
    const [options, setOptions] = useState<FixtureOptions>({
        tick: 0,
        offset: 8,
        padding: 8,
        bounded: true,
        alternate: false,
        customPortal: false,
        clipping: false,
        provider: {},
    })
    const [boundary, setBoundary] = useState<HTMLDivElement | null>(null)
    const [portal, setPortal] = useState<HTMLDivElement | null>(null)
    useLayoutEffect(() => {
        change = (values) =>
            setOptions((previous) => ({ ...previous, ...values }))
    }, [])
    const children = useMemo(
        () =>
            Array.from({ length: 500 }, (_, index) => (
                <CountedTooltip key={index} index={index} />
            )),
        [],
    )
    let probe = (
        <CustomTooltip
            open
            content="Measured help"
            side="bottom"
            align="start"
            sideOffset={options.offset}
            showArrow={false}
            hideWhenDetached
            collisionBoundary={[options.bounded ? boundary : null, null]}
            collisionPadding={{
                top: 8,
                right: 8,
                bottom: 8,
                left: options.padding,
            }}
            portalContainer={options.customPortal ? portal : null}
        >
            {options.alternate ? (
                <a href="#target" data-measured-trigger>
                    Measured target
                </a>
            ) : (
                <button type="button" data-measured-trigger>
                    Measured target
                </button>
            )}
        </CustomTooltip>
    )
    for (let index = 0; index < 20; index++)
        probe = (
            <div
                key={index}
                data-measured-ancestor={index}
                style={{
                    overflow:
                        options.clipping && index < 2 ? 'hidden' : 'visible',
                    width: 400,
                    height: 80,
                }}
            >
                {probe}
            </div>
        )
    return (
        <main>
            <div
                ref={setBoundary}
                data-testid="operation-boundary"
                style={{
                    position: 'absolute',
                    left: 100,
                    top: 100,
                    width: 800,
                    height: 500,
                    pointerEvents: 'none',
                }}
            />
            <div
                ref={setPortal}
                data-testid="operation-portal"
                style={{ translate: '20px 10px' }}
            />
            <output data-testid="operation-tick">{options.tick}</output>
            {mode === 'provider' ? (
                <TooltipProvider
                    collisionBoundary={[boundary, null]}
                    collisionPadding={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    {...options.provider}
                >
                    {children}
                </TooltipProvider>
            ) : (
                <div style={{ position: 'absolute', left: 200, top: 200 }}>
                    {probe}
                </div>
            )}
        </main>
    )
}

export function mountFixture(mode: 'provider' | 'geometry') {
    const app = document.querySelector('#root')
    if (app instanceof HTMLElement) app.style.display = 'none'
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    flushSync(() =>
        root!.render(
            <StrictMode>
                <Fixture mode={mode} />
            </StrictMode>,
        ),
    )
}

export function updateFixture(values: Partial<FixtureOptions>) {
    flushSync(() => change(values))
}

export function resetRenders() {
    consumerRenders = 0
}
export function readPosition() {
    const content = document.querySelector('[data-tooltip-content]')!
    const positioner = content.parentElement!
    return { top: positioner.style.top, left: positioner.style.left }
}
export function readRenders() {
    return consumerRenders
}
export function unmountFixture() {
    flushSync(() => root?.unmount())
    host?.remove()
}
