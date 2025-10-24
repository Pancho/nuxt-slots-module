import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    apiEndpoint?: string;
    apiHeaders?: Record<string, string>;
    defaultConfig?: any;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
