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

    // Resolve to src/runtime for GitHub installs (will work for both src and dist)
    const runtimeDir = resolver.resolve('../runtime')

    // Add runtime directory
    nuxt.options.build.transpile.push(runtimeDir)

    // Register SlotsGame component
    addComponent({
      name: 'SlotsGame',
      filePath: resolver.resolve(runtimeDir, 'components/SlotsGame.vue')
    })

    // Add pixi.js to transpile list
    nuxt.options.build.transpile.push('pixi.js')
  }
})
