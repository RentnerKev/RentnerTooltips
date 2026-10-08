import { createContext } from 'react'
import type { TooltipCustomDesign } from './Types/tooltip.types.ts'

export const TooltipDesignContext = createContext<TooltipCustomDesign>({})
export const TooltipProviderDepthContext = createContext(0)
export const TooltipHoverableContentContext = createContext<
    boolean | undefined
>(undefined)
