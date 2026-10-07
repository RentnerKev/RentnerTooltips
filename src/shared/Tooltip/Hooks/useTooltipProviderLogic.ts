import { useContext } from 'react'
import { TooltipProviderDepthContext } from '../TooltipContext.js'
import type { TooltipProviderLogicResult } from '../Types/tooltip-provider-logic.types.js'
export function useTooltipProviderLogic(): TooltipProviderLogicResult {
    const providerDepth = useContext(TooltipProviderDepthContext)
    return {
        state: {
            hasProvider: providerDepth > 0,
            nextProviderDepth: providerDepth + 1,
        },
    }
}
