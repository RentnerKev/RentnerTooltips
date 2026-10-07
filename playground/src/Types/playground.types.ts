import type { TooltipProps } from '@rentnerkev/tooltips'
import type {
    ChangeEventHandler,
    ReactNode,
    Dispatch,
    SetStateAction,
    RefCallback,
} from 'react'

export type PlaygroundTooltipSide = NonNullable<TooltipProps['side']>

export interface ToggleRowProps {
    checked: boolean
    description: string
    label: string
    onChange: ChangeEventHandler<HTMLInputElement>
}

export interface SignalRowProps {
    label: string
    value: ReactNode
}

export interface ProbeProps {
    label: string
    className: string
    side: NonNullable<TooltipProps['side']>
    boundary: HTMLDivElement | null
    portalContainer: HTMLElement | null
    disabled: boolean
}

export interface PlaygroundLogicResult {
    state: {
        delayDuration: number
        side: PlaygroundTooltipSide
        tooltipsDisabled: boolean
        darkMode: boolean
        disableHoverableContent: boolean
        portalContainer: HTMLElement | null
        collisionBoundary: HTMLDivElement | null
        controlledOpen: boolean
        accidentalActivationCount: number
    }
    handler: {
        handleDelayChange: ChangeEventHandler<HTMLInputElement>
        handleSideChange: ChangeEventHandler<HTMLSelectElement>
        handleTooltipsDisabledChange: ChangeEventHandler<HTMLInputElement>
        handleDarkModeChange: ChangeEventHandler<HTMLInputElement>
        handleHoverableContentChange: ChangeEventHandler<HTMLInputElement>
        handleAccidentalActivation: () => void
    }
    setter: {
        setControlledOpen: Dispatch<SetStateAction<boolean>>
    }
    refs: {
        handleStageMount: RefCallback<HTMLDivElement>
        handlePortalMount: RefCallback<HTMLElement>
    }
}
