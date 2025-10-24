import { defineNuxtModule, createResolver, addComponent } from '@nuxt/kit';

const module = defineNuxtModule({
  meta: {
    name: "nuxt-slots-module",
    configKey: "slots",
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const runtimeDir = resolver.resolve("../runtime");
    nuxt.options.build.transpile.push(runtimeDir);
    addComponent({
      name: "SlotsGame",
      filePath: resolver.resolve(runtimeDir, "components/SlotsGame.vue")
    });
    nuxt.options.build.transpile.push("pixi.js");
  }
});

export { module as default };
