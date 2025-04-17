/// <reference types="vite/client" />
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  VITE_MAIN_BACKEND_SERVER_ADDRESS: string; // http(s)://<hostname|ip-address>[:<port>]
  VITE_MAIN_BACKEND_SERVER_BASE_PATH: string; // typically specify API version. e.g. "/api/v1"
}

declare global {
  namespace React {
  }

namespace NodeJS {
  // interface ProcessEnv {
  // }
}
}