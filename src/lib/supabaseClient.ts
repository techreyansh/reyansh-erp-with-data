import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const isDev = process.env.NODE_ENV === 'development';
const shouldDebugSupabase = process.env.REACT_APP_SUPABASE_DEBUG === 'true' || process.env.VITE_SUPABASE_DEBUG === 'true';

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL?.trim() ||
  process.env.VITE_SUPABASE_URL?.trim() ||
  '';
const supabaseKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY?.trim() ||
  process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  '';

if (isDev) {
  console.log('SUPABASE URL (REACT_APP):', process.env.REACT_APP_SUPABASE_URL ?? '(undefined)');
  console.log('SUPABASE URL (VITE):', process.env.VITE_SUPABASE_URL ?? '(undefined)');
  console.log(
    'SUPABASE KEY (REACT_APP):',
    process.env.REACT_APP_SUPABASE_ANON_KEY != null &&
      process.env.REACT_APP_SUPABASE_ANON_KEY !== ''
      ? `${String(process.env.REACT_APP_SUPABASE_ANON_KEY).slice(0, 14)}…`
      : '(undefined)'
  );
  console.log(
    'SUPABASE KEY (VITE):',
    process.env.VITE_SUPABASE_ANON_KEY != null &&
      process.env.VITE_SUPABASE_ANON_KEY !== ''
      ? `${String(process.env.VITE_SUPABASE_ANON_KEY).slice(0, 14)}…`
      : '(undefined)'
  );
  console.log('SUPABASE resolved URL (used):', supabaseUrl || '(undefined — set REACT_APP_* and restart)');
  console.log(
    'SUPABASE resolved key OK:',
    Boolean(supabaseKey),
    supabaseKey ? `(length ${supabaseKey.length})` : ''
  );
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration.\n\n' +
      'Create React App (this repo): add to `.env` or `.env.local`:\n' +
      '  REACT_APP_SUPABASE_URL=https://<project-ref>.supabase.co\n' +
      '  REACT_APP_SUPABASE_ANON_KEY=<Supabase publishable or anon key>\n\n' +
      'Then stop and run `npm start` again.'
  );
}

const supabaseFetch: typeof fetch = async (input, init) => {
  const requestUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  const method = init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET') || 'GET';
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    const response = await fetch(input, init);
    if (shouldDebugSupabase && requestUrl.includes('/rest/v1/')) {
      const elapsedMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt);
      const url = new URL(requestUrl);
      const [, table = 'unknown'] = url.pathname.split('/rest/v1/');
      console.log('[supabase:http]', {
        method,
        table: table.split('/')[0],
        query: url.search,
        status: response.status,
        contentRange: response.headers.get('content-range'),
        elapsedMs,
      });
    }
    return response;
  } catch (error) {
    if (shouldDebugSupabase && requestUrl.includes('/rest/v1/')) {
      console.error('[supabase:http]', {
        method,
        url: requestUrl,
        error,
      });
    }
    throw error;
  }
};

/**
 * SPA OAuth (Google): PKCE + parse ?code= / hash from redirect so session is stored.
 * Without detectSessionInUrl / PKCE, INITIAL_SESSION often stays null after choosing an account.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storage:
        typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      fetch: supabaseFetch,
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
