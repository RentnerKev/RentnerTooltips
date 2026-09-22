import {
    CustomTooltip,
    TooltipProvider,
    type TooltipCustomDesign,
    type TooltipProps,
} from '@rentnerkev/tooltips'
import type { ChangeEventHandler, ReactNode } from 'react'
import { usePlaygroundLogic } from './Hooks/usePlaygroundLogic.js'

const playgroundDesign: TooltipCustomDesign = {
    baseClasses:
        'max-w-[250px] border border-bench-orange bg-bench-ink px-3 py-2.5 text-white shadow-[4px_4px_0_rgba(23,107,135,0.3)] dark:bg-bench-paper dark:text-bench-ink',
    animationClasses: 'tooltip-open-motion motion-reduce:animate-none',
    contentClasses: 'text-[0.72rem] leading-[1.45]',
    arrowClasses: 'fill-bench-ink dark:fill-bench-paper',
}

const sectionHeadingClasses =
    'm-0 text-[0.8rem] font-semibold tracking-[0.1em] uppercase'
const fieldDividerClasses = 'border-b border-[#c9d4da] dark:border-[#385064]'
const targetCaptionClasses =
    'm-0 font-mono text-[0.62rem] tracking-[0.06em] text-[#5f7280] uppercase dark:text-bench-steel'

interface ToggleRowProps {
    checked: boolean
    description: string
    label: string
    onChange: ChangeEventHandler<HTMLInputElement>
}

function ToggleRow({ checked, description, label, onChange }: ToggleRowProps) {
    return (
        <label
            className={`flex cursor-pointer items-center justify-between gap-3.5 py-[18px] ${fieldDividerClasses}`}
        >
            <span className="text-[0.78rem] font-bold tracking-[0.025em]">
                {label}
                <small className="mt-0.5 block text-[0.68rem] leading-[1.35] font-medium text-[#5f7280] dark:text-bench-steel">
                    {description}
                </small>
            </span>
            <input
                className="h-[19px] w-[19px] shrink-0 accent-bench-teal"
                type="checkbox"
                checked={checked}
                onChange={onChange}
            />
        </label>
    )
}

interface SignalRowProps {
    label: string
    value: ReactNode
}

function SignalRow({ label, value }: SignalRowProps) {
    return (
        <div className="flex justify-between gap-4 border-b border-dotted border-[#8295a1] py-2 dark:border-[#526a7c]">
            <dt className="text-[#5f7280] dark:text-bench-steel">{label}</dt>
            <dd className="m-0 font-extrabold text-bench-teal dark:text-[#69c7df]">
                {value}
            </dd>
        </div>
    )
}

interface ProbeProps {
    label: string
    className: string
    side: NonNullable<TooltipProps['side']>
    boundary: HTMLDivElement | null
    portalContainer: HTMLDivElement | null
    disabled: boolean
}

function BoundaryProbe({
    label,
    className,
    side,
    boundary,
    portalContainer,
    disabled,
}: ProbeProps) {
    return (
        <div className={`absolute z-10 ${className}`}>
            <CustomTooltip
                content={`${label}: Radix may flip this tooltip at the boundary.`}
                side={side}
                collisionBoundary={boundary}
                collisionPadding={18}
                portalContainer={portalContainer}
                disabled={disabled}
                customDesign={playgroundDesign}
            >
                <button
                    className="h-[38px] w-[46px] cursor-help border border-bench-ink bg-white font-mono text-[0.69rem] font-extrabold text-bench-ink shadow-[3px_3px_0_#a9b8c2] hover:bg-bench-teal hover:text-white dark:border-bench-steel dark:bg-[#142b3d] dark:text-bench-paper dark:shadow-[3px_3px_0_#385064] dark:hover:bg-bench-teal"
                    type="button"
                >
                    {label}
                </button>
            </CustomTooltip>
        </div>
    )
}

