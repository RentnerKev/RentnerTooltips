import { CustomTooltip, TooltipProvider } from '@rentnerkev/tooltips'
import type {
    TooltipCustomDesign,
    TooltipProviderProps,
} from '@rentnerkev/tooltips'
import { CustomTooltip as SubpathTooltip } from '@rentnerkev/tooltips/tooltip'
import type {
    TooltipCustomDesign as SubpathDesign,
    TooltipProps as SubpathTooltipProps,
    TooltipProviderProps as SubpathProviderProps,
} from '@rentnerkev/tooltips/tooltip'
import type {
    TooltipCustomDesign as TypesDesign,
    TooltipProviderProps as TypesProviderProps,
} from '@rentnerkev/tooltips/types'
import { useState } from 'react'

const consumerDesign: TooltipCustomDesign & SubpathDesign & TypesDesign =
    Object.freeze({
        contentClasses: 'text-sm font-semibold',
        arrowClasses: 'fill-orange-500',
    })
const consumerProviderProps: Omit<TooltipProviderProps, 'children'> = {
    customDesign: consumerDesign,
    delayDuration: 0,
}
const consumerNestedProviderProps: Omit<SubpathProviderProps, 'children'> = {
    customDesign: { arrowClasses: 'fill-blue-500' },
}
const consumerSeparateProviderProps: Omit<TypesProviderProps, 'children'> = {
    customDesign: { arrowClasses: 'fill-green-500' },
    delayDuration: 0,
    disableHoverableContent: true,
}
const consumerLocalProps: Pick<SubpathTooltipProps, 'customDesign'> = {
    customDesign: { contentClasses: 'text-lg italic' },
}

export function App() {
    const [activations, setActivations] = useState(0)
    const [showPrefix, setShowPrefix] = useState(false)
    const [controlKey, setControlKey] = useState(0)
    const [controlledOpen, setControlledOpen] = useState(false)
    return (
        <>
            <TooltipProvider {...consumerProviderProps}>
                <CustomTooltip content="Consumer help">
                    <button type="button" className="px-4 py-2">
                        Show help
                    </button>
                </CustomTooltip>
                <SubpathTooltip
                    content="Consumer local design"
                    {...consumerLocalProps}
                >
                    <button type="button" data-testid="consumer-local-design">
                        Local design
                    </button>
                </SubpathTooltip>
                <TooltipProvider {...consumerNestedProviderProps}>
                    <SubpathTooltip content="Consumer nested design">
                        <button
                            type="button"
                            data-testid="consumer-nested-design"
                        >
                            Nested design
                        </button>
                    </SubpathTooltip>
                </TooltipProvider>
                {showPrefix && <label htmlFor="consumer-amount">Prefix</label>}
                <label htmlFor="consumer-amount">Amount</label>
                <CustomTooltip
                    content="The amount cannot be edited"
                    disabledTrigger
                >
                    <input
                        key={controlKey}
                        id="consumer-amount"
                        defaultValue="12"
                    />
                </CustomTooltip>
                <CustomTooltip
                    content="This action is unavailable"
                    disabledTrigger
                >
                    <button
                        type="button"
                        onClick={() => setActivations((count) => count + 1)}
                    >
                        Unavailable action
                    </button>
                </CustomTooltip>
                <output data-testid="activations">{activations}</output>
                <button type="button" onClick={() => setShowPrefix(true)}>
                    Add amount label
                </button>
                <button
                    type="button"
                    onClick={() => setControlKey((key) => key + 1)}
                >
                    Remount amount control
                </button>
                <button type="button" onClick={() => setShowPrefix(false)}>
                    Remove amount label
                </button>
                <section aria-label="Focus scrolling">
                    <button type="button" data-testid="scroll-start">
                        Start keyboard scroll check
                    </button>
                    <div aria-hidden="true" style={{ height: '150vh' }} />
                    <label htmlFor="offscreen-amount">Offscreen amount</label>
                    <CustomTooltip
                        content="Offscreen amount explanation"
                        disabledTrigger
                    >
                        <input id="offscreen-amount" />
                    </CustomTooltip>
                    <button type="button" data-testid="controlled-scroll-start">
                        Start controlled keyboard scroll check
                    </button>
                    <div aria-hidden="true" style={{ height: '150vh' }} />
                    <CustomTooltip
                        content="Controlled offscreen explanation"
                        open={controlledOpen}
                        onOpenChange={setControlledOpen}
                    >
                        <button type="button">Controlled offscreen help</button>
                    </CustomTooltip>
                    <CustomTooltip
                        content="Immediate pointer leave explanation"
                        disableHoverableContent
                    >
                        <button type="button" data-testid="immediate-leave">
                            Pointer leave help
                        </button>
                    </CustomTooltip>
                </section>
            </TooltipProvider>
            <TooltipProvider {...consumerSeparateProviderProps}>
                <CustomTooltip content="Inherited pointer leave explanation">
                    <button type="button" data-testid="inherited-leave">
                        Inherited pointer leave help
                    </button>
                </CustomTooltip>
            </TooltipProvider>
        </>
    )
}
