/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ORS_API_KEY: string;
  // add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
