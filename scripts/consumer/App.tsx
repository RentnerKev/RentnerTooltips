import { CustomTooltip, TooltipProvider } from '@rentnerkev/tooltips'
import { useState } from 'react'

export function App() {
    const [activations, setActivations] = useState(0)
    return (
        <TooltipProvider delayDuration={0}>
            <CustomTooltip content="Consumer help">
                <button type="button" className="px-4 py-2">
                    Show help
                </button>
            </CustomTooltip>
            <label htmlFor="consumer-amount">Amount</label>
            <CustomTooltip
                content="The amount cannot be edited"
                disabledTrigger
            >
                <input id="consumer-amount" defaultValue="12" />
            </CustomTooltip>
            <CustomTooltip content="This action is unavailable" disabledTrigger>
                <button
                    type="button"
                    onClick={() => setActivations((count) => count + 1)}
                >
                    Unavailable action
                </button>
            </CustomTooltip>
            <output data-testid="activations">{activations}</output>
        </TooltipProvider>
    )
}
