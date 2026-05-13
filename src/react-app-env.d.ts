/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_SUPABASE_URL?: string;
    readonly REACT_APP_SUPABASE_ANON_KEY?: string;
    readonly REACT_APP_GOOGLE_OAUTH_CLIENT_ID?: string;
    readonly REACT_APP_ENABLE_SUPER_ADMIN_RPC?: string;
  }
}
