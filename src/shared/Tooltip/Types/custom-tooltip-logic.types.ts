import type { useTooltipInteraction } from '../Hooks/useTooltipInteraction.ts'
import type { useTooltipPosition } from '../Hooks/useTooltipPosition.ts'
import type { CSSProperties } from 'react'
import type {
    TooltipClassNames,
    TooltipCustomDesign,
    TooltipDefaults,
    TooltipProps,
} from './tooltip.types.ts'
export interface CustomTooltipLogicResult {
    state: ReturnType<typeof useTooltipInteraction>['state'] & {
        position: ReturnType<typeof useTooltipPosition>
        contentStyle: CSSProperties
        providerDepth: number
        design: Required<TooltipCustomDesign>
        contentClassName: string
        animationClassName: string
        arrowClassName: string
        defaults: TooltipDefaults
        classNames: TooltipClassNames
    }
    handler: ReturnType<typeof useTooltipInteraction>['handler']
    refs: ReturnType<typeof useTooltipInteraction>['refs']
}

export type CustomTooltipLogicProps = Omit<
    TooltipProps,
    'children' | 'content' | 'disabledTrigger' | 'disabledTriggerClassName'
>
