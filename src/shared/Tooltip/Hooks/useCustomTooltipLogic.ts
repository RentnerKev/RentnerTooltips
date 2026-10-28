import { useContext } from 'react'
import type { CSSProperties } from 'react'
import { useTooltipInteraction } from './useTooltipInteraction.ts'
import { useTooltipPosition } from './useTooltipPosition.ts'
import {
    defaultTooltipDesign,
    tooltipSizeClasses,
} from '../../../config/tooltip.config.ts'
import {
    TooltipDesignContext,
    TooltipDefaultsContext,
    TooltipClassNamesContext,
    TooltipProviderDepthContext,
} from '../TooltipContext.ts'
import type {
    CustomTooltipLogicResult,
    CustomTooltipLogicProps,
} from '../Types/custom-tooltip-logic.types.ts'

import { mergeTooltipDefaults } from '../../../lib/Tooltip/tooltipDefaults.ts'

export function useCustomTooltipLogic({
    open,
    defaultOpen,
    onOpenChange,
    delayDuration,
    disabled,
    disableHoverableContent,
    customDesign,
    classNames,
    ...localDefaults
}: CustomTooltipLogicProps): CustomTooltipLogicResult {
    const providerDepth = useContext(TooltipProviderDepthContext)
    const inheritedDesign = useContext(TooltipDesignContext)
    const inheritedDefaults = useContext(TooltipDefaultsContext)
    const inheritedClassNames = useContext(TooltipClassNamesContext)
    const defaults = mergeTooltipDefaults(inheritedDefaults, localDefaults)
    const slots = mergeTooltipDefaults(inheritedClassNames, classNames)
    const resolvedDesign = mergeTooltipDefaults(
        mergeTooltipDefaults(defaultTooltipDesign, inheritedDesign),
        customDesign,
    )
    const hasCustomBase =
        customDesign?.baseClasses !== undefined ||
        inheritedDesign.baseClasses !== undefined
    const sizeClasses =
        !hasCustomBase || defaults.size !== undefined
            ? tooltipSizeClasses[defaults.size ?? 'sm']
            : ''
    const design = {
        baseClasses:
            resolvedDesign.baseClasses ?? defaultTooltipDesign.baseClasses,
        animationClasses:
            resolvedDesign.animationClasses ??
            defaultTooltipDesign.animationClasses,
        contentClasses:
            resolvedDesign.contentClasses ??
            defaultTooltipDesign.contentClasses,
        arrowClasses:
            resolvedDesign.arrowClasses ?? defaultTooltipDesign.arrowClasses,
    }
    const contentClassName =
        slots.content ??
        [design.baseClasses, sizeClasses, design.contentClasses]
            .filter(Boolean)
            .join(' ')
    const animationClassName = slots.animation ?? design.animationClasses
    const arrowClassName = slots.arrow ?? design.arrowClasses
    const interaction = useTooltipInteraction({
        open,
        defaultOpen,
        onOpenChange,
        disabled,
        delayDuration,
        disableHoverableContent,
    })
    const position = useTooltipPosition(
        interaction.state.isOpen,
        interaction.state.triggerNode,
        interaction.refs.contentRef,
        interaction.refs.positionerRef,
        defaults,
        interaction.state.portalDocument,
    )
    const contentStyle: CSSProperties &
        Record<`--${string}`, string | undefined> = {
        position: 'relative',
        zIndex: defaults.portalZIndex,
        '--rentner-tooltip-transform-origin': position?.transformOrigin,
        '--rentner-tooltip-content-available-width': position
            ? `${position.availableWidth}px`
            : undefined,
        '--rentner-tooltip-content-available-height': position
            ? `${position.availableHeight}px`
            : undefined,
        '--rentner-tooltip-trigger-width': position
            ? `${position.triggerWidth}px`
            : undefined,
        '--rentner-tooltip-trigger-height': position
            ? `${position.triggerHeight}px`
            : undefined,
        // Existing style consumers can keep their published Tooltip variables.
        '--radix-tooltip-content-transform-origin':
            'var(--rentner-tooltip-transform-origin)',
        '--radix-tooltip-content-available-width':
            'var(--rentner-tooltip-content-available-width)',
        '--radix-tooltip-content-available-height':
            'var(--rentner-tooltip-content-available-height)',
        '--radix-tooltip-trigger-width': 'var(--rentner-tooltip-trigger-width)',
        '--radix-tooltip-trigger-height':
            'var(--rentner-tooltip-trigger-height)',
    }
    return {
        state: {
            ...interaction.state,
            position,
            contentStyle,
            providerDepth,
            design,
            defaults,
            classNames: slots,
            contentClassName,
            animationClassName,
            arrowClassName,
        },
        handler: interaction.handler,
        refs: interaction.refs,
    }
}
