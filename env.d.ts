/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MARVEL_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
