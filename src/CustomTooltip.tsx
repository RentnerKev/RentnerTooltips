import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { defaultTooltipDesign } from './types.js'
import type { TooltipProps } from './types.js'

export function CustomTooltip({
    children,
    content,
    side = 'top',
    customDesign,
}: TooltipProps) {
    const design = { ...defaultTooltipDesign, ...customDesign }

    return (
        <TooltipPrimitive.Provider>
            <TooltipPrimitive.Root delayDuration={200}>
                <TooltipPrimitive.Trigger asChild>
                    {children}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        sideOffset={8}
                        side={side}
                        className={`z-[9999] ${design.baseClasses} ${design.animationClasses} ${design.contentClasses}`}
                    >
                        {content}
                        <TooltipPrimitive.Arrow
                            width={12}
                            height={6}
                            className={design.arrowClasses}
                        />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    )
}
