/**
 * Database types for Supabase (sheet-style entities: id, created_at, sort_order, record jsonb).
 * Regenerate or extend when you add tables — keep SHEET_TABLE_NAMES in sync with migrations / db.js.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Raw row as stored in Postgres */
export type SheetEntityRow = {
  id: string;
  created_at: string;
  sort_order: number;
  record: Json;
};

export type SheetEntityInsert = {
  id?: string;
  created_at?: string;
  sort_order?: number;
  record?: Json;
};

export type SheetEntityUpdate = {
  sort_order?: number;
  record?: Json;
  created_at?: string;
};

/** All public tables that use the sheet entity shape (see src/lib/db.js TABLE_NAMES + extra modules). */
export const SHEET_TABLE_NAMES = [
  'allowed_admin_exceptions',
  'allowed_admins',
  'approve_payment_terms_data',
  'approve_strategic_deals_data',
  'attendance_data',
  'audit_log',
  'branches',
  'cable_production_plans',
  'cable_products',
  'check_feasibility_data',
  'client_notifications_data',
  'client_orders_data',
  'client_payments_data',
  'client_quotations_data',
  'clients2',
  'company_bom_data',
  'company_material_issue_data',
  'comparative_statement_data',
  'confirm_standard_and_compliance',
  'costing_data',
  'crm_activity_timeline',
  'crm_leads',
  'crm_quotation_items',
  'crm_quotations',
  'customers',
  'dispatches',
  'document_library',
  'employee_tasks_data',
  'employees_data',
  'evaluate_high_value_prospects_data',
  'fg_material_inward',
  'fg_material_outward',
  'finance_invoices',
  'follow_up_delivery_data',
  'follow_up_quotations_data',
  'generate_grn_data',
  'get_approval_for_sample_data',
  'initial_call_data',
  'inspect_material_data',
  'inspect_sample_data',
  'inventory',
  'log_and_qualify_leads_data',
  'machine_schedules',
  'machine_status_log',
  'material_approval_data',
  'material_inward_data',
  'material_issue_data',
  'mold_compatibility_matrix',
  'notifications_data',
  'po_items',
  'po_master',
  'power_cord_master',
  'ppc_bom_items',
  'ppc_material_consumption',
  'ppc_production_plans',
  'ppc_qc_reports',
  'ppc_work_orders',
  'product_categories',
  'production_monitoring',
  'products',
  'prospects_clients',
  'purchase_flow_data',
  'purchase_flow_steps_data',
  'request_sample_data',
  'return_material_data',
  'rfq_data',
  'roles',
  'sales_flow_data',
  'sales_flow_steps_data',
  'sales_order_items',
  'sales_orders',
  'sample_submission_data',
  'schedule_payment_data',
  'send_quotation_data',
  'sort_vendor_data',
  'stock_data',
  'task_audit_log',
  'task_instances',
  'task_legacy_import',
  'task_submissions',
  'task_templates',
  'units_of_measure',
  'user_roles',
  'user_scores',
  'users',
  'vendors_data',
] as const;

export type SheetTableName = (typeof SHEET_TABLE_NAMES)[number];

type SheetTableDef = {
  Row: SheetEntityRow;
  Insert: SheetEntityInsert;
  Update: SheetEntityUpdate;
  Relationships: [];
};

export type PublicSheetTables = {
  [K in SheetTableName]: SheetTableDef;
};

export type Database = {
  public: {
    Tables: PublicSheetTables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/** Flattened row like getTableRows() in db.js: { id, ...record, record } */
export type FlattenedSheetRow<TRecord extends Record<string, Json | undefined> = Record<string, Json>> = {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  sort_order?: number;
  record: TRecord;
} & TRecord;

/**
 * RLS: ensure policies allow the operations your app needs for each table.
 * Typical dev pattern (not for production): FOR ALL USING (true) WITH CHECK (true) for anon/authenticated.
 * Production: scope by auth.uid(), role, or service role for server-side jobs only.
 */
