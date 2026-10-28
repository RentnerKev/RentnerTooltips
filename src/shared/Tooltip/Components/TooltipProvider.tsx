import type { TooltipProviderProps } from '../Types/tooltip.types.ts'
import {
    TooltipDesignContext,
    TooltipDefaultsContext,
    TooltipClassNamesContext,
    TooltipProviderDepthContext,
    TooltipHoverableContentContext,
    TooltipBehaviorContext,
} from '../TooltipContext.ts'
import { useTooltipProviderLogic } from '../Hooks/useTooltipProviderLogic.ts'

export function TooltipProvider({
    children,
    disableHoverableContent,
    ...props
}: TooltipProviderProps) {
    const { state } = useTooltipProviderLogic(props)
    return (
        <TooltipDesignContext.Provider value={state.design}>
            <TooltipDefaultsContext.Provider value={state.defaults}>
                <TooltipClassNamesContext.Provider value={state.classNames}>
                    {state.hasProvider ? (
                        children
                    ) : (
                        <TooltipProviderDepthContext.Provider
                            value={state.nextProviderDepth}
                        >
                            <TooltipHoverableContentContext.Provider
                                value={disableHoverableContent}
                            >
                                <TooltipBehaviorContext.Provider
                                    value={state.behavior}
                                >
                                    {children}
                                </TooltipBehaviorContext.Provider>
                            </TooltipHoverableContentContext.Provider>
                        </TooltipProviderDepthContext.Provider>
                    )}
                </TooltipClassNamesContext.Provider>
            </TooltipDefaultsContext.Provider>
        </TooltipDesignContext.Provider>
    )
}
