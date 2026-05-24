import { activeSupabaseUrl } from './supabaseClient';

/**
 * Supabase may return OAuth errors in the query string, the hash, or both (e.g. ...#error=...&sb=).
 */

/**
 * After Google sign-in, Supabase sends the user here (app root). Must be in Supabase Redirect URLs.
 */
export function getOAuthRedirectUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/** Supabase project origin for Google "Authorized JavaScript origins". */
export function getSupabaseProjectOrigin() {
  const raw = activeSupabaseUrl;
  if (!raw) return null;
  try {
    return new URL(raw.startsWith('http') ? raw : `https://${raw}`).origin;
  } catch {
    return null;
  }
}

export function getSupabaseGoogleRedirectCallbackUrl() {
  const raw = activeSupabaseUrl;
  if (!raw) return '(Supabase URL not configured)';
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return `${u.origin}/auth/v1/callback`;
  } catch {
    return '(Supabase URL not configured)';
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
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for every deployment environment.',
    '',
    'Supabase Dashboard → Authentication → URL Configuration → Redirect URLs must include:',
    `  ${appOrigin}`,
    '',
    'Google Cloud → Web client → Authorized redirect URIs must include the Supabase callback:',
    `   ${supabaseCallback}`,
    '',
    `Supabase project origin: ${supabaseOrigin || '(not configured)'}`,
    'If sign-in still fails, check Supabase → Logs → Auth for the raw provider error.',
  ].join('\n');
}
