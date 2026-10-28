import {
    StrictMode,
    useCallback,
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

type Mode = 'direct' | 'provider' | 'nested'
let root: Root | undefined
let host: HTMLDivElement | undefined
let padding: { left?: number }
let boundaries: (Element | null)[]
let replacementBoundary: Element | null
let replaceEqual: () => void
let published: TooltipDefaults
let renders = 0
const emptyDefaults = {}

function ProviderContent() {
    const defaults = useContext(TooltipDefaultsContext)
    renders++
    useLayoutEffect(() => {
        published = defaults
    })
    return <Content />
}

function Content({ defaults = emptyDefaults }: { defaults?: TooltipDefaults }) {
    return (
        <div style={{ position: 'absolute', left: 200, top: 200 }}>
            <CustomTooltip
                open
                content="Live collision help"
                side="bottom"
                align="start"
                sticky="always"
                showArrow={false}
                {...defaults}
            >
                <button type="button" data-measured-trigger>
                    Live target
                </button>
            </CustomTooltip>
        </div>
    )
}

function Fixture({ mode }: { mode: Mode }) {
    const [second, setSecond] = useState<HTMLDivElement | null>(null)
    const [currentPadding, setPadding] = useState<{ left?: number }>({
        left: 8,
    })
    const [currentBoundaries, setBoundaries] = useState<(Element | null)[]>([])
    const bindFirst = useCallback((node: HTMLDivElement | null) => {
        if (node)
            setBoundaries((previous) =>
                previous[0] === node ? previous : [node, null],
            )
    }, [])
    useLayoutEffect(() => {
        padding = currentPadding
        boundaries = currentBoundaries
        replacementBoundary = second
        replaceEqual = () => {
            setPadding({ ...currentPadding })
            setBoundaries([...currentBoundaries])
        }
    })
    const children = useMemo(() => <ProviderContent />, [])
    const defaults = {
        collisionBoundary: currentBoundaries,
        collisionPadding: currentPadding,
    }
    return (
        <>
            <div
                ref={bindFirst}
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
                ref={setSecond}
                style={{
                    position: 'absolute',
                    left: 300,
                    top: 100,
                    width: 500,
                    height: 500,
                    pointerEvents: 'none',
                }}
            />
            {mode === 'direct' ? (
                <Content defaults={defaults} />
            ) : (
                <TooltipProvider {...defaults}>
                    {mode === 'nested' ? (
                        <TooltipProvider>{children}</TooltipProvider>
                    ) : (
                        children
                    )}
                </TooltipProvider>
            )}
        </>
    )
}

export function mountFixture(mode: Mode) {
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

export function replaceEqualContainers() {
    flushSync(() => replaceEqual())
}

export function mutatePadding(left: number, enumerable = true) {
    Object.defineProperty(padding, 'left', {
        value: left,
        enumerable,
        configurable: true,
        writable: true,
    })
}

export function mutateBoundary(action: 'replace' | 'push' | 'remove') {
    if (action === 'replace') boundaries[0] = replacementBoundary
    if (action === 'push') boundaries.push(replacementBoundary)
    if (action === 'remove') boundaries.splice(0, boundaries.length)
}

export function readState() {
    const positioner = document.querySelector(
        '[data-tooltip-content]',
    )!.parentElement!
    return {
        left: Number.parseFloat(positioner.style.left),
        originals:
            published?.collisionPadding === padding &&
            published?.collisionBoundary === boundaries,
        renders,
    }
}

export function unmountFixture() {
    flushSync(() => root?.unmount())
    host?.remove()
}
