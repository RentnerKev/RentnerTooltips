import { createContext } from 'react'

export const TooltipProviderDepthContext = createContext(0)
export const TooltipHoverableContentContext = createContext<
    boolean | undefined
>(undefined)
