import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { PlaygroundTooltipSide } from '../types.js'

export function usePlaygroundLogic() {
    const [delayDuration, setDelayDuration] = useState(350)
    const [side, setSide] = useState<PlaygroundTooltipSide>('top')
    const [tooltipsDisabled, setTooltipsDisabled] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [disableHoverableContent, setDisableHoverableContent] =
        useState(false)
    const [portalContainer, setPortalContainer] =
        useState<HTMLDivElement | null>(null)
    const stageRef = useRef<HTMLDivElement>(null)

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
            delayDuration,
            side,
            tooltipsDisabled,
            darkMode,
            disableHoverableContent,
            portalContainer,
        },
        handler: {
            handleDelayChange,
            handleSideChange,
            handleTooltipsDisabledChange,
            handleDarkModeChange,
            handleHoverableContentChange,
        },
        setter: { setPortalContainer },
        ref: { stageRef },
    }
}
