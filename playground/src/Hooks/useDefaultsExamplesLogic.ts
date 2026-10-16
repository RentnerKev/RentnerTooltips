import { useCallback, useState } from 'react'

export function useDefaultsExamplesLogic() {
    const [portalContainer, setPortalContainer] =
        useState<HTMLDivElement | null>(null)
    const portalContainerRef = useCallback((element: HTMLDivElement | null) => {
        setPortalContainer(element)
    }, [])
    return {
        state: { portalContainer },
        refs: { portalContainerRef },
    }
}
