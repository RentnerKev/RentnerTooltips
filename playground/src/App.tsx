import { CustomTooltip, TooltipProvider } from '@rentnerkev/tooltips'
import { usePlaygroundLogic } from './Hooks/usePlaygroundLogic.ts'
import { ToggleRow } from './Components/ToggleRow.tsx'
import { SignalRow } from './Components/SignalRow.tsx'
import { BoundaryProbe } from './Components/BoundaryProbe.tsx'
import {
    playgroundDesign,
    sectionHeadingClasses,
    fieldDividerClasses,
    targetCaptionClasses,
} from './config/playground.config.ts'

export function App() {
    const {
        state,
        handler,
        setter,
        refs: { handleStageMount, handlePortalMount },
    } = usePlaygroundLogic()
    const collisionBoundary = state.collisionBoundary

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
                                    ref={handleStageMount}
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
                                                data-testid="provider-trigger"
                                                className="cursor-help border border-bench-ink bg-bench-teal px-4 py-3 font-bold text-white shadow-[5px_5px_0_#f26b38] hover:bg-bench-ink max-[480px]:w-full dark:border-bench-steel dark:hover:bg-[#234257]"
                                                type="button"
                                            >
                                                Inspect shared settings
                                            </button>
                                        </CustomTooltip>
                                    </div>

                                    <div className="absolute bottom-[112px] left-1/2 z-10 grid -translate-x-1/2 justify-items-center gap-2 text-center max-[480px]:w-[calc(100%-110px)]">
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
                                                data-testid="disabled-trigger"
                                                className="border border-dashed border-[#8295a1] bg-[#dfe6ea] px-4 py-3 font-bold text-[#647681] max-[480px]:w-full dark:border-[#526a7c] dark:bg-[#203544] dark:text-bench-steel"
                                                type="button"
                                                disabled
                                                aria-label="Locked deployment"
                                            >
                                                Locked deployment
                                            </button>
                                        </CustomTooltip>
                                    </div>

                                    <div className="absolute bottom-[20px] left-1/2 z-10 grid -translate-x-1/2 justify-items-center gap-2 text-center max-[480px]:w-[calc(100%-110px)]">
                                        <p
                                            className={`${targetCaptionClasses} text-[#364c5b] dark:text-[#d6e0e6]`}
                                        >
                                            Enabled child safety
                                        </p>
                                        <CustomTooltip
                                            content="This accidentally enabled control cannot be activated."
                                            disabledTrigger
                                            side="top"
                                            portalContainer={
                                                state.portalContainer
                                            }
                                            customDesign={playgroundDesign}
                                        >
                                            <button
                                                data-testid="accidentally-enabled-trigger"
                                                className="border border-dashed border-bench-orange bg-[#fff0e9] px-4 py-3 font-bold text-bench-ink max-[480px]:w-full dark:bg-[#39251f] dark:text-bench-paper"
                                                type="button"
                                                onClick={
                                                    handler.handleAccidentalActivation
                                                }
                                            >
                                                Accidentally enabled action
                                            </button>
                                        </CustomTooltip>
                                        <output data-testid="enabled-trigger-activations">
                                            {state.accidentalActivationCount}
                                        </output>
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

                <div className="mx-auto mb-5 flex w-[calc(100%-2rem)] max-w-[1180px] flex-wrap items-center justify-center gap-5 border border-t-0 border-bench-steel bg-[#dce5ea] p-5 max-[800px]:w-[calc(100%-1.25rem)] max-[800px]:max-w-[620px] dark:border-[#385064] dark:bg-[#0a1824]">
                    <CustomTooltip
                        content="No surrounding provider required."
                        side="top"
                        customDesign={playgroundDesign}
                    >
                        <button
                            data-testid="standalone-trigger"
                            className="cursor-help border border-bench-ink bg-transparent px-4 py-3 font-bold text-bench-ink hover:bg-bench-ink hover:text-white dark:border-bench-steel dark:text-bench-paper dark:hover:bg-bench-paper dark:hover:text-bench-ink"
                            type="button"
                        >
                            Test standalone tooltip
                        </button>
                    </CustomTooltip>
                    <div className="flex items-center gap-3">
                        <CustomTooltip
                            content="This tooltip is controlled by application state."
                            open={state.controlledOpen}
                            onOpenChange={setter.setControlledOpen}
                            side="top"
                            customDesign={playgroundDesign}
                        >
                            <button
                                data-testid="controlled-trigger"
                                className="border border-bench-ink bg-bench-orange px-4 py-3 font-bold text-bench-ink hover:bg-bench-ink hover:text-white dark:border-bench-steel"
                                type="button"
                            >
                                Controlled tooltip
                            </button>
                        </CustomTooltip>
                        <output
                            aria-live="polite"
                            data-testid="controlled-state"
                            className="font-mono text-xs"
                        >
                            {state.controlledOpen ? 'open' : 'closed'}
                        </output>
                    </div>
                </div>

                <section
                    id="tooltip-portal-host"
                    ref={handlePortalMount}
                    aria-label="Tooltip descriptions"
                />
                <section
                    aria-label="Unavailable fields"
                    className="mx-auto flex max-w-3xl flex-wrap gap-6 p-5"
                >
                    <div>
                        <label htmlFor="disabled-amount">Amount</label>
                        <CustomTooltip
                            content="The amount cannot be edited."
                            disabledTrigger
                        >
                            <input id="disabled-amount" defaultValue="12" />
                        </CustomTooltip>
                    </div>
                    <div>
                        <label htmlFor="disabled-notes">Notes</label>
                        <CustomTooltip
                            content="Notes cannot be edited."
                            disabledTrigger
                        >
                            <textarea
                                id="disabled-notes"
                                defaultValue="Draft"
                            />
                        </CustomTooltip>
                    </div>
                    <div>
                        <label id="category-label" htmlFor="disabled-category">
                            Category
                        </label>
                        <CustomTooltip
                            content="The category cannot be edited."
                            disabledTrigger
                        >
                            <select id="disabled-category" defaultValue="one">
                                <option value="one">One</option>
                            </select>
                        </CustomTooltip>
                    </div>
                </section>
            </div>
        </div>
    )
}
