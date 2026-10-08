import { useContext, useMemo } from 'react'
import {
    TooltipDesignContext,
    TooltipProviderDepthContext,
} from '../TooltipContext.ts'
import type {
    TooltipProviderLogicProps,
    TooltipProviderLogicResult,
} from '../Types/tooltip-provider-logic.types.ts'

export function useTooltipProviderLogic({
    customDesign,
}: TooltipProviderLogicProps): TooltipProviderLogicResult {
    const providerDepth = useContext(TooltipProviderDepthContext)
    const inheritedDesign = useContext(TooltipDesignContext)
    const design = useMemo(
        () => ({ ...inheritedDesign, ...customDesign }),
        [inheritedDesign, customDesign],
    )

    return {
        state: {
            hasProvider: providerDepth > 0,
            nextProviderDepth: providerDepth + 1,
            design,
        },
    }
}
