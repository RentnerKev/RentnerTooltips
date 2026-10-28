import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
    TooltipProviderProps,
} from './tooltip.types.ts'
import type { TooltipBehavior } from './tooltip-behavior.types.ts'

export type TooltipProviderLogicProps = Omit<TooltipProviderProps, 'children'>

export interface TooltipProviderLogicResult {
    state: {
        hasProvider: boolean
        nextProviderDepth: number
        design: TooltipCustomDesign
        defaults: TooltipDefaults
        classNames: TooltipClassNames
        behavior: TooltipBehavior
    }
}
