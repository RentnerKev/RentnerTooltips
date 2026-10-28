import { createContext } from 'react'
import type { TooltipBehavior } from './Types/tooltip-behavior.types.ts'
import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
} from './Types/tooltip.types.ts'

export const TooltipDesignContext = createContext<TooltipCustomDesign>({})
export const TooltipDefaultsContext = createContext<TooltipDefaults>({})
export const TooltipClassNamesContext = createContext<TooltipClassNames>({})
export const TooltipProviderDepthContext = createContext(0)
export const TooltipBehaviorContext = createContext<TooltipBehavior | null>(
    null,
)
export const TooltipHoverableContentContext = createContext<
    boolean | undefined
>(undefined)
