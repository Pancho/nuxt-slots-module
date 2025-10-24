import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/module'
  ],
  externals: [
    '@nuxt/kit',
    '@nuxt/schema',
    'nuxt',
    'vue',
    'pixi.js'
  ],
  declaration: true,
  failOnWarn: false,
  rollup: {
    emitCJS: true,
    // Copy runtime files as-is
    output: {
      exports: 'named'
    }
  },
  hooks: {
    'build:done': async (ctx) => {
      // Copy runtime directory to dist
      const { copyFile, mkdir } = await import('node:fs/promises')
      const { join } = await import('node:path')
      const { glob } = await import('glob')

      const files = await glob('src/runtime/**/*', { nodir: true })

      for (const file of files) {
        const dest = file.replace('src/', 'dist/')
        const destDir = dest.split('/').slice(0, -1).join('/')
        await mkdir(destDir, { recursive: true })
        await copyFile(file, dest)
        console.log('✓ Copied', file, '→', dest)
      }
    }
  }
})
