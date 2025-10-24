import { defineNuxtModule, addComponent } from '@nuxt/kit';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
    const moduleDir = dirname(fileURLToPath(import.meta.url));
    const possibleRuntimeDirs = [
      join(moduleDir, "../src/runtime"),
      // For dist build
      join(moduleDir, "runtime"),
      // For src direct
      join(moduleDir, "../runtime")
      // Alternative
    ];
    const { existsSync } = require("fs");
    const runtimeDir = possibleRuntimeDirs.find((dir) => existsSync(dir)) || possibleRuntimeDirs[0];
    console.log("\u{1F3B0} Slots module runtime dir:", runtimeDir);
    nuxt.options.build.transpile.push(runtimeDir);
    addComponent({
      name: "SlotsGame",
      filePath: join(runtimeDir, "components/SlotsGame.vue")
    });
    nuxt.options.build.transpile.push("pixi.js");
  }
});

export { module as default };
