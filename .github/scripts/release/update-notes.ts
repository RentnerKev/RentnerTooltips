import { api, isMain, requiredEnv } from '../lib/runtime.ts'
import { verifySourceCheckout, validRelease } from './identity.ts'
import { readNotes, releaseBody } from './notes.ts'
import { isReleaseMetadata } from './releaseValidation.ts'

if (isMain(import.meta.url)) {
    const notes = readNotes(requiredEnv('NOTES_PATH'))
    const selected = verifySourceCheckout()
    const endpoint = `repos/${selected.repository}/releases/${selected.release.id}`
    const server = requiredEnv('GITHUB_SERVER_URL').replace(/\/$/, '')
    if (server !== 'https://github.com')
        throw new Error('Unexpected release host')
    const beforeWrite = api(endpoint, isReleaseMetadata)
    if (
        !validRelease(beforeWrite, selected.tag) ||
        beforeWrite.id !== selected.release.id ||
        beforeWrite.body !== selected.release.body
    )
        throw new Error(
            'Author notes changed concurrently; retry without overwrite',
        )
    const body = releaseBody(
        beforeWrite.body ?? '',
        notes,
        beforeWrite,
        selected.repository,
        server,
    )
    if (body !== beforeWrite.body) api(endpoint, 'PATCH', { body })
    const published = api(endpoint, isReleaseMetadata)
    if (
        !validRelease(published, selected.tag) ||
        published.id !== selected.release.id ||
        published.body !== body
    )
        throw new Error('Published release notes verification failed')
}
