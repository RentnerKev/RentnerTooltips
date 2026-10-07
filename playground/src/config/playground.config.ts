import type { TooltipCustomDesign } from '@rentnerkev/tooltips'

export const playgroundDesign: TooltipCustomDesign = {
    baseClasses:
        'max-w-[250px] border border-bench-orange bg-bench-ink px-3 py-2.5 text-white shadow-[4px_4px_0_rgba(23,107,135,0.3)] dark:bg-bench-paper dark:text-bench-ink',
    animationClasses: 'tooltip-open-motion motion-reduce:!animate-none',
    contentClasses: 'text-[0.72rem] leading-[1.45]',
    arrowClasses: 'fill-bench-ink dark:fill-bench-paper',
}

export const sectionHeadingClasses =
    'm-0 text-[0.8rem] font-semibold tracking-[0.1em] uppercase'
export const fieldDividerClasses =
    'border-b border-[#c9d4da] dark:border-[#385064]'
export const targetCaptionClasses =
    'm-0 font-mono text-[0.62rem] tracking-[0.06em] text-[#5f7280] uppercase dark:text-bench-steel'
