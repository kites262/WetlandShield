/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default component
}

declare module 'autofit.js' {
  interface AutofitOptions {
    el: string
    dw: number
    dh: number
    resize?: boolean
    ignore?: string[]
  }

  interface AutofitInstance {
    init: (options: AutofitOptions) => void
  }

  const autofit: AutofitInstance
  export default autofit
}

declare module 'lodash-es' {
  export const isElement: (...args: any[]) => boolean
}

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_PROXY_TARGET?: string
  readonly VITE_DEV_HOST?: string
  readonly VITE_DEV_PORT?: string
  readonly VITE_PREVIEW_HOST?: string
  readonly VITE_PREVIEW_PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
