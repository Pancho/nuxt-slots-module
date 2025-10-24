import { defineNuxtModule, createResolver, addComponent, addImportsDir } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * API endpoint for game configuration
   */
  apiEndpoint?: string

  /**
   * Default game configuration overrides
   */
  defaultConfig?: {
    initialSpins?: number
    spinTime?: number
    rows?: number
    columns?: number
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-slots-module',
    configKey: 'slots',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },

  defaults: {
    apiEndpoint: 'https://frontend-api.engagefactory.dev/api/boosters/spinner/0/en',
    defaultConfig: {
      initialSpins: 15,
      spinTime: 1500,
      rows: 4,
      columns: 5
    }
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add runtime config
    nuxt.options.runtimeConfig.public.slots = {
      apiEndpoint: options.apiEndpoint,
      defaultConfig: options.defaultConfig
    }

    // Auto-import the component
    addComponent({
      name: 'SlotsGame',
      filePath: resolver.resolve('./runtime/components/SlotsGame.vue')
    })

    // Auto-import composables
    addImportsDir(resolver.resolve('./runtime/composables'))
  }
})

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    slots: ModuleOptions
  }
}
