import { expect, mock, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { attachDraftBanner } from '../../../.github/scripts/release/draft-banner.ts'
import { releaseBannerName } from '../../../.github/scripts/release/notes.ts'
import { isReleaseSummary } from '../../../.github/scripts/release/releaseValidation.ts'
import type { ReleaseSummary } from '../../../.github/scripts/release/Types/release.types.ts'

const banner = Buffer.from('89504e470d0a1a0a01020304', 'hex')
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

test('attaches the banner to a stable draft and verifies its digest on retries', () => {
    const release: ReleaseSummary = { ...draft }
    const uploadBanner = mock((contents: Buffer) => {
        expect(contents).toEqual(banner)
        release.assets = [asset]
    })
    const operations = { readRelease: () => release, uploadBanner }

    attachDraftBanner(draft.id, draft.tag_name, banner, operations)
    attachDraftBanner(draft.id, draft.tag_name, banner, operations)

    expect(uploadBanner).toHaveBeenCalledTimes(1)
})

test.each([
    { ...draft, draft: false },
    { ...draft, prerelease: true },
    { ...draft, tag_name: 'v2.4.1' },
    { ...draft, id: 13 },
])('refuses to upload outside the selected stable draft', (release) => {
    const uploadBanner = mock(() => {})
    expect(() =>
        attachDraftBanner(draft.id, draft.tag_name, banner, {
            readRelease: () => release,
            uploadBanner,
        }),
    ).toThrow('remain a draft')
    expect(uploadBanner).not.toHaveBeenCalled()
})

test.each([
    { assets: [asset, asset] },
    { assets: [{ ...asset, digest: null }] },
    { assets: [{ ...asset, digest: 'sha256:unexpected' }] },
    { assets: [{ ...asset, size: 0 }] },
])('refuses to replace a conflicting or unverifiable banner', ({ assets }) => {
    const uploadBanner = mock(() => {})
    expect(() =>
        attachDraftBanner(draft.id, draft.tag_name, banner, {
            readRelease: () => ({ ...draft, assets: [...assets] }),
            uploadBanner,
        }),
    ).toThrow('refusing overwrite')
    expect(uploadBanner).not.toHaveBeenCalled()
})

test('requires the attached banner to appear on the draft after upload', () => {
    const uploadBanner = mock(() => {})
    expect(() =>
        attachDraftBanner(draft.id, draft.tag_name, banner, {
            readRelease: () => draft,
            uploadBanner,
        }),
    ).toThrow('could not be verified')
    expect(uploadBanner).toHaveBeenCalledTimes(1)
})

test('rejects data without a PNG signature before upload', () => {
    const readRelease = mock(() => draft)
    const uploadBanner = mock(() => {})
    expect(() =>
        attachDraftBanner(draft.id, draft.tag_name, Buffer.from('text'), {
            readRelease,
            uploadBanner,
        }),
    ).toThrow('Expected a PNG release banner')
    expect(readRelease).not.toHaveBeenCalled()
    expect(uploadBanner).not.toHaveBeenCalled()
})

test('accepts draft metadata without a publication date', () => {
    expect(isReleaseSummary({ ...draft, published_at: null })).toBe(true)
    expect(
        isReleaseSummary({ ...draft, assets: [{ ...asset, digest: 1 }] }),
    ).toBe(false)
})
