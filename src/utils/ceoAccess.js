import { supabase } from '../lib/supabaseClient';

export const requireCEORole = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user?.id) {
    throw new Error('Access Denied – Not authenticated');
  }
  const { data: row, error: dbError } = await supabase
    .from('users')
    .select('id, roles ( code )')
    .eq('id', data.session.user.id)
    .maybeSingle();
  if (dbError || !row?.roles || row.roles.code !== 'CEO') {
    throw new Error('Access Denied – Insufficient Privileges');
  }
  return true;
};

export const isCEORole = async () => {
  try {
    await requireCEORole();
    return true;
  } catch {
    return false;
  }
};
