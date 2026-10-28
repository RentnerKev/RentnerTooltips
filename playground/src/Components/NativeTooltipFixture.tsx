import { useCallback, useState } from 'react'
import type { ComponentPropsWithRef } from 'react'
import { createRoot } from 'react-dom/client'
import { CustomTooltip, TooltipProvider } from '@rentnerkev/tooltips'

function ForwardedTrigger(props: ComponentPropsWithRef<'button'>) {
    return <button type="button" {...props} />
}

function Fixture() {
    const [visible, setVisible] = useState(true)
    const [disabled, setDisabled] = useState(false)
    const [shadow, setShadow] = useState<ShadowRoot | null>(null)
    const [portal, setPortal] = useState<HTMLDivElement | null>(null)
    const [boundary, setBoundary] = useState<HTMLDivElement | null>(null)
    const [open, setOpen] = useState(false)
    const [accepted, setAccepted] = useState(true)
    const [changes, setChanges] = useState<string[]>([])
    const [mounts, setMounts] = useState(0)
    const [cleanups, setCleanups] = useState(0)
    const [clicks, setClicks] = useState(0)
    const [submits, setSubmits] = useState(0)
    const [changingOpen, setChangingOpen] = useState(false)
    const [alternateTrigger, setAlternateTrigger] = useState(false)
    const [changingRefs, setChangingRefs] = useState<string[]>([])
    const [stubbornOpen, setStubbornOpen] = useState(false)
    const [siblingOpen, setSiblingOpen] = useState(false)
    const [closeRequests, setCloseRequests] = useState(0)
    const [zeroSkipOpen, setZeroSkipOpen] = useState(false)
    const setChangingRef = useCallback((element: HTMLElement | null) => {
        if (!element) return
        setChangingRefs((value) => [...value, element.tagName])
        return () =>
            setChangingRefs((value) => [...value, `-${element.tagName}`])
    }, [])
    const setShadowHost = useCallback((element: HTMLDivElement | null) => {
        if (!element) return
        const root =
            element.shadowRoot ?? element.attachShadow({ mode: 'open' })
        const style = document.createElement('style')
        style.textContent =
            '[data-tooltip-content] { padding: 8px; border: 1px solid black; background: white; color: black; }'
        root.append(style)
        setShadow(root)
    }, [])
    const setChildRef = useCallback((element: HTMLButtonElement | null) => {
        if (!element) return
        setMounts((value) => value + 1)
        return () => setCleanups((value) => value + 1)
    }, [])
    return (
        <main>
            <h1>Native tooltip contracts</h1>
            <button type="button" onClick={() => setVisible((value) => !value)}>
                Toggle tooltip mount
            </button>
            <button
                type="button"
                onClick={() => setDisabled((value) => !value)}
            >
                Toggle disabled
            </button>
            <button type="button" onClick={() => setOpen((value) => !value)}>
                Force controlled state
            </button>
            <button
                type="button"
                onClick={() => setAccepted((value) => !value)}
            >
                Toggle acceptance
            </button>
            <button type="button" data-testid="outside">
                Outside
            </button>
            <output data-testid="ref-mounts">{mounts}</output>
            <output data-testid="ref-cleanups">{cleanups}</output>
            <output data-testid="child-clicks">{clicks}</output>
            <output data-testid="native-submits">{submits}</output>
            <button type="button" onClick={() => setChangingOpen(true)}>
                Open changing trigger
            </button>
            <button
                type="button"
                onClick={() => setAlternateTrigger((value) => !value)}
            >
                Swap changing trigger
            </button>
            <button type="button" onClick={() => setStubbornOpen(true)}>
                Open stubborn tooltip
            </button>
            <button type="button" onClick={() => setSiblingOpen(true)}>
                Open sibling tooltip
            </button>
            <output data-testid="changing-refs">
                {changingRefs.join(',')}
            </output>
            <output data-testid="stubborn-close-requests">
                {closeRequests}
            </output>
            <output data-testid="controlled-changes">
                {changes.join(',')}
            </output>
            <p id="persistent-description">Existing description</p>
            <div ref={setShadowHost} data-testid="native-shadow-host" />
            <div style={{ height: 30 }} />
            <TooltipProvider delayDuration={100}>
                {visible && (
                    <>
                        <CustomTooltip
                            content="Changing trigger help"
                            open={changingOpen}
                            onOpenChange={setChangingOpen}
                        >
                            {alternateTrigger ? (
                                <a
                                    href="#changed"
                                    ref={setChangingRef}
                                    data-testid="changing-trigger"
                                    onPointerDown={(event) =>
                                        event.preventDefault()
                                    }
                                    style={{
                                        position: 'fixed',
                                        left: 700,
                                        top: 350,
                                    }}
                                >
                                    Changed link
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    ref={setChangingRef}
                                    data-testid="changing-trigger"
                                    style={{
                                        position: 'fixed',
                                        left: 100,
                                        top: 350,
                                    }}
                                >
                                    Original button
                                </button>
                            )}
                        </CustomTooltip>
                        <CustomTooltip
                            content="Stubborn tooltip"
                            open={stubbornOpen}
                            onOpenChange={(value) => {
                                if (!value)
                                    setCloseRequests((count) => count + 1)
                            }}
                        >
                            <button type="button">Stubborn trigger</button>
                        </CustomTooltip>
                        <CustomTooltip
                            content="Sibling tooltip"
                            open={siblingOpen}
                            onOpenChange={setSiblingOpen}
                        >
                            <button type="button">Sibling trigger</button>
                        </CustomTooltip>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault()
                                setSubmits((value) => value + 1)
                            }}
                        >
                            <CustomTooltip content="Default button help">
                                <button data-testid="implicit-type-trigger">
                                    Implicit button type
                                </button>
                            </CustomTooltip>
                            <CustomTooltip content="Submit help">
                                <button
                                    type="submit"
                                    data-testid="explicit-submit-trigger"
                                >
                                    Explicit submit
                                </button>
                            </CustomTooltip>
                        </form>
                        <CustomTooltip
                            content="Composed help"
                            disabled={disabled}
                        >
                            <ForwardedTrigger
                                ref={setChildRef}
                                aria-describedby="persistent-description"
                                data-testid="composed-trigger"
                                onClick={() => setClicks((value) => value + 1)}
                            >
                                Composed trigger
                            </ForwardedTrigger>
                        </CustomTooltip>
                        <CustomTooltip
                            content="Cancelled help"
                            delayDuration={0}
                        >
                            <button
                                type="button"
                                data-testid="cancelled-trigger"
                                onPointerMove={(event) =>
                                    event.preventDefault()
                                }
                                onFocus={(event) => event.preventDefault()}
                            >
                                Cancelled events
                            </button>
                        </CustomTooltip>
                        <CustomTooltip
                            content="Shadow help"
                            portalContainer={shadow}
                            showArrow={false}
                            side="bottom"
                            align="start"
                            sideOffset={10}
                        >
                            <button
                                type="button"
                                data-testid="native-shadow-trigger"
                            >
                                Shadow trigger
                            </button>
                        </CustomTooltip>
                        <CustomTooltip
                            content="Controlled help"
                            open={open}
                            onOpenChange={(value) => {
                                setChanges((previous) => [
                                    ...previous,
                                    String(value),
                                ])
                                if (accepted) setOpen(value)
                            }}
                        >
                            <button
                                type="button"
                                data-testid="native-controlled-trigger"
                            >
                                Controlled trigger
                            </button>
                        </CustomTooltip>
                        <div
                            style={{
                                transform: 'translate(40px, 20px) scale(1.25)',
                                transformOrigin: 'top left',
                                marginTop: 30,
                                border: '8px solid transparent',
                                width: 360,
                                height: 140,
                            }}
                            data-testid="transformed-container"
                        >
                            <div ref={setPortal} />
                            <CustomTooltip
                                content="Transformed help"
                                portalContainer={portal}
                                showArrow={false}
                                side="bottom"
                                sideOffset={10}
                                align="start"
                                avoidCollisions={false}
                            >
                                <button
                                    type="button"
                                    data-testid="transformed-trigger"
                                >
                                    Transformed trigger
                                </button>
                            </CustomTooltip>
                        </div>
                        <div
                            ref={setBoundary}
                            data-testid="native-collision-boundary"
                            style={{
                                width: 280,
                                height: 120,
                                marginTop: 30,
                                border: '1px solid black',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <CustomTooltip
                                content="Clipped boundary help"
                                side="right"
                                collisionBoundary={[boundary, null]}
                                collisionPadding={{
                                    left: 10,
                                    right: 10,
                                    top: 10,
                                    bottom: 10,
                                }}
                                hideWhenDetached
                            >
                                <button
                                    type="button"
                                    data-testid="native-collision-trigger"
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 40,
                                    }}
                                >
                                    Boundary trigger
                                </button>
                            </CustomTooltip>
                        </div>
                        <CustomTooltip
                            content="This deliberately long tooltip must retain its natural width outside the explicit collision boundary."
                            side="right"
                            collisionBoundary={boundary}
                            avoidCollisions={false}
                        >
                            <button
                                type="button"
                                data-testid="unconstrained-trigger"
                            >
                                Unconstrained trigger
                            </button>
                        </CustomTooltip>
                    </>
                )}
            </TooltipProvider>
            {visible && (
                <>
                    <TooltipProvider
                        delayDuration={100}
                        skipDelayDuration={0}
                        disableHoverableContent
                    >
                        <CustomTooltip
                            content="Zero skip first help"
                            open={zeroSkipOpen}
                            onOpenChange={(value) => {
                                if (value) setZeroSkipOpen(true)
                            }}
                        >
                            <button
                                type="button"
                                data-testid="zero-skip-first"
                                style={{
                                    position: 'fixed',
                                    left: 600,
                                    top: 500,
                                    width: 120,
                                    height: 30,
                                }}
                            >
                                Zero skip first
                            </button>
                        </CustomTooltip>
                        <CustomTooltip content="Zero skip second help">
                            <button
                                type="button"
                                data-testid="zero-skip-second"
                                style={{
                                    position: 'fixed',
                                    left: 750,
                                    top: 500,
                                    width: 120,
                                    height: 30,
                                }}
                            >
                                Zero skip second
                            </button>
                        </CustomTooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={0}>
                        <CustomTooltip
                            content="Transit original help"
                            side="bottom"
                            sideOffset={100}
                            showArrow={false}
                            avoidCollisions={false}
                        >
                            <button
                                type="button"
                                data-testid="transit-first"
                                style={{
                                    position: 'fixed',
                                    left: 400,
                                    top: 300,
                                    width: 120,
                                    height: 30,
                                }}
                            >
                                Transit first
                            </button>
                        </CustomTooltip>
                        <CustomTooltip content="Transit sibling help">
                            <button
                                type="button"
                                data-testid="transit-sibling"
                                style={{
                                    position: 'fixed',
                                    left: 400,
                                    top: 370,
                                    width: 120,
                                    height: 30,
                                }}
                            >
                                Transit sibling
                            </button>
                        </CustomTooltip>
                    </TooltipProvider>
                </>
            )}
        </main>
    )
}

let dispose: (() => void) | undefined

export function mountFixture() {
    dispose?.()
    document.getElementById('root')!.style.display = 'none'
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    root.render(<Fixture />)
    dispose = () => {
        root.unmount()
        host.remove()
    }
}

export function unmountFixture() {
    dispose?.()
    dispose = undefined
}
