/**
 * Super-admin allowlist (public.allowed_admins).
 * Access is enforced by the database policies configured in Supabase.
 */
import { supabase } from '../lib/supabaseClient';

export async function listAllowedAdmins() {
  const { data, error } = await supabase
    .from('allowed_admins')
    .select('id, email, created_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addAllowedAdmin(email) {
  const normalized = String(email || '')
    .toLowerCase()
    .trim();
  if (!normalized || !normalized.includes('@')) {
    throw new Error('Enter a valid email address.');
  }
  const { error } = await supabase.from('allowed_admins').insert({ email: normalized });
  if (error) throw error;
}

export async function removeAllowedAdmin(id) {
  if (!id) throw new Error('Missing id.');
  const { error } = await supabase.from('allowed_admins').delete().eq('id', id);
  if (error) throw error;
}

export async function checkIsSuperAdmin() {
  return false;
}
