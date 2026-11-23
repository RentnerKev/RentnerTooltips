import { useContext, useMemo, useState } from 'react'
import { createTooltipTiming } from '../../../lib/Tooltip/tooltipCoordination.ts'
import {
    TooltipDesignContext,
    TooltipDefaultsContext,
    TooltipClassNamesContext,
    TooltipProviderDepthContext,
    TooltipBehaviorContext,
} from '../TooltipContext.ts'
import { mergeTooltipDefaults } from '../../../lib/Tooltip/tooltipDefaults.ts'
import type {
    TooltipProviderLogicProps,
    TooltipProviderLogicResult,
} from '../Types/tooltip-provider-logic.types.ts'

export function useTooltipProviderLogic({
    customDesign,
    classNames,
    delayDuration = 200,
    skipDelayDuration = 300,
    disableHoverableContent: _disableHoverableContent,
    ...localDefaults
}: TooltipProviderLogicProps): TooltipProviderLogicResult {
    const providerDepth = useContext(TooltipProviderDepthContext)
    const inheritedDesign = useContext(TooltipDesignContext)
    const inheritedDefaults = useContext(TooltipDefaultsContext)
    const inheritedClassNames = useContext(TooltipClassNamesContext)
    const inheritedBehavior = useContext(TooltipBehaviorContext)
    const [timing] = useState(
        () => inheritedBehavior?.timing ?? createTooltipTiming(),
    )
    const behavior = useMemo(
        () =>
            inheritedBehavior ?? {
                delayDuration,
                skipDelayDuration,
                timing,
            },
        [inheritedBehavior, delayDuration, skipDelayDuration, timing],
    )
    const baseClasses = customDesign?.baseClasses
    const animationClasses = customDesign?.animationClasses
    const contentClasses = customDesign?.contentClasses
    const arrowClasses = customDesign?.arrowClasses
    const design = useMemo(
        () => mergeTooltipDefaults(inheritedDesign, customDesign),
        // oxlint-disable-next-line react-hooks/exhaustive-deps -- stabilize on field values while preserving property order
        [
            inheritedDesign,
            baseClasses,
            animationClasses,
            contentClasses,
            arrowClasses,
        ],
    )
    const contentSlot = classNames?.content
    const animationSlot = classNames?.animation
    const arrowSlot = classNames?.arrow
    const disabledTriggerSlot = classNames?.disabledTrigger
    const slots = useMemo(
        () => mergeTooltipDefaults(inheritedClassNames, classNames),
        // oxlint-disable-next-line react-hooks/exhaustive-deps -- stabilize on field values while preserving property order
        [
            inheritedClassNames,
            contentSlot,
            animationSlot,
            arrowSlot,
            disabledTriggerSlot,
        ],
    )
    const {
        side,
        sideOffset,
        align,
        alignOffset,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        arrowPadding,
        sticky,
        hideWhenDetached,
        showArrow,
        size,
        portalContainer,
        portalClassName,
        portalZIndex,
    } = localDefaults
    const paddingIsObject =
        typeof collisionPadding === 'object' && collisionPadding !== null
    const paddingTop = paddingIsObject ? collisionPadding.top : undefined
    const paddingRight = paddingIsObject ? collisionPadding.right : undefined
    const paddingBottom = paddingIsObject ? collisionPadding.bottom : undefined
    const paddingLeft = paddingIsObject ? collisionPadding.left : undefined
    const paddingNumber =
        typeof collisionPadding === 'number' ? collisionPadding : undefined
    const defaults = useMemo(
        () => mergeTooltipDefaults(inheritedDefaults, localDefaults),
        // oxlint-disable-next-line react-hooks/exhaustive-deps -- stabilize on field values while preserving caller key order
        [
            inheritedDefaults,
            side,
            sideOffset,
            align,
            alignOffset,
            avoidCollisions,
            collisionBoundary,
            paddingIsObject,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            paddingNumber,
            arrowPadding,
            sticky,
            hideWhenDetached,
            showArrow,
            size,
            portalContainer,
            portalClassName,
            portalZIndex,
        ],
    )
    return {
        state: {
            hasProvider: providerDepth > 0,
            nextProviderDepth: providerDepth + 1,
            design,
            defaults,
            classNames: slots,
            behavior,
        },
    }
}
