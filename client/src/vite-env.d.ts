/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_VERSION: string
  readonly VITE_SERVER_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
