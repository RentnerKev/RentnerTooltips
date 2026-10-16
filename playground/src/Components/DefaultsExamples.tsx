import { CustomTooltip, TooltipProvider } from '@rentnerkev/tooltips'
import { useDefaultsExamplesLogic } from '../Hooks/useDefaultsExamplesLogic.ts'

export function DefaultsExamples() {
    const {
        state,
        refs: { portalContainerRef },
    } = useDefaultsExamplesLogic()
    return (
        <section
            className="mx-auto max-w-4xl space-y-4 p-8"
            aria-label="Provider defaults examples"
        >
            <h2 className="text-lg font-semibold">Provider defaults</h2>
            <div
                ref={portalContainerRef}
                data-testid="defaults-portal-host"
                className="[--rentner-surface:#ffffff] [--rentner-foreground:#111827] [--rentner-border:#64748b]"
            />
            <TooltipProvider
                delayDuration={0}
                side="right"
                sideOffset={14}
                align="start"
                avoidCollisions={false}
                collisionPadding={24}
                portalContainer={state.portalContainer}
                portalClassName="tooltip-contract-portal"
                portalZIndex={12345}
                size="lg"
                showArrow={false}
            >
                <div className="flex gap-4">
                    <CustomTooltip content="Inherited provider defaults">
                        <button
                            type="button"
                            data-testid="defaults-trigger"
                            className="rounded border p-3"
                        >
                            Inherited defaults
                        </button>
                    </CustomTooltip>
                    <CustomTooltip
                        content="Local settings"
                        side="bottom"
                        align="end"
                        sideOffset={2}
                        portalZIndex={54321}
                        size="sm"
                        showArrow
                        classNames={{
                            content:
                                'rounded-none bg-fuchsia-950 p-2 text-xs text-white',
                            arrow: 'fill-fuchsia-950',
                            animation: '',
                        }}
                    >
                        <button
                            type="button"
                            data-testid="defaults-local-trigger"
                            className="rounded border p-3"
                        >
                            Local defaults
                        </button>
                    </CustomTooltip>
                    <TooltipProvider side="left" portalZIndex={23456}>
                        <CustomTooltip content="Nested defaults">
                            <button
                                type="button"
                                data-testid="defaults-nested-trigger"
                                className="rounded border p-3"
                            >
                                Nested defaults
                            </button>
                        </CustomTooltip>
                    </TooltipProvider>
                </div>
            </TooltipProvider>
        </section>
    )
}
