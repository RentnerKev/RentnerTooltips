import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

interface PackageContract {
    exports: Record<string, unknown>
    peerDependencies: Record<string, string>
    scripts: Record<string, string>
}

const packageJson = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as PackageContract
const readme = readFileSync(new URL('../../README.md', import.meta.url), 'utf8')

describe('published package contract', () => {
    test('keeps the shared React and test contracts', () => {
        expect(packageJson.peerDependencies.react).toBe('^19.0.0')
        expect(packageJson.peerDependencies['react-dom']).toBe('^19.0.0')
        expect(packageJson.scripts.test).toBe('bun test')
    })

    test('publishes every supported entry point', () => {
        expect(packageJson.exports).toEqual({
            '.': {
                types: './dist/index.d.ts',
                import: './dist/index.js',
                default: './dist/index.js',
            },
            './tailwind.css': './tailwind.css',
            './tooltip': {
                types: './dist/CustomTooltip.d.ts',
                import: './dist/CustomTooltip.js',
                default: './dist/CustomTooltip.js',
            },
            './types': {
                types: './dist/types.d.ts',
                import: './dist/types.js',
                default: './dist/types.js',
            },
            './package.json': './package.json',
        })
    })

    test('documents npm before Bun installation', () => {
        const npmInstallPosition = readme.indexOf(
            'npm install @rentnerkev/tooltips',
        )
        const bunInstallPosition = readme.indexOf(
            'bun add @rentnerkev/tooltips',
        )

        expect(npmInstallPosition).toBeGreaterThan(-1)
        expect(bunInstallPosition).toBeGreaterThan(npmInstallPosition)
    })
})
