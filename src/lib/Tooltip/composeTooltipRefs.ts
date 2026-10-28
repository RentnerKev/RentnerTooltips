import type { Ref, RefCallback } from 'react'

export function composeTooltipRefs(
    ...refs: (Ref<HTMLElement> | undefined)[]
): RefCallback<HTMLElement> {
    return (node) => {
        const cleanups = refs.map((ref) => {
            if (typeof ref === 'function') {
                const cleanup = ref(node)
                return typeof cleanup === 'function' ? cleanup : () => ref(null)
            }
            if (ref) ref.current = node
            return () => {
                if (ref) ref.current = null
            }
        })
        return () => {
            for (const cleanup of cleanups) cleanup()
        }
    }
}
