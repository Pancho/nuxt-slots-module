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
    const runtimeDir = resolver.resolve("./runtime");
    console.log("\u{1F3B0} Slots module runtime dir:", runtimeDir);
    nuxt.options.build.transpile.push(runtimeDir);
    addComponent({
      name: "SlotsGame",
      filePath: resolver.resolve(runtimeDir, "components/SlotsGame.vue")
    });
    nuxt.options.build.transpile.push("pixi.js");
    nuxt.options.build.transpile.push("eventemitter3");
    nuxt.options.vite = nuxt.options.vite || {};
    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {};
    nuxt.options.vite.optimizeDeps.include = nuxt.options.vite.optimizeDeps.include || [];
    nuxt.options.vite.optimizeDeps.include.push("pixi.js", "eventemitter3");
  }
});

export { module as default };
