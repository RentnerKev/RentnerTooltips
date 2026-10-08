import type {
    TooltipCustomDesign,
    TooltipProviderProps,
} from './tooltip.types.ts'

export type TooltipProviderLogicProps = Pick<
    TooltipProviderProps,
    'customDesign'
>

export interface TooltipProviderLogicResult {
    state: {
        hasProvider: boolean
        nextProviderDepth: number
        design: TooltipCustomDesign
    }
}