export function App() {
    const { state, handler, setter, ref } = usePlaygroundLogic()
    const collisionBoundary = ref.stageRef.current

    return (
        <div
            className={state.darkMode ? 'dark' : ''}
            data-theme={state.darkMode ? 'dark' : 'light'}
        >
            <div className="technical-grid min-h-screen bg-bench-paper py-7 text-bench-ink transition-colors duration-200 dark:bg-[#07111b] dark:text-bench-paper">
                <TooltipProvider
                    delayDuration={state.delayDuration}
                    skipDelayDuration={250}
                    disableHoverableContent={state.disableHoverableContent}
                >
                    <main className="mx-auto w-[calc(100%-2rem)] max-w-[1180px] border border-bench-steel bg-white shadow-[10px_10px_0_rgba(15,31,46,0.1)] max-[800px]:w-[calc(100%-1.25rem)] max-[800px]:max-w-[620px] dark:border-[#385064] dark:bg-bench-ink dark:shadow-[10px_10px_0_rgba(242,107,56,0.08)]">
                        <header className="flex items-end justify-between gap-8 border-b-[5px] border-bench-orange bg-bench-ink px-8 pt-7 pb-6 text-white max-[800px]:flex-col max-[800px]:items-start max-[800px]:p-6 dark:bg-[#091724]">
                            <div>
                                <p className="mb-2 font-mono text-xs font-bold tracking-[0.12em] text-[#a9dbe8] uppercase">
                                    @rentnerkev/tooltips
                                </p>
                                <h1 className="m-0 font-serif text-[clamp(2.35rem,5vw,4.8rem)] leading-[0.92] font-medium tracking-[-0.055em] max-[480px]:text-[2.65rem]">
                                    Positioning bench
                                </h1>
                                <p className="mt-[18px] mb-0 max-w-[650px] text-[0.98rem] leading-[1.6] text-[#d6e0e6]">
                                    Tune one shared provider, then test real
                                    boundaries, portal routing, disabled
                                    controls, and both color modes.
                                </p>
                            </div>
                            <div
                                className="inline-flex shrink-0 items-center gap-[9px] border border-[rgba(232,238,242,0.34)] px-[11px] py-2 font-mono text-[0.72rem] tracking-[0.03em] text-[#d6e0e6] uppercase"
                                aria-label="Provider status"
                            >
                                <span
                                    className="h-[9px] w-[9px] rounded-full bg-[#63d7a0] shadow-[0_0_0_4px_rgba(99,215,160,0.15)]"
                                    aria-hidden="true"
                                />
                                <span>Shared provider active</span>
                            </div>
                        </header>

                        <div className="grid min-h-[590px] grid-cols-[286px_minmax(0,1fr)] max-[800px]:grid-cols-1">
                            <aside
                                className="border-r border-bench-steel bg-[#f4f7f9] p-6 max-[800px]:border-r-0 max-[800px]:border-b dark:border-[#385064] dark:bg-[#122638]"
                                aria-label="Tooltip controls"
                            >
                                <div className="flex items-start justify-between gap-4 border-b border-bench-steel pb-[18px] dark:border-[#385064]">
                                    <h2 className={sectionHeadingClasses}>
                                        Provider controls
                                    </h2>
                                    <span className="bg-bench-teal px-[7px] py-[3px] text-[0.65rem] font-extrabold tracking-[0.08em] text-white uppercase">
                                        Live
                                    </span>
                                </div>

                                <label
                                    className={`grid gap-2.5 py-[22px] ${fieldDividerClasses}`}
                                    htmlFor="delay-control"
                                >
                                    <span className="flex items-baseline justify-between gap-3 text-[0.78rem] font-bold tracking-[0.025em]">
                                        Opening delay
                                        <output className="font-mono text-xs text-bench-teal dark:text-[#69c7df]">
                                            {state.delayDuration} ms
                                        </output>
                                    </span>
                                    <input
                                        className="w-full cursor-pointer accent-bench-teal"
                                        id="delay-control"
                                        type="range"
                                        min="0"
                                        max="1200"
                                        step="50"
                                        value={state.delayDuration}
                                        onChange={handler.handleDelayChange}
                                    />
                                </label>

                                <label
                                    className={`grid gap-2.5 py-[22px] ${fieldDividerClasses}`}
                                    htmlFor="side-control"
                                >
                                    <span className="text-[0.78rem] font-bold tracking-[0.025em]">
                                        Preferred side
                                    </span>
                                    <select
                                        className="w-full rounded-none border border-[#8295a1] bg-white px-3 py-2.5 text-bench-ink accent-bench-teal dark:border-[#526a7c] dark:bg-[#0c1c29] dark:text-bench-paper"
                                        id="side-control"
                                        value={state.side}
                                        onChange={handler.handleSideChange}
                                    >
                                        <option value="top">Top</option>
                                        <option value="right">Right</option>
                                        <option value="bottom">Bottom</option>
                                        <option value="left">Left</option>
                                    </select>
                                </label>

                                <ToggleRow
                                    label="Dark mode"
                                    description="Theme the complete positioning bench."
                                    checked={state.darkMode}
                                    onChange={handler.handleDarkModeChange}
                                />
                                <ToggleRow
                                    label="Disable stage tooltips"
                                    description="Triggers remain unchanged."
                                    checked={state.tooltipsDisabled}
                                    onChange={
                                        handler.handleTooltipsDisabledChange
                                    }
                                />
                                <ToggleRow
                                    label="Close when leaving trigger"
                                    description="Provider hover behavior."
                                    checked={state.disableHoverableContent}
                                    onChange={
                                        handler.handleHoverableContentChange
                                    }
                                />

                                <dl className="mt-7 grid gap-0 font-mono text-[0.68rem]">
                                    <SignalRow
                                        label="Provider instances"
                                        value="1"
                                    />
                                    <SignalRow
                                        label="Collision padding"
                                        value="18 px"
                                    />
                                    <SignalRow
                                        label="Portal target"
                                        value="Custom"
                                    />
                                    <SignalRow
                                        label="Color mode"
                                        value={
                                            state.darkMode ? 'Dark' : 'Light'
                                        }
                                    />
                                </dl>
                            </aside>

                            <section
                                className="min-w-0 px-7 pt-6 pb-[30px] max-[800px]:px-[18px] max-[800px]:pt-[22px] max-[800px]:pb-[26px] dark:bg-[#0b1824]"
                                aria-labelledby="stage-title"
                            >
                                <div className="mb-[18px] flex items-end justify-between gap-4 max-[480px]:flex-col max-[480px]:items-start">
                                    <div>
                                        <h2
                                            className={sectionHeadingClasses}
                                            id="stage-title"
                                        >
                                            Collision boundary
                                        </h2>
                                        <p className="mt-1.5 mb-0 text-[0.8rem] text-[#5f7280] dark:text-bench-steel">
                                            Move focus between targets to test
                                            shared delay.
                                        </p>
                                    </div>
                                    <span className="font-mono text-[0.7rem] text-bench-teal dark:text-[#69c7df]">
                                        640 × 460
                                    </span>
                                </div>

                                <div
                                    className="stage-grid stage-crosshair relative min-h-[460px] overflow-hidden border-2 border-bench-ink bg-[#f8fafb] max-[480px]:min-h-[520px] dark:border-bench-steel dark:bg-[#0c1c29]"
                                    ref={ref.stageRef}
                                >
                                    <span className="absolute right-2.5 bottom-[7px] z-[1] font-mono text-[0.58rem] tracking-[0.08em] text-[#70838f] uppercase dark:text-bench-steel">
                                        X boundary
                                    </span>
                                    <span className="axis-vertical absolute top-2.5 left-[7px] z-[1] font-mono text-[0.58rem] tracking-[0.08em] text-[#70838f] uppercase dark:text-bench-steel">
                                        Y boundary
                                    </span>

                                    <BoundaryProbe
                                        label="NW"
                                        className="top-3.5 left-3.5"
                                        side="top"
                                        boundary={collisionBoundary}
                                        portalContainer={state.portalContainer}
                                        disabled={state.tooltipsDisabled}
                                    />
                                    <BoundaryProbe
                                        label="NE"
                                        className="top-3.5 right-3.5"
                                        side="right"
                                        boundary={collisionBoundary}
                                        portalContainer={state.portalContainer}
                                        disabled={state.tooltipsDisabled}
                                    />
                                    <BoundaryProbe
                                        label="SW"
                                        className="bottom-3.5 left-3.5"
                                        side="left"
                                        boundary={collisionBoundary}
                                        portalContainer={state.portalContainer}
                                        disabled={state.tooltipsDisabled}
                                    />
                                    <BoundaryProbe
                                        label="SE"
                                        className="right-3.5 bottom-3.5"
                                        side="bottom"
                                        boundary={collisionBoundary}
                                        portalContainer={state.portalContainer}
                                        disabled={state.tooltipsDisabled}
                                    />

                                    <div className="absolute top-[42%] left-1/2 z-10 grid -translate-x-1/2 -translate-y-1/2 justify-items-center gap-2 text-center max-[480px]:w-[calc(100%-110px)]">
                                        <p className={targetCaptionClasses}>
                                            Provider inheritance
                                        </p>
                                        <CustomTooltip
                                            content={`Inherited ${state.delayDuration} ms delay with ${state.side} as the preferred side.`}
                                            disabled={state.tooltipsDisabled}
                                            side={state.side}
                                            collisionBoundary={
                                                collisionBoundary
                                            }
                                            collisionPadding={18}
                                            portalContainer={
                                                state.portalContainer
                                            }
                                            customDesign={playgroundDesign}
                                        >
                                            <button
                                                className="cursor-help border border-bench-ink bg-bench-teal px-4 py-3 font-bold text-white shadow-[5px_5px_0_#f26b38] hover:bg-bench-ink max-[480px]:w-full dark:border-bench-steel dark:hover:bg-[#234257]"
                                                type="button"
                                            >
                                                Inspect shared settings
                                            </button>
                                        </CustomTooltip>
                                    </div>

                                    <div className="absolute bottom-[62px] left-1/2 z-10 grid -translate-x-1/2 justify-items-center gap-2 text-center max-[480px]:w-[calc(100%-110px)]">
                                        <p className={targetCaptionClasses}>
                                            Disabled native control
                                        </p>
                                        <CustomTooltip
                                            content="The control stays disabled while its explanation remains focusable."
                                            disabled={state.tooltipsDisabled}
                                            disabledTrigger
                                            side="top"
                                            portalContainer={
                                                state.portalContainer
                                            }
                                            customDesign={playgroundDesign}
                                        >
                                            <button
                                                className="border border-dashed border-[#8295a1] bg-[#dfe6ea] px-4 py-3 font-bold text-[#647681] max-[480px]:w-full dark:border-[#526a7c] dark:bg-[#203544] dark:text-bench-steel"
                                                type="button"
                                                disabled
                                                aria-label="Locked deployment"
                                            >
                                                Locked deployment
                                            </button>
                                        </CustomTooltip>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <section className="flex min-h-[90px] items-center border-t border-bench-steel bg-bench-paper px-8 py-5 dark:border-[#385064] dark:bg-[#122638]">
                            <div>
                                <h2 className={sectionHeadingClasses}>
                                    Standalone compatibility
                                </h2>
                                <p className="mt-[7px] mb-0 max-w-[650px] text-[0.78rem] leading-[1.5] text-[#526674] dark:text-bench-steel">
                                    This sample sits outside the shared provider
                                    and uses the automatic 200 ms fallback
                                    provider.
                                </p>
                            </div>
                        </section>
                    </main>
                </TooltipProvider>

                <div className="mx-auto mb-5 flex w-[calc(100%-2rem)] max-w-[1180px] justify-center border border-t-0 border-bench-steel bg-[#dce5ea] p-5 max-[800px]:w-[calc(100%-1.25rem)] max-[800px]:max-w-[620px] dark:border-[#385064] dark:bg-[#0a1824]">
                    <CustomTooltip
                        content="No surrounding provider required."
                        side="top"
                        customDesign={playgroundDesign}
                    >
                        <button
                            className="cursor-help border border-bench-ink bg-transparent px-4 py-3 font-bold text-bench-ink hover:bg-bench-ink hover:text-white dark:border-bench-steel dark:text-bench-paper dark:hover:bg-bench-paper dark:hover:text-bench-ink"
                            type="button"
                        >
                            Test standalone tooltip
                        </button>
                    </CustomTooltip>
                </div>

                <div id="tooltip-portal-host" ref={setter.setPortalContainer} />
            </div>
        </div>
    )
}
