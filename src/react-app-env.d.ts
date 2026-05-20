/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
    readonly VITE_SUPABASE_DEBUG?: string;
    readonly VITE_WHATSAPP_LINK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
