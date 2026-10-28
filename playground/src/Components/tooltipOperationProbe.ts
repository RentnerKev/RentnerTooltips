// Count observable browser work, rather than using elapsed-time assertions.
export function observeTooltipOperations() {
    const NativeResizeObserver = window.ResizeObserver
    const NativeIntersectionObserver = window.IntersectionObserver
    const nativeRect = Element.prototype.getBoundingClientRect
    const resize = new Set<ResizeObserver>()
    const intersection = new Set<IntersectionObserver>()
    const counts = {
        triggerReads: 0,
        ancestorReads: 0,
        resizeCreates: 0,
        resizeDisconnects: 0,
        intersectionCreates: 0,
        intersectionDisconnects: 0,
    }
    window.ResizeObserver = class extends NativeResizeObserver {
        constructor(callback: ResizeObserverCallback) {
            super(callback)
            counts.resizeCreates++
        }
        override observe(target: Element, options?: ResizeObserverOptions) {
            resize.add(this)
            super.observe(target, options)
        }
        override disconnect() {
            resize.delete(this)
            counts.resizeDisconnects++
            super.disconnect()
        }
    }
    window.IntersectionObserver = class extends NativeIntersectionObserver {
        constructor(
            callback: IntersectionObserverCallback,
            options?: IntersectionObserverInit,
        ) {
            super(callback, options)
            counts.intersectionCreates++
        }
        override observe(target: Element) {
            intersection.add(this)
            super.observe(target)
        }
        override disconnect() {
            intersection.delete(this)
            counts.intersectionDisconnects++
            super.disconnect()
        }
    }
    Element.prototype.getBoundingClientRect = function () {
        if (this.hasAttribute('data-measured-trigger')) counts.triggerReads++
        if (this.hasAttribute('data-measured-ancestor')) counts.ancestorReads++
        return nativeRect.call(this)
    }
    return {
        reset: () => {
            for (const key of Object.keys(counts) as (keyof typeof counts)[])
                counts[key] = 0
        },
        read: () => ({
            ...counts,
            activeResize: resize.size,
            activeIntersection: intersection.size,
        }),
        restore: () => {
            window.ResizeObserver = NativeResizeObserver
            window.IntersectionObserver = NativeIntersectionObserver
            Element.prototype.getBoundingClientRect = nativeRect
        },
    }
}

export async function settleTooltipOperations() {
    await document.fonts.ready
    await new Promise<void>((resolve) => {
        let remaining = 4
        function frame() {
            if (--remaining === 0) resolve()
            else requestAnimationFrame(frame)
        }
        requestAnimationFrame(frame)
    })
}
