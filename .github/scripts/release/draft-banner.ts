import { createHash } from 'node:crypto'
import { readRegularFile } from '../lib/regularFile.ts'
import { repositoryPolicy } from '../lib/repository.ts'
import {
    api,
    command,
    isMain,
    output,
    parseJson,
    positiveInteger,
    requiredEnv,
} from '../lib/runtime.ts'
import type {
    DraftBannerOperations,
    ReleaseSummary,
} from './Types/release.types.ts'
import { stableVersion, verifyTagCheckout } from './identity.ts'
import { releaseBannerName } from './notes.ts'
import { isReleaseSummary } from './releaseValidation.ts'

export async function attachDraftBanner(
    releaseId: number,
    tag: string,
    banner: Uint8Array<ArrayBuffer>,
    operations: DraftBannerOperations,
): Promise<void> {
    const digest = `sha256:${createHash('sha256').update(banner).digest('hex')}`

    function hasMatchingBanner(release: ReleaseSummary): boolean {
        if (
            release.id !== releaseId ||
            release.tag_name !== tag ||
            !release.draft ||
            release.prerelease
        )
            throw new Error(
                'Expected the selected stable release to remain a draft',
            )

        const assets = release.assets.filter(
            (asset) => asset.name === releaseBannerName,
        )
        const [asset] = assets
        if (
            assets.length > 1 ||
            (asset &&
                (asset.size !== banner.byteLength || asset.digest !== digest))
        )
            throw new Error(
                'Existing banner has a different or unverifiable digest; refusing overwrite',
            )
        return asset !== undefined
    }

    if (hasMatchingBanner(operations.readRelease())) return
    await operations.uploadBanner(banner)
    if (!hasMatchingBanner(operations.readRelease()))
        throw new Error('Uploaded draft banner could not be verified')
}

if (isMain(import.meta.url)) {
    const tag = requiredEnv('RELEASE_TAG')
    stableVersion(tag)
    if (process.argv.includes('--validate-tag')) {
        output('tag', tag)
    } else {
        const { repository } = repositoryPolicy()
        const releaseId = parseJson(
            command('gh', [
                'release',
                'view',
                tag,
                '--repo',
                repository,
                '--json',
                'databaseId',
                '--jq',
                '.databaseId',
            ]),
            positiveInteger,
        )
        verifyTagCheckout(tag)
        const banner = readRegularFile(
            '.github/assets/release-banners/new-release-banner.png',
            { minBytes: 1, maxBytes: 10_000_000 },
        )
        const endpoint = `repos/${repository}/releases/${releaseId}`
        await attachDraftBanner(releaseId, tag, new Uint8Array(banner), {
            readRelease: () => api(endpoint, isReleaseSummary),
            uploadBanner: async (contents) => {
                const url = new URL(
                    `https://uploads.github.com/${endpoint}/assets`,
                )
                url.searchParams.set('name', releaseBannerName)
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${requiredEnv('GH_TOKEN')}`,
                        'Content-Type': 'image/png',
                    },
                    body: contents,
                    redirect: 'error',
                    signal: AbortSignal.timeout(30_000),
                })
                await response.body?.cancel()
                if (response.status !== 201)
                    throw new Error(
                        `Draft banner upload failed (HTTP ${response.status})`,
                    )
            },
        })
        console.log(
            `Banner verified on release draft ${tag}. The draft is ready for review.`,
        )
    }
}
