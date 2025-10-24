import { defineNuxtModule, createResolver, addComponent, addImportsDir } from '@nuxt/kit';

const module = defineNuxtModule({
  meta: {
    name: "nuxt-slots-module",
    configKey: "slots",
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  defaults: {
    apiEndpoint: "https://frontend-api.engagefactory.dev/api/boosters/spinner/0/en",
    defaultConfig: {
      initialSpins: 15,
      spinTime: 1500,
      rows: 4,
      columns: 5
    }
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    nuxt.options.runtimeConfig.public.slots = {
      apiEndpoint: options.apiEndpoint,
      defaultConfig: options.defaultConfig
    };
    addComponent({
      name: "SlotsGame",
      filePath: resolver.resolve("./runtime/components/SlotsGame.vue")
    });
    addImportsDir(resolver.resolve("./runtime/composables"));
  }
});

export { module as default };
