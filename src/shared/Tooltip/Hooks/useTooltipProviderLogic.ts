import { useContext, useMemo } from 'react'
import {
    TooltipDesignContext,
    TooltipDefaultsContext,
    TooltipClassNamesContext,
    TooltipProviderDepthContext,
} from '../TooltipContext.ts'
import { mergeTooltipDefaults } from '../../../lib/Tooltip/tooltipDefaults.ts'
import type {
    TooltipProviderLogicProps,
    TooltipProviderLogicResult,
} from '../Types/tooltip-provider-logic.types.ts'

export function useTooltipProviderLogic({
    customDesign,
    classNames,
    ...localDefaults
}: TooltipProviderLogicProps): TooltipProviderLogicResult {
    const providerDepth = useContext(TooltipProviderDepthContext)
    const inheritedDesign = useContext(TooltipDesignContext)
    const inheritedDefaults = useContext(TooltipDefaultsContext)
    const inheritedClassNames = useContext(TooltipClassNamesContext)
    const design = useMemo(
        () => mergeTooltipDefaults(inheritedDesign, customDesign),
        [inheritedDesign, customDesign],
    )
    const slots = useMemo(
        () => mergeTooltipDefaults(inheritedClassNames, classNames),
        [inheritedClassNames, classNames],
    )
    return {
        state: {
            hasProvider: providerDepth > 0,
            nextProviderDepth: providerDepth + 1,
            design,
            defaults: mergeTooltipDefaults(inheritedDefaults, localDefaults),
            classNames: slots,
        },
    }
}
