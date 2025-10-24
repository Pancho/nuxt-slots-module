'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const kit = require('@nuxt/kit');
const node_url = require('node:url');
const node_path = require('node:path');

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
    const moduleDir = node_path.dirname(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('module.cjs', document.baseURI).href))));
    const possibleRuntimeDirs = [
      node_path.join(moduleDir, "../src/runtime"),
      // For dist build
      node_path.join(moduleDir, "runtime"),
      // For src direct
      node_path.join(moduleDir, "../runtime")
      // Alternative
    ];
    const { existsSync } = require("fs");
    const runtimeDir = possibleRuntimeDirs.find((dir) => existsSync(dir)) || possibleRuntimeDirs[0];
    console.log("\u{1F3B0} Slots module runtime dir:", runtimeDir);
    nuxt.options.build.transpile.push(runtimeDir);
    kit.addComponent({
      name: "SlotsGame",
      filePath: node_path.join(runtimeDir, "components/SlotsGame.vue")
    });
    nuxt.options.build.transpile.push("pixi.js");
  }
});

exports.default = module$1;
