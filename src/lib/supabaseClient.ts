import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Read Vite-style env (direct `import.meta.env.*` only — CRA/webpack disallows
 * `const im = import.meta` patterns).
 */
function readViteImportMetaEnv(): { url?: string; key?: string } {
  try {
    const env = import.meta.env;
    if (!env) return {};
    return {
      url: typeof env.VITE_SUPABASE_URL === 'string' ? env.VITE_SUPABASE_URL.trim() : undefined,
      key:
        typeof env.VITE_SUPABASE_ANON_KEY === 'string'
          ? env.VITE_SUPABASE_ANON_KEY.trim()
          : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Resolve Supabase credentials.
 *
 * This project uses Create React App: use `.env` / `.env.local`:
 *   REACT_APP_SUPABASE_URL
 *   REACT_APP_SUPABASE_ANON_KEY (JWT anon) and/or
 *   REACT_APP_SUPABASE_PUBLISHABLE_KEY (sb_publishable_…)
 * Restart `npm start` after changes.
 *
 * Vite: set VITE_SUPABASE_* (read via import.meta.env above).
 */
function resolveSupabaseConfig(): { url: string; key: string } {
  const viteMeta = readViteImportMetaEnv();

  const url =
    process.env.REACT_APP_SUPABASE_URL?.trim() ||
    viteMeta.url ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    '';

  const key =
    process.env.REACT_APP_SUPABASE_ANON_KEY?.trim() ||
    process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    viteMeta.key ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    '';

  return { url, key };
}

const { url: supabaseUrl, key: supabaseAnonKey } = resolveSupabaseConfig();

if (isDev) {
  console.log(
    'SUPABASE URL:',
    import.meta.env?.VITE_SUPABASE_URL ?? '(import.meta.env.VITE_SUPABASE_URL undefined)'
  );
  console.log(
    'SUPABASE KEY:',
    import.meta.env?.VITE_SUPABASE_ANON_KEY != null &&
      String(import.meta.env.VITE_SUPABASE_ANON_KEY) !== ''
      ? `${String(import.meta.env.VITE_SUPABASE_ANON_KEY).slice(0, 14)}…`
      : '(import.meta.env.VITE_SUPABASE_ANON_KEY undefined)'
  );
  console.log('SUPABASE URL (REACT_APP):', process.env.REACT_APP_SUPABASE_URL ?? '(undefined)');
  console.log(
    'SUPABASE KEY (REACT_APP):',
    process.env.REACT_APP_SUPABASE_ANON_KEY != null &&
      process.env.REACT_APP_SUPABASE_ANON_KEY !== ''
      ? `${String(process.env.REACT_APP_SUPABASE_ANON_KEY).slice(0, 14)}…`
      : '(undefined)'
  );
  console.log('SUPABASE resolved URL (used):', supabaseUrl || '(undefined — set REACT_APP_* and restart)');
  console.log(
    'SUPABASE resolved key OK:',
    Boolean(supabaseAnonKey),
    supabaseAnonKey ? `(length ${supabaseAnonKey.length})` : ''
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration.\n\n' +
      'Create React App (this repo): add to `.env` or `.env.local`:\n' +
      '  REACT_APP_SUPABASE_URL=https://<project-ref>.supabase.co\n' +
      '  REACT_APP_SUPABASE_ANON_KEY=<JWT anon> or REACT_APP_SUPABASE_PUBLISHABLE_KEY=<sb_publishable_…>\n\n' +
      'Then stop and run `npm start` again.\n\n' +
      'Vite: use VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

/**
 * SPA OAuth (Google): PKCE + parse ?code= / hash from redirect so session is stored.
 * Without detectSessionInUrl / PKCE, INITIAL_SESSION often stays null after choosing an account.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storage:
        typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);

if (isDev) {
  console.log('[supabaseClient] createClient OK', {
    urlHost: (() => {
      try {
        return new URL(supabaseUrl).host;
      } catch {
        return '(invalid URL)';
      }
    })(),
  });
}

export type TypedSupabaseClient = typeof supabase;
