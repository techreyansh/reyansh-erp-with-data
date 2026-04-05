/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_SUPABASE_URL?: string;
    readonly REACT_APP_SUPABASE_ANON_KEY?: string;
    readonly REACT_APP_SUPABASE_PUBLISHABLE_KEY?: string;
    /** Only if injected by tooling; CRA does not load VITE_* from .env by default */
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
  }
}

/**
 * CRA may stub import.meta.env; Vite fills VITE_* here.
 */
interface ImportMeta {
  readonly env: {
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
  };
}
