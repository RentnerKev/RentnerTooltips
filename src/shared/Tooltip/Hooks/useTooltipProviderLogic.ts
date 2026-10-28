import { useContext, useMemo, useState } from 'react'
import { createTooltipTiming } from '../../../lib/Tooltip/tooltipCoordination.ts'
import { useStableTooltipDefaults } from './useStableTooltipDefaults.ts'
import {
    TooltipDesignContext,
    TooltipDefaultsContext,
    TooltipClassNamesContext,
    TooltipProviderDepthContext,
    TooltipBehaviorContext,
} from '../TooltipContext.ts'
import { mergeTooltipDefaults } from '../../../lib/Tooltip/tooltipDefaults.ts'
import type {
    TooltipProviderLogicProps,
    TooltipProviderLogicResult,
} from '../Types/tooltip-provider-logic.types.ts'

export function useTooltipProviderLogic({
    customDesign,
    classNames,
    delayDuration = 200,
    skipDelayDuration = 300,
    disableHoverableContent: _disableHoverableContent,
    ...localDefaults
}: TooltipProviderLogicProps): TooltipProviderLogicResult {
    const providerDepth = useContext(TooltipProviderDepthContext)
    const inheritedDesign = useContext(TooltipDesignContext)
    const inheritedDefaults = useContext(TooltipDefaultsContext)
    const inheritedClassNames = useContext(TooltipClassNamesContext)
    const inheritedBehavior = useContext(TooltipBehaviorContext)
    const [timing] = useState(
        () => inheritedBehavior?.timing ?? createTooltipTiming(),
    )
    const behavior = useMemo(
        () =>
            inheritedBehavior ?? {
                delayDuration,
                skipDelayDuration,
                timing,
            },
        [inheritedBehavior, delayDuration, skipDelayDuration, timing],
    )
    const design = useMemo(
        () => mergeTooltipDefaults(inheritedDesign, customDesign),
        [inheritedDesign, customDesign],
    )
    const slots = useMemo(
        () => mergeTooltipDefaults(inheritedClassNames, classNames),
        [inheritedClassNames, classNames],
    )
    const defaults = useStableTooltipDefaults(
        mergeTooltipDefaults(inheritedDefaults, localDefaults),
    )
    return {
        state: {
            hasProvider: providerDepth > 0,
            nextProviderDepth: providerDepth + 1,
            design,
            defaults,
            classNames: slots,
            behavior,
        },
    }
}
