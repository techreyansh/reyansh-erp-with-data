/**
 * Supabase may return OAuth errors in the query string, the hash, or both (e.g. ...#error=...&sb=).
 */

/**
 * After Google sign-in, Supabase sends the user here (app root). Must be in Supabase Redirect URLs.
 * PKCE verifier is per-origin — always use the same origin as the address bar.
 */
export function getOAuthRedirectUrl() {
  if (typeof window === 'undefined') {
    return 'https://reyansh-erp-with-data-wy3j.vercel.app';
  }
  return window.location.origin;
}

/** e.g. https://xxxx.supabase.co — for Google "Authorized JavaScript origins" */
export function getSupabaseProjectOrigin() {
  const raw = process.env.REACT_APP_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw.startsWith('http') ? raw : `https://${raw}`).origin;
  } catch {
    return null;
  }
}

export function getSupabaseGoogleRedirectCallbackUrl() {
  const raw = process.env.REACT_APP_SUPABASE_URL?.trim();
  if (!raw) return 'https://<your-project-ref>.supabase.co/auth/v1/callback';
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return `${u.origin}/auth/v1/callback`;
  } catch {
    return 'https://<your-project-ref>.supabase.co/auth/v1/callback';
  }
}

/**
 * @returns {{ error: string, error_code: string | null, message: string } | null}
 */
export function parseOAuthErrorFromWindow() {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  let err = url.searchParams.get('error');
  let desc = url.searchParams.get('error_description');
  let code = url.searchParams.get('error_code');

  if (url.hash && url.hash.length > 1) {
    const hashQuery = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    const hp = new URLSearchParams(hashQuery);
    if (!err) err = hp.get('error');
    if (!desc) desc = hp.get('error_description');
    if (!code) code = hp.get('error_code');
  }

  if (!err) return null;

  let message = (desc || err).replace(/\+/g, ' ');
  for (let i = 0; i < 4; i += 1) {
    try {
      const next = decodeURIComponent(message);
      if (next === message) break;
      message = next;
    } catch {
      break;
    }
  }

  return { error: err, error_code: code, message };
}

export function clearOAuthCallbackFromBrowserUrl() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  window.history.replaceState({}, document.title, url.pathname || '/');
}

export function googleOAuthExchangeFailureHint() {
  const supabaseCallback = getSupabaseGoogleRedirectCallbackUrl();
  const appOrigin = getOAuthRedirectUrl();
  const supabaseOrigin = getSupabaseProjectOrigin();
  return [
    '',
    'This app uses Google sign-in through Supabase OAuth redirect only.',
    'Vercel environment variables must be set for Production, Preview, and Development:',
    '  REACT_APP_SUPABASE_URL=https://pkwnkfxlhuwnhxbbftmf.supabase.co',
    '  REACT_APP_SUPABASE_ANON_KEY=<publishable key>',
    '  REACT_APP_GOOGLE_OAUTH_CLIENT_ID=<Google Web Client ID used by Supabase>',
    '',
    'Supabase Dashboard → Authentication → URL Configuration → Redirect URLs must include:',
    `  ${appOrigin}`,
    '  https://reyansh-erp-with-data-wy3j.vercel.app',
    '',
    'Google Cloud → Web client → Authorized redirect URIs must include the Supabase callback:',
    `   ${supabaseCallback}`,
    '',
    `Supabase project origin: ${supabaseOrigin || '(not configured)'}`,
    'If sign-in still fails, check Supabase → Logs → Auth for the raw provider error.',
  ].join('\n');
}
