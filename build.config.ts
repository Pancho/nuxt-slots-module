import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/module'
  ],
  externals: [
    '@nuxt/kit',
    '@nuxt/schema',
    'nuxt',
    'vue'
  ],
  declaration: true,
  failOnWarn: false,
  rollup: {
    emitCJS: true
  }
})
