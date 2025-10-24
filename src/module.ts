import { defineNuxtModule, addComponent, createResolver } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  apiEndpoint?: string
  apiHeaders?: Record<string, string>
  defaultConfig?: any
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-slots-module',
    configKey: 'slots',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // For GitHub installs, always use src/runtime
    // The resolver.resolve('.') gives us the directory containing this file
    const runtimeDir = resolver.resolve('./runtime')

    console.log('🎰 Slots module runtime dir:', runtimeDir)

    // Add runtime directory
    nuxt.options.build.transpile.push(runtimeDir)

    // Register SlotsGame component
    addComponent({
      name: 'SlotsGame',
      filePath: resolver.resolve(runtimeDir, 'components/SlotsGame.vue')
    })

    // Add pixi.js and its dependencies to transpile list
    nuxt.options.build.transpile.push('pixi.js')
    nuxt.options.build.transpile.push('eventemitter3')

    // Add vite optimizations for PixiJS
    nuxt.options.vite = nuxt.options.vite || {}
    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
    nuxt.options.vite.optimizeDeps.include = nuxt.options.vite.optimizeDeps.include || []
    nuxt.options.vite.optimizeDeps.include.push('pixi.js', 'eventemitter3')
  }
})
