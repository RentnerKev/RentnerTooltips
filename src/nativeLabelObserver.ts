interface RootObserver {
    observer: MutationObserver
    subscriptions: Set<() => void>
}

// DOM roots own these subscriptions; no observer is created during SSR.
const rootObservers = new WeakMap<Node, RootObserver>()
const generatedLabelIds = new WeakMap<
    HTMLLabelElement,
    { id: string; owners: Set<object> }
>()

function affectsLabels(record: MutationRecord) {
    if (record.type === 'attributes') return true
    if (
        record.target.nodeType === 1 &&
        (record.target as Element).closest('[data-tooltip-disabled-trigger]')
    ) {
        return true
    }
    // Text edits need no resync: aria-labelledby already references live text.
    // An id-less control can also steal the first-control association of a
    // wrapping label, even when inserted outside our proxy wrapper.
    const associationSelector =
        'label, button, input, select, textarea, meter, output, progress, [id], [data-tooltip-disabled-trigger]'
    for (const nodes of [record.addedNodes, record.removedNodes]) {
        for (const node of nodes) {
            if (node.nodeType !== 1) continue
            const element = node as Element
            if (
                element.matches(associationSelector) ||
                element.querySelector(associationSelector)
            ) {
                return true
            }
        }
    }
    return false
}

export function subscribeNativeLabels(
    wrapper: HTMLSpanElement,
    sync: () => void,
) {
    const root = wrapper.getRootNode()
    const document = wrapper.ownerDocument
    // Keep the document subscription while detached or in a shadow tree so a
    // later insertion into another root can reconnect the label subscription.
    const stopDocument = subscribeRoot(document, sync)
    if (root === document || !('host' in root)) return stopDocument
    const stopShadow = subscribeRoot(root, sync)
    return () => {
        stopShadow()
        stopDocument()
    }
}

function subscribeRoot(root: Node, sync: () => void) {
    let entry = rootObservers.get(root)
    if (!entry) {
        const subscriptions = new Set<() => void>()
        const observer = new MutationObserver((records) => {
            if (!records.some(affectsLabels)) return
            // A callback may move its subscription to another root.
            for (const subscription of Array.from(subscriptions)) {
                subscription()
            }
        })
        observer.observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['id', 'for'],
        })
        entry = { observer, subscriptions }
        rootObservers.set(root, entry)
    }
    entry.subscriptions.add(sync)
    return () => {
        entry.subscriptions.delete(sync)
        if (!entry.subscriptions.size) {
            entry.observer.disconnect()
            rootObservers.delete(root)
        }
    }
}

export function retainNativeLabelId(
    label: HTMLLabelElement,
    owner: object,
    createId: () => string,
) {
    let entry = generatedLabelIds.get(label)
    if (!label.id) {
        const id = createId()
        label.id = id
        entry = { id, owners: new Set() }
        generatedLabelIds.set(label, entry)
    }
    if (entry?.id === label.id) entry.owners.add(owner)
    return label.id
}

export function releaseNativeLabelId(label: HTMLLabelElement, owner: object) {
    const entry = generatedLabelIds.get(label)
    if (!entry || !entry.owners.delete(owner) || entry.owners.size) return
    if (label.id === entry.id) label.removeAttribute('id')
    generatedLabelIds.delete(label)
}
