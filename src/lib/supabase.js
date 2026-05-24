import { createClient } from '@supabase/supabase-js';
import { logErpDebug } from './erpDebug';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
const shouldDebugSupabase = import.meta.env.VITE_SUPABASE_DEBUG === 'true';

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.'
  );
}

const supabaseFetch = async (input, init) => {
  const response = await fetch(input, init);
  if (shouldDebugSupabase) {
    const requestUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    if (requestUrl.includes('/rest/v1/')) {
      const url = new URL(requestUrl);
      const [, table = 'unknown'] = url.pathname.split('/rest/v1/');
      console.log('[supabase:http]', {
        method: init?.method || 'GET',
        table: table.split('/')[0],
        query: url.search,
        status: response.status,
        contentRange: response.headers.get('content-range'),
      });
    }
  }
  return response;
};

export const activeSupabaseUrl = supabaseUrl;

logErpDebug('ACTIVE_DB', {
  url: activeSupabaseUrl,
  projectId: (() => {
    try {
      return new URL(activeSupabaseUrl).host.split('.')[0];
    } catch {
      return null;
    }
  })(),
  clientFile: 'src/lib/supabase.js',
});

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    fetch: supabaseFetch,
  },
});

export default supabase;
