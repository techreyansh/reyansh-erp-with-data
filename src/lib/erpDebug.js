export function isErpDebugEnabled() {
  return import.meta.env.VITE_ERP_DEBUG === 'true' || import.meta.env.VITE_SUPABASE_DEBUG === 'true';
}

export function logErpDebug(event, payload = {}) {
  if (!isErpDebugEnabled()) return;
  console.info(`[ERP_DEBUG] ${event}`, payload);
}
