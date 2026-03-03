import { supabase } from '../lib/supabaseClient';

export const requireCEORole = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user?.email) {
    throw new Error('Access Denied – Not authenticated');
  }
  const email = data.session.user.email;
  const { data: row, error: dbError } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .maybeSingle();
  if (dbError || !row || row.role !== 'CEO') {
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
