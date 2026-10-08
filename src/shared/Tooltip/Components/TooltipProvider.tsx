import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { TooltipProviderProps } from '../Types/tooltip.types.ts'
import {
    TooltipDesignContext,
    TooltipProviderDepthContext,
    TooltipHoverableContentContext,
} from '../TooltipContext.ts'
import { useTooltipProviderLogic } from '../Hooks/useTooltipProviderLogic.ts'

export function TooltipProvider({
    children,
    customDesign,
    delayDuration = 200,
    skipDelayDuration,
    disableHoverableContent,
}: TooltipProviderProps) {
    const { state } = useTooltipProviderLogic({ customDesign })

    return (
        <TooltipDesignContext.Provider value={state.design}>
            {state.hasProvider ? (
                children
            ) : (
                <TooltipProviderDepthContext.Provider
                    value={state.nextProviderDepth}
                >
                    <TooltipHoverableContentContext.Provider
                        value={disableHoverableContent}
                    >
                        <TooltipPrimitive.Provider
                            delayDuration={delayDuration}
                            skipDelayDuration={skipDelayDuration}
                            disableHoverableContent={disableHoverableContent}
                        >
                            {children}
                        </TooltipPrimitive.Provider>
                    </TooltipHoverableContentContext.Provider>
                </TooltipProviderDepthContext.Provider>
            )}
        </TooltipDesignContext.Provider>
    )
}
