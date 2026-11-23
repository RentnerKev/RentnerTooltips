import { expect, mock, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { attachDraftBanner } from '../../../.github/scripts/release/draft-banner.ts'
import { releaseBannerName } from '../../../.github/scripts/release/notes.ts'
import { isReleaseSummary } from '../../../.github/scripts/release/releaseValidation.ts'
import type { ReleaseSummary } from '../../../.github/scripts/release/Types/release.types.ts'

const banner = new Uint8Array([1, 2, 3, 4])
const asset = {
    id: 22,
    name: releaseBannerName,
    size: banner.byteLength,
    digest: `sha256:${createHash('sha256').update(banner).digest('hex')}`,
}
const draft = {
    id: 12,
    tag_name: 'v2.4.0',
    draft: true,
    prerelease: false,
    assets: [],
} satisfies ReleaseSummary

test('attaches the banner to a stable draft and verifies its digest on retries', async () => {
    const release: ReleaseSummary = { ...draft }
    const uploadBanner = mock(async (contents: Uint8Array) => {
        expect(contents).toEqual(banner)
        release.assets = [asset]
    })
    const operations = { readRelease: () => release, uploadBanner }

    await attachDraftBanner(draft.id, draft.tag_name, banner, operations)
    await attachDraftBanner(draft.id, draft.tag_name, banner, operations)

    expect(uploadBanner).toHaveBeenCalledTimes(1)
})

test.each([
    { ...draft, draft: false },
    { ...draft, prerelease: true },
    { ...draft, tag_name: 'v2.4.1' },
    { ...draft, id: 13 },
])('refuses to upload outside the selected stable draft', async (release) => {
    const uploadBanner = mock(async () => {})
    await expect(
        attachDraftBanner(draft.id, draft.tag_name, banner, {
            readRelease: () => release,
            uploadBanner,
        }),
    ).rejects.toThrow('remain a draft')
    expect(uploadBanner).not.toHaveBeenCalled()
})

test.each([
    { assets: [asset, asset] },
    { assets: [{ ...asset, digest: null }] },
    { assets: [{ ...asset, digest: 'sha256:unexpected' }] },
    { assets: [{ ...asset, size: 0 }] },
])(
    'refuses to replace a conflicting or unverifiable banner',
    async ({ assets }) => {
        const uploadBanner = mock(async () => {})
        await expect(
            attachDraftBanner(draft.id, draft.tag_name, banner, {
                readRelease: () => ({ ...draft, assets: [...assets] }),
                uploadBanner,
            }),
        ).rejects.toThrow('refusing overwrite')
        expect(uploadBanner).not.toHaveBeenCalled()
    },
)

test('requires the attached banner to appear on the draft after upload', async () => {
    const uploadBanner = mock(async () => {})
    await expect(
        attachDraftBanner(draft.id, draft.tag_name, banner, {
            readRelease: () => draft,
            uploadBanner,
        }),
    ).rejects.toThrow('could not be verified')
    expect(uploadBanner).toHaveBeenCalledTimes(1)
})

test('accepts draft metadata without a publication date', () => {
    expect(isReleaseSummary({ ...draft, published_at: null })).toBe(true)
    expect(
        isReleaseSummary({ ...draft, assets: [{ ...asset, digest: 1 }] }),
    ).toBe(false)
})
