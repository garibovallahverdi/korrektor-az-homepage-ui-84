
// types/env.d.ts (veya src/vite-env.d.ts)

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CALLBACK_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}