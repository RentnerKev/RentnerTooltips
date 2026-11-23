export interface ReleaseSummary {
    id: number
    tag_name: string
    draft: boolean
    prerelease: boolean
    assets: { id: number; name: string; size: number; digest: string | null }[]
}

export interface ReleaseMetadata extends ReleaseSummary {
    published_at: string
    body: string | null
}

export interface DraftBannerOperations {
    readRelease: () => ReleaseSummary
    uploadBanner: (banner: Buffer) => void
}

export interface ReleaseEvent {
    release?: ReleaseMetadata
    inputs?: { tag?: string }
}

export interface SelectedRelease {
    release: ReleaseMetadata
    tag: string
    version: string
    repository: string
}

export interface VerifiedRelease extends SelectedRelease {
    commit: string
}

export interface VerifiedSourceRelease extends VerifiedRelease {
    manifest: PackageIdentity & Record<string, unknown>
}

export interface ReleaseCheckoutOperations {
    select: () => SelectedRelease
    packageName: () => string
    command: (program: string, args: readonly string[]) => string
    readManifest: () => string
}

export interface ReleasePreparationOperations extends ReleaseCheckoutOperations {
    writeManifest: (text: string) => void
}

export interface PackageIdentity {
    name: string
    version: string
}

export interface PackedArtifact {
    name: string
    version: string
    filename: string
    files: { path: string }[]
}
