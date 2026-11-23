import { useContext } from 'react'
import type { CSSProperties } from 'react'
import { useTooltipInteraction } from './useTooltipInteraction.ts'
import { useTooltipPosition } from './useTooltipPosition.ts'
import {
    defaultTooltipDesign,
    tooltipSizeClasses,
} from '../../../config/tooltip.config.ts'
import {
    EMPTY_TOOLTIP_DESIGN,
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

const DEFAULT_CONTENT_CLASSES = {
    sm: `${defaultTooltipDesign.baseClasses} ${tooltipSizeClasses.sm} ${defaultTooltipDesign.contentClasses}`,
    md: `${defaultTooltipDesign.baseClasses} ${tooltipSizeClasses.md} ${defaultTooltipDesign.contentClasses}`,
    lg: `${defaultTooltipDesign.baseClasses} ${tooltipSizeClasses.lg} ${defaultTooltipDesign.contentClasses}`,
} as const

type TooltipContentStyle = CSSProperties &
    Record<`--${string}`, string | undefined>

function buildContentStyle(
    position: ReturnType<typeof useTooltipPosition>,
    zIndex: number | undefined,
): TooltipContentStyle {
    return {
        position: 'relative',
        zIndex,
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
}

const CLOSED_CONTENT_STYLE: TooltipContentStyle = Object.freeze(
    buildContentStyle(null, undefined),
)

const DEFAULT_CONTENT_BODY_STYLE: CSSProperties = Object.freeze({
    maxHeight: undefined,
    overflow: 'hidden',
})

const UNBOUNDED_CONTENT_BODY_STYLE: CSSProperties = Object.freeze({
    maxHeight: undefined,
    overflow: undefined,
})

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
    const hasDefaultDesignOnly =
        inheritedDesign === EMPTY_TOOLTIP_DESIGN && !customDesign
    let design: {
        baseClasses: string
        animationClasses: string
        contentClasses: string
        arrowClasses: string
    }
    let contentClassName: string
    if (hasDefaultDesignOnly) {
        design = defaultTooltipDesign
        contentClassName =
            slots.content ?? DEFAULT_CONTENT_CLASSES[defaults.size ?? 'sm']
    } else {
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
        design = {
            baseClasses:
                resolvedDesign.baseClasses ?? defaultTooltipDesign.baseClasses,
            animationClasses:
                resolvedDesign.animationClasses ??
                defaultTooltipDesign.animationClasses,
            contentClasses:
                resolvedDesign.contentClasses ??
                defaultTooltipDesign.contentClasses,
            arrowClasses:
                resolvedDesign.arrowClasses ??
                defaultTooltipDesign.arrowClasses,
        }
        contentClassName =
            slots.content ??
            [design.baseClasses, sizeClasses, design.contentClasses]
                .filter(Boolean)
                .join(' ')
    }
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
    const contentStyle =
        !position && defaults.portalZIndex === undefined
            ? CLOSED_CONTENT_STYLE
            : buildContentStyle(position, defaults.portalZIndex)
    const contentBodyStyle: CSSProperties =
        defaults.avoidCollisions === false
            ? UNBOUNDED_CONTENT_BODY_STYLE
            : position
              ? {
                    maxHeight: position.contentMaxHeight,
                    overflow: 'hidden',
                }
              : DEFAULT_CONTENT_BODY_STYLE
    return {
        state: {
            ...interaction.state,
            position,
            contentStyle,
            contentBodyStyle,
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
