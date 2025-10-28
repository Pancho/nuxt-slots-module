'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const kit = require('@nuxt/kit');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
const module$1 = kit.defineNuxtModule({
  meta: {
    name: "nuxt-slots-module",
    configKey: "slots",
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  defaults: {},
  setup(options, nuxt) {
    const resolver = kit.createResolver((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('module.cjs', document.baseURI).href)));
    const runtimeDir = resolver.resolve("./runtime");
    console.log("\u{1F3B0} Slots module runtime dir:", runtimeDir);
    nuxt.options.build.transpile.push(runtimeDir);
    kit.addComponent({
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

exports.default = module$1;
