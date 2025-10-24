import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    /**
     * API endpoint for game configuration
     */
    apiEndpoint?: string;
    /**
     * Default game configuration overrides
     */
    defaultConfig?: {
        initialSpins?: number;
        spinTime?: number;
        rows?: number;
        columns?: number;
    };
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

declare module '@nuxt/schema' {
    interface PublicRuntimeConfig {
        slots: ModuleOptions;
    }
}

export { _default as default };
export type { ModuleOptions };
