import { CustomTooltip } from '@rentnerkev/tooltips'
import { playgroundDesign } from '../config/playground.config.ts'
import type { ProbeProps } from '../Types/playground.types.ts'

export function BoundaryProbe({
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
