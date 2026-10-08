import { useCallback, useState } from 'react'
import type { ChangeEvent } from 'react'
import type {
    PlaygroundTooltipSide,
    PlaygroundLogicResult,
} from '../Types/playground.types.ts'

export function usePlaygroundLogic(): PlaygroundLogicResult {
    const [controlledOpen, setControlledOpen] = useState(false)
    const [accidentalActivationCount, setAccidentalActivationCount] =
        useState(0)
    const [delayDuration, setDelayDuration] = useState(350)
    const [side, setSide] = useState<PlaygroundTooltipSide>('top')
    const [tooltipsDisabled, setTooltipsDisabled] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [disableHoverableContent, setDisableHoverableContent] =
        useState(false)
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
        null,
    )
    const [collisionBoundary, setCollisionBoundary] =
        useState<HTMLDivElement | null>(null)
    const handleStageMount = useCallback((element: HTMLDivElement | null) => {
        setCollisionBoundary(element)
    }, [])
    const handlePortalMount = useCallback((element: HTMLElement | null) => {
        setPortalContainer(element)
    }, [])

    function handleDelayChange(event: ChangeEvent<HTMLInputElement>) {
        setDelayDuration(Number(event.target.value))
    }

    function handleSideChange(event: ChangeEvent<HTMLSelectElement>) {
        setSide(event.target.value as PlaygroundTooltipSide)
    }

    function handleTooltipsDisabledChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        setTooltipsDisabled(event.target.checked)
    }

    function handleDarkModeChange(event: ChangeEvent<HTMLInputElement>) {
        setDarkMode(event.target.checked)
    }

    function handleHoverableContentChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        setDisableHoverableContent(event.target.checked)
    }

    return {
        state: {
            controlledOpen,
            accidentalActivationCount,
            delayDuration,
            side,
            tooltipsDisabled,
            darkMode,
            disableHoverableContent,
            portalContainer,
            collisionBoundary,
        },
        handler: {
            handleAccidentalActivation: () =>
                setAccidentalActivationCount((count) => count + 1),
            handleDelayChange,
            handleSideChange,
            handleTooltipsDisabledChange,
            handleDarkModeChange,
            handleHoverableContentChange,
        },
        setter: { setControlledOpen },
        refs: { handleStageMount, handlePortalMount },
    }
}
