import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { createContext, useContext } from 'react'
import type { TooltipProviderProps } from './types.js'

const DEFAULT_DELAY_DURATION = 200

export const TooltipProviderDepthContext = createContext(0)

export function TooltipProvider({
    children,
    delayDuration = DEFAULT_DELAY_DURATION,
    skipDelayDuration,
    disableHoverableContent,
}: TooltipProviderProps) {
    const providerDepth = useContext(TooltipProviderDepthContext)

    if (providerDepth > 0) return children

    return (
        <TooltipProviderDepthContext.Provider value={providerDepth + 1}>
            <TooltipPrimitive.Provider
                delayDuration={delayDuration}
                skipDelayDuration={skipDelayDuration}
                disableHoverableContent={disableHoverableContent}
            >
                {children}
            </TooltipPrimitive.Provider>
        </TooltipProviderDepthContext.Provider>
    )
}
