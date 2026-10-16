import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
    TooltipProviderProps,
} from './tooltip.types.ts'

export type TooltipProviderLogicProps = Omit<
    TooltipProviderProps,
    | 'children'
    | 'delayDuration'
    | 'skipDelayDuration'
    | 'disableHoverableContent'
>

export interface TooltipProviderLogicResult {
    state: {
        hasProvider: boolean
        nextProviderDepth: number
        design: TooltipCustomDesign
        defaults: TooltipDefaults
        classNames: TooltipClassNames
    }
}
