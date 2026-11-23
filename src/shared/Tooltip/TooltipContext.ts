import { createContext } from 'react'
import type { TooltipBehavior } from './Types/tooltip-behavior.types.ts'
import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
} from './Types/tooltip.types.ts'

export const EMPTY_TOOLTIP_DESIGN: TooltipCustomDesign = Object.freeze({})
export const EMPTY_TOOLTIP_DEFAULTS: TooltipDefaults = Object.freeze({})
export const EMPTY_TOOLTIP_CLASS_NAMES: TooltipClassNames = Object.freeze({})

export const TooltipDesignContext =
    createContext<TooltipCustomDesign>(EMPTY_TOOLTIP_DESIGN)
export const TooltipDefaultsContext = createContext<TooltipDefaults>(
    EMPTY_TOOLTIP_DEFAULTS,
)
export const TooltipClassNamesContext = createContext<TooltipClassNames>(
    EMPTY_TOOLTIP_CLASS_NAMES,
)
export const TooltipProviderDepthContext = createContext(0)
export const TooltipBehaviorContext = createContext<TooltipBehavior | null>(
    null,
)
export const TooltipHoverableContentContext = createContext<
    boolean | undefined
>(undefined)
