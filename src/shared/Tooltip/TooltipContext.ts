import { createContext } from 'react'
import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
} from './Types/tooltip.types.ts'

export const TooltipDesignContext = createContext<TooltipCustomDesign>({})
export const TooltipDefaultsContext = createContext<TooltipDefaults>({})
export const TooltipClassNamesContext = createContext<TooltipClassNames>({})
export const TooltipProviderDepthContext = createContext(0)
export const TooltipHoverableContentContext = createContext<
    boolean | undefined
>(undefined)
