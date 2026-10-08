export interface RootObserver {
    observer: MutationObserver
    subscriptions: Set<() => void>
}

export interface GeneratedLabelId {
    id: string
    owners: Set<object>
}

export type RootElementLookup = Node & {
    getElementById?: (elementId: string) => Element | null
}
