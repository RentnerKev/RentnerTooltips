import { useContext, useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent, PointerEvent } from 'react'
import { defaultTooltipDesign } from '../../../config/tooltip.config.ts'
import {
    TooltipProviderDepthContext,
    TooltipHoverableContentContext,
} from '../TooltipContext.ts'
import type {
    FocusSettlement,
    CustomTooltipLogicResult,
    CustomTooltipLogicProps,
} from '../Types/custom-tooltip-logic.types.ts'

export function useCustomTooltipLogic({
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    disableHoverableContent,
    customDesign,
}: CustomTooltipLogicProps): CustomTooltipLogicResult {
    const providerDepth = useContext(TooltipProviderDepthContext)
    const inheritedDisableHoverableContent = useContext(
        TooltipHoverableContentContext,
    )
    const design = { ...defaultTooltipDesign, ...customDesign }
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
    if (disabled && internalOpen !== (defaultOpen ?? false)) {
        setInternalOpen(defaultOpen ?? false)
    }
    const isOpen = open ?? internalOpen
    const requestedOpen = useRef(isOpen)
    const focusSettlement = useRef<FocusSettlement | null>(null)

    useEffect(() => {
        requestedOpen.current = isOpen
    }, [isOpen])

    const cancelFocusSettlement = useCallback(() => {
        const pending = focusSettlement.current
        if (!pending) return
        pending.view.cancelAnimationFrame(pending.frame)
        pending.view.removeEventListener('scroll', pending.onScroll, true)
        focusSettlement.current = null
    }, [])

    useEffect(() => cancelFocusSettlement, [cancelFocusSettlement])

    useEffect(() => {
        if (!disabled) return
        cancelFocusSettlement()
    }, [cancelFocusSettlement, disabled])

    useEffect(() => {
        if (!isOpen || disabled) return
        // Radix dispatches this before another tooltip dismisses the current one.
        document.addEventListener('tooltip.open', cancelFocusSettlement, true)
        return () => {
            document.removeEventListener(
                'tooltip.open',
                cancelFocusSettlement,
                true,
            )
        }
    }, [cancelFocusSettlement, disabled, isOpen])

    function handleFocus(event: FocusEvent<HTMLElement>) {
        if (event.defaultPrevented) return
        cancelFocusSettlement()
        const trigger = event.currentTarget
        const view = trigger.ownerDocument.defaultView
        if (!view) return

        const pending: FocusSettlement = {
            view,
            frame: 0,
            onScroll(scrollEvent) {
                const target = scrollEvent.target as Node | null
                if (target?.contains?.(trigger)) scheduleSettlement()
            },
        }

        function scheduleSettlement() {
            pending.view.cancelAnimationFrame(pending.frame)
            // Wait for two quiet frames, including smooth focus scrolling.
            pending.frame = pending.view.requestAnimationFrame(() => {
                pending.frame = pending.view.requestAnimationFrame(() => {
                    if (focusSettlement.current === pending) {
                        cancelFocusSettlement()
                    }
                })
            })
        }

        focusSettlement.current = pending
        view.addEventListener('scroll', pending.onScroll, true)
        scheduleSettlement()
    }

    function handleOpenChange(nextOpen: boolean) {
        // Native focus can scroll an ancestor after Radix has opened the tooltip.
        // Explicit dismissal and other tooltip openings cancel this short guard.
        if (!nextOpen && focusSettlement.current) return
        requestedOpen.current = nextOpen
        if (open === undefined) setInternalOpen(nextOpen)
        onOpenChange?.(nextOpen)
    }

    function handleDismissal(event: { defaultPrevented: boolean }) {
        if (event.defaultPrevented) return
        cancelFocusSettlement()
        // Preserve an open-then-close request in one task before React commits
        // the controlled Radix root; otherwise Radix still sees its closed prop.
        if (open === undefined && requestedOpen.current && !isOpen) {
            handleOpenChange(false)
        }
    }

    function handlePointerLeave(event: PointerEvent<HTMLElement>) {
        if (disableHoverableContent ?? inheritedDisableHoverableContent)
            handleDismissal(event)
    }
    return {
        state: { isOpen, providerDepth, design },
        handler: {
            handleOpenChange,
            handleFocus,
            handleDismissal,
            handlePointerLeave,
        },
    }
}
