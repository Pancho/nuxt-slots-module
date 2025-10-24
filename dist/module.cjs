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
    const resolver = kit.createResolver((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('module.cjs', document.baseURI).href)));
    nuxt.options.runtimeConfig.public.slots = {
      apiEndpoint: options.apiEndpoint,
      defaultConfig: options.defaultConfig
    };
    kit.addComponent({
      name: "SlotsGame",
      filePath: resolver.resolve("./runtime/components/SlotsGame.vue")
    });
    kit.addImportsDir(resolver.resolve("./runtime/composables"));
  }
});

exports.default = module$1;
