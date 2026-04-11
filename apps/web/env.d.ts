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

declare module 'mockjs' {
  export const Random: any
  const Mock: any
  export default Mock
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
