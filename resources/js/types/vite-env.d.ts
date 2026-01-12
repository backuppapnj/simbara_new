/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
    import { RegisterSWOptions } from 'vite-plugin-pwa';

    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => void;
}
