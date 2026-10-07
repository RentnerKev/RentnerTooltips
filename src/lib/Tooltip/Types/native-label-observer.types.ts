export interface RootObserver {
    observer: MutationObserver
    subscriptions: Set<() => void>
}
