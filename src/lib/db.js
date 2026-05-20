/**
 * Supabase table access: one table per ERP entity with compatibility for
 * flat tables and sheet-style `record` jsonb tables.
 */
import { supabase } from './supabaseClient';
import config from '../config/config';

const KNOWN_SUPABASE_TABLES = new Set([
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
]);

const UNMAPPED_TABLE_PREFIX = '__unmapped__:';

function toSnakeCase(value) {
  return String(value)
    .replace(/\s+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

function toKnownTableName(tableName, fallbackName) {
  if (tableName && KNOWN_SUPABASE_TABLES.has(tableName)) return tableName;
  const fallback = fallbackName ? toSnakeCase(fallbackName) : tableName;
  return `${UNMAPPED_TABLE_PREFIX}${fallback || 'unknown'}`;
}

export const TABLE_NAMES = {
  // Auth & users
  Users: 'users',
  users: 'users',
  Metrics: 'costing_data',
  metrics: 'costing_data',

  // Clients — new rebuild uses public.clients2 as the ERP client table.
  CLIENT: 'clients2',
  clients: 'clients2',
  PROSPECTS_CLIENTS: 'prospects_clients',
  prospects_clients: 'prospects_clients',
  Client_Orders: 'client_orders_data',
  client_orders: 'client_orders_data',
  Client_Payments: 'client_payments_data',
  client_payments: 'client_payments_data',
  Client_Quotations: 'client_quotations_data',
  client_quotations: 'client_quotations_data',
  Client_Notifications: 'client_notifications_data',
  client_notifications: 'client_notifications_data',

  // Vendors & stock
  Vendor: 'vendors_data',
  Vendors: 'vendors_data',
  vendors: 'vendors_data',
  Stock: 'stock_data',
  stock: 'stock_data',
  'Material Inward': 'material_inward_data',
  'Material Issue': 'material_issue_data',
  BOM: 'company_bom_data',
  'Kitting Sheet': 'company_material_issue_data',
  'Finished Goods': 'fg_material_inward',

  // Dispatches
  Dispatches: 'dispatches',
  dispatches: 'dispatches',

  // Purchase flow
  Purchase_Flow: 'purchase_flow_data',
  PurchaseFlow: 'purchase_flow_data',
  purchase_flows: 'purchase_flow_data',
  purchase_flow_data: 'purchase_flow_data',
  PurchaseFlowSteps: 'purchase_flow_steps_data',
  purchase_flow_steps: 'purchase_flow_steps_data',
  purchase_flow_steps_data: 'purchase_flow_steps_data',
  PurchaseFlowDocuments: 'document_library',
  PurchaseFlowVendors: 'vendors_data',
  PurchaseFlowApprovals: 'task_instances',
  PurchaseFlowPayments: 'client_payments_data',

  // Sales flow
  SalesFlow: 'sales_flow_data',
  sales_flows: 'sales_flow_data',
  sales_flow_data: 'sales_flow_data',
  SalesFlowSteps: 'sales_flow_steps_data',
  sales_flow_steps: 'sales_flow_steps_data',
  sales_flow_steps_data: 'sales_flow_steps_data',
  LogAndQualifyLeads: 'log_and_qualify_leads_data',
  InitialCall: 'initial_call_data',
  SendQuotation: 'send_quotation_data',
  ApprovePaymentTerms: 'approve_payment_terms_data',
  SampleSubmission: 'sample_submission_data',
  GetApprovalForSample: 'get_approval_for_sample_data',
  ApproveStrategicDeals: 'approve_strategic_deals_data',
  EvaluateHighValueProspects: 'evaluate_high_value_prospects_data',
  CheckFeasibility: 'check_feasibility_data',
  ConfirmStandardAndCompliance: 'confirm_standard_and_compliance',
  FollowUpQuotations: 'follow_up_quotations_data',
  'Comparative Statement': 'comparative_statement_data',
  SheetApproveQuotation: 'comparative_statement_data',
  RequestSample: 'request_sample_data',
  InspectMaterial: 'inspect_material_data',
  MaterialApproval: 'material_approval_data',
  PlacePO: 'po_items',
  ReturnHistory: 'return_material_data',
  GenerateGRN: 'generate_grn_data',
  SchedulePayment: 'schedule_payment_data',
  ReleasePayment: 'schedule_payment_data',

  // Logs & products
  Audit_Log: 'audit_log',
  audit_log: 'audit_log',
  PRODUCT: 'products',
  products: 'products',
  PO_Master: 'po_master',
  po_master: 'po_master',
  SO_Master: 'sales_orders',
  so_master: 'sales_orders',
  Inventory: 'inventory',
  inventory: 'inventory',
  inventory_data: 'inventory',
  Daily_CAPACITY: 'dispatches',
  daily_capacity: 'dispatches',
  'Cable Products': 'cable_products',
  cable_products: 'cable_products',
  'Cable Production Plans': 'cable_production_plans',
  cable_production_plans: 'cable_production_plans',
  'Machine Schedules': 'machine_schedules',
  machine_schedules: 'machine_schedules',
  RFQ: 'rfq_data',
  rfq: 'rfq_data',
  BOM_Templates: 'company_bom_data',
  bom_templates: 'company_bom_data',
  SortVendor: 'sort_vendor_data',
  sort_vendor: 'sort_vendor_data',
  FollowUpDelivery: 'follow_up_delivery_data',
  follow_up_delivery: 'follow_up_delivery_data',
  ReturnMaterial: 'return_material_data',
  return_material: 'return_material_data',
  InspectSample: 'inspect_sample_data',
  inspect_sample: 'inspect_sample_data',

  // HR / admin custom data tables
  Employees: 'employees_data',
  employees: 'employees_data',
  Performance: 'user_scores',
  performance: 'user_scores',
  Attendance: 'attendance_data',
  attendance: 'attendance_data',
  EmployeeTasks: 'task_instances',
  employee_tasks: 'task_instances',
  Notifications: 'task_audit_log',
  notifications: 'task_audit_log',

  // CRM / payment reminder tables
  CRM_Opportunities: 'crm_quotations',
  CRM_Activities: 'crm_activity_timeline',
  CRM_Interactions: 'crm_activity_timeline',
  CRM_Tasks: 'task_instances',
  CRM_Notes: 'crm_activity_timeline',
  CRM_OrderTaking: 'sales_orders',
  CRM_CallLogs: 'crm_activity_timeline',
  CRM_Payments: 'client_payments_data',
  CRM_Invoices: 'finance_invoices',
  CRM_ReminderTemplates: 'client_notifications_data',
  CRM_Communications: 'client_notifications_data',
  CRM_CallTasks: 'task_instances',
  CRM_TaskLogs: 'task_audit_log',
  Petty_Cash: 'client_payments_data',
  Enquiries: 'crm_leads',
  Enquiries_Export: 'crm_leads',
  Enquiries_IndiaMart: 'crm_leads',
  Checklists: 'task_templates',
  Delegation: 'task_instances',
  MIS_Scores: 'user_scores',
  Delegation_Scores: 'user_scores',
  Employee_Dashboards: 'employees_data',
  Quotation_Formats: 'send_quotation_data',
  'Company BOM': 'company_bom_data',
  'Company Material Issues': 'company_material_issue_data',
  'Bill of Materials': 'company_bom_data',
  'FG Material Inward': 'fg_material_inward',
  'FG Material Outward': 'fg_material_outward',
  'FG Stock': 'stock_data',
  'FG Billing': 'sales_orders',
  'Customer Orders': 'sales_orders',
  SCOT_Sheet: 'task_instances',
  Die_Repair: 'task_instances',
  HR_Induction: 'task_instances',
  HR_Resignation: 'task_instances',
  Costing: 'costing_data',
  Costing_Breakup: 'costing_data',
  'Material Requisitions': 'inventory',
  'Production Orders': 'ppc_production_plans',
};

const TABLE_ALIASES = {
  clients2: ['prospects_clients'],
  sales_orders: ['client_orders_data'],
  send_quotation_data: ['client_quotations_data'],
  task_instances: ['employee_tasks_data'],
  task_audit_log: ['notifications_data'],
  stock_data: ['inventory'],
  company_bom_data: ['ppc_bom_items'],
  schedule_payment_data: ['client_payments_data'],
  document_library: [],
};

const tableNameCache = new Map();
const ROW_METADATA_KEYS = new Set([
  'id',
  'created_at',
  'updated_at',
  'deleted_at',
  'sort_order',
  'record',
]);

function uniq(values) {
  return values.filter((value, index, array) => value && array.indexOf(value) === index);
}

export function getTableCandidateNames(tableName) {
  const primary = getTableName(tableName);
  if (!primary) return [];
  if (String(primary).startsWith(UNMAPPED_TABLE_PREFIX)) return [];
  const cached = tableNameCache.get(primary);
  const aliases = TABLE_ALIASES[primary] || [];
  return uniq([cached, primary, ...aliases]).filter((name) => KNOWN_SUPABASE_TABLES.has(name));
}

function rememberResolvedTableName(primary, resolvedName) {
  if (primary && resolvedName && primary !== resolvedName) {
    tableNameCache.set(primary, resolvedName);
  }
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function parseRecordValue(value) {
  if (isPlainObject(value)) return value;
  if (typeof value !== 'string' || value.trim() === '') return {};
  try {
    const parsed = JSON.parse(value);
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function hasMeaningfulValue(value) {
  return value != null && value !== '';
}

function getFlatRecordFields(row) {
  if (!row || typeof row !== 'object') return row;
  return Object.entries(row).reduce((acc, [key, value]) => {
    if (!ROW_METADATA_KEYS.has(key) && value !== undefined) acc[key] = value;
    return acc;
  }, {});
}

function mergeRecordFields(flatFields, recordFields) {
  const merged = { ...flatFields };
  Object.entries(recordFields).forEach(([key, value]) => {
    if (hasMeaningfulValue(value) || !hasMeaningfulValue(merged[key])) {
      merged[key] = value;
    }
  });
  return merged;
}

function getNaturalRowId(record) {
  return (
    record.id ||
    record.ClientCode ||
    record.clientCode ||
    record.clientcode ||
    record['Vendor Code'] ||
    record.VendorCode ||
    record.UniqueId ||
    record.DispatchUniqueId ||
    record.POId ||
    record.FlowId ||
    record.LogId ||
    record.EmployeeCode ||
    record.ProductCode ||
    record.Code ||
    null
  );
}

function getNaturalKeyColumns(row, id) {
  if (!row || typeof row !== 'object' || id == null) return [];
  return [
    'ClientCode',
    'clientCode',
    'clientcode',
    'Vendor Code',
    'VendorCode',
    'UniqueId',
    'DispatchUniqueId',
    'POId',
    'FlowId',
    'LogId',
    'EmployeeCode',
    'ProductCode',
    'Code',
  ].filter((key, index, keys) => row[key] === id && keys.indexOf(key) === index);
}

export function toErpCompatibleRow(row) {
  if (!row || typeof row !== 'object') return row;
  const flatFields = getFlatRecordFields(row);
  const parsedRecord = parseRecordValue(row.record);
  const record = mergeRecordFields(flatFields, parsedRecord);
  return {
    ...record,
    id: row.id ?? getNaturalRowId(record),
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
    sort_order: row.sort_order,
    record,
  };
}

export function toRecordPayload(row) {
  if (!row || typeof row !== 'object') return {};
  return getFlatRecordFields(toErpCompatibleRow(row));
}

/** True when table is not the wrapped shape (id, sort_order, record jsonb) — use select * / direct rows. */
function isLegacyJsonSchemaError(error) {
  if (!error) return false;
  // PostgREST/Postgres: column does not exist (e.g. flat legacy tables)
  if (String(error.code || '') === '42703') return true;
  const msg = String(error?.message || '').toLowerCase();
  return (
    msg.includes('sort_order') ||
    msg.includes('record') ||
    msg.includes('created_at') ||
    (msg.includes('column') && msg.includes('does not exist'))
  );
}

function isPostgrestMissingTableError(error) {
  if (!error) return false;
  const m = String(error.message || error.details || error.hint || '').toLowerCase();
  return (
    m.includes('schema cache') ||
    m.includes('pgrst205') ||
    m.includes('could not find the table') ||
    (m.includes('relation') && m.includes('does not exist'))
  );
}

const SEND_QUOTATION_PHYSICAL = ['send_quotation_data', 'client_quotations_data'];

/**
 * Read SendQuotation rows from whichever physical table exists (migration name first).
 */
export async function getSendQuotationRows() {
  let lastErr;
  for (const name of SEND_QUOTATION_PHYSICAL) {
    try {
      return await getTableRows(name);
    } catch (err) {
      lastErr = err;
      if (isPostgrestMissingTableError(err)) continue;
      throw err;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

/**
 * Insert into the active send quotation table.
 */
export async function insertSendQuotationRow(row) {
  let lastErr;
  for (const name of SEND_QUOTATION_PHYSICAL) {
    try {
      await insertTableRow(name, row);
      return;
    } catch (err) {
      lastErr = err;
      if (isPostgrestMissingTableError(err)) continue;
      throw err;
    }
  }
  throw lastErr || new Error('Send quotation table not available');
}

const isDev = () => typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

async function getAuthUserIdForDebug() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

function logSupabaseDataDebug(payload) {
  console.log('[supabase:data]', payload);
}

function debugGetTableRows(phase, payload) {
  if (!isDev()) return;
  console.log('[db.getTableRows]', phase, payload);
}

/**
 * Resolve logical sheet/table name to actual table name.
 * @param {string} logicalName - e.g. 'Users', 'CLIENT', config.sheets.users
 * @returns {string} snake_case table name
 */
export function getTableName(logicalName) {
  if (!logicalName) return logicalName;
  if (String(logicalName).startsWith(UNMAPPED_TABLE_PREFIX)) return String(logicalName);
  if (Object.prototype.hasOwnProperty.call(TABLE_NAMES, logicalName)) {
    return toKnownTableName(TABLE_NAMES[logicalName], logicalName);
  }
  // Fallback: convert to snake_case (simple)
  const snake = toSnakeCase(logicalName);
  return KNOWN_SUPABASE_TABLES.has(snake) ? snake : `${UNMAPPED_TABLE_PREFIX}${snake}`;
}

/**
 * Get all rows from a table as flattened objects { id, ...record }.
 * @param {string} tableName - logical or actual table name (e.g. 'Users', 'clients')
 * @returns {Promise<Array<{ id: string, ... }>>}
 */
export async function getTableRows(tableName) {
  const primaryName = getTableName(tableName);
  const candidateNames = getTableCandidateNames(tableName);
  const authUserId = await getAuthUserIdForDebug();
  debugGetTableRows('invoke', { tableName, resolvedName: primaryName, candidateNames, useLocalStorage: config.useLocalStorage });
  logSupabaseDataDebug({
    operation: 'select',
    logicalTable: tableName,
    resolvedTable: primaryName,
    candidates: candidateNames,
    query: 'select * ordered by sort_order/created_at; fallback select *',
    authUserId,
  });

  let lastMissingTableError = null;

  for (const name of candidateNames) {
    const { data: rows, error } = await supabase
      .from(name)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      debugGetTableRows('primary select error', { resolvedName: name, error });
      if (isPostgrestMissingTableError(error)) {
        lastMissingTableError = error;
        logSupabaseDataDebug({
          operation: 'select',
          table: name,
          query: 'select * ordered by sort_order/created_at',
          rowCount: null,
          authUserId,
          error,
        });
        continue;
      }
      // Fallback for direct-column tables (no sort_order/record wrapper)
      if (!isLegacyJsonSchemaError(error)) {
        console.error(`Error getTableRows(${name}):`, error);
        logSupabaseDataDebug({
          operation: 'select',
          table: name,
          query: 'select * ordered by sort_order/created_at',
          rowCount: null,
          authUserId,
          error,
        });
        throw error;
      }
      // Legacy flat tables may omit created_at/sort_order/record — select all columns, no order.
      const { data: directRows, error: directErr } = await supabase.from(name).select('*');
      if (directErr) {
        if (isPostgrestMissingTableError(directErr)) {
          lastMissingTableError = directErr;
          logSupabaseDataDebug({
            operation: 'select',
            table: name,
            query: 'select *',
            rowCount: null,
            authUserId,
            error: directErr,
          });
          continue;
        }
        console.error(`Error getTableRows(${name}) [direct]:`, directErr);
        debugGetTableRows('fallback select error', { resolvedName: name, error: directErr });
        logSupabaseDataDebug({
          operation: 'select',
          table: name,
          query: 'select *',
          rowCount: null,
          authUserId,
          error: directErr,
        });
        throw directErr;
      }
      rememberResolvedTableName(primaryName, name);
      debugGetTableRows('fallback success', { resolvedName: name, rowCount: (directRows || []).length });
      logSupabaseDataDebug({
        operation: 'select',
        table: name,
        query: 'select *',
        rowCount: (directRows || []).length,
        authUserId,
        error: null,
      });
      return (directRows || []).map(toErpCompatibleRow);
    }

    rememberResolvedTableName(primaryName, name);
    debugGetTableRows('success', { resolvedName: name, rowCount: (rows || []).length });
    logSupabaseDataDebug({
      operation: 'select',
      table: name,
      query: 'select * ordered by sort_order/created_at',
      rowCount: (rows || []).length,
      authUserId,
      error: null,
    });
    return (rows || []).map(toErpCompatibleRow);
  }

  if (lastMissingTableError) {
    console.warn(`No Supabase table found for ${primaryName}; returning an empty list.`, lastMissingTableError);
    logSupabaseDataDebug({
      operation: 'select',
      table: primaryName,
      query: 'all candidates',
      rowCount: 0,
      authUserId,
      error: lastMissingTableError,
    });
    return [];
  }

  logSupabaseDataDebug({
    operation: 'select',
    table: primaryName,
    query: 'no candidates',
    rowCount: 0,
    authUserId,
    error: null,
  });
  return [];
}

/**
 * Insert a row. Uses record = row and auto sort_order.
 * @param {string} tableName
 * @param {object} row - data object (no id)
 * @returns {Promise<object>}
 */
export async function insertTableRow(tableName, row) {
  const primaryName = getTableName(tableName);
  const safeRow =
    typeof row === 'object' && row !== null && !Array.isArray(row) ? toRecordPayload(row) : {};

  let lastMissingTableError = null;
  for (const name of getTableCandidateNames(tableName)) {
    let nextOrder = 0;
    const { data: maxRow, error: maxErr } = await supabase
      .from(name)
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!maxErr && typeof maxRow?.sort_order === 'number') {
      nextOrder = maxRow.sort_order + 1;
    } else if (maxErr) {
      if (isPostgrestMissingTableError(maxErr)) {
        lastMissingTableError = maxErr;
        continue;
      }
      if (!isLegacyJsonSchemaError(maxErr)) {
        console.error(`Error insertTableRow(${name}) [max sort]:`, maxErr);
        throw maxErr;
      }
    }

    /** Prefer jsonb `record` (canonical sheet migration). Do not skip this when sort_order query failed. */
    const wrappedAttempts = [
      { sort_order: nextOrder, record: safeRow },
      { record: safeRow },
    ];

    let shouldTryDirect = false;
    for (const payload of wrappedAttempts) {
      const { error } = await supabase.from(name).insert(payload);
      if (!error) {
        rememberResolvedTableName(primaryName, name);
        return {};
      }
      if (isPostgrestMissingTableError(error)) {
        lastMissingTableError = error;
        shouldTryDirect = false;
        break;
      }
      if (isLegacyJsonSchemaError(error)) {
        shouldTryDirect = true;
        continue;
      }
      console.error(`Error insertTableRow(${name}):`, error);
      throw error;
    }

    if (!shouldTryDirect) continue;

    const { error: directErr } = await supabase.from(name).insert(safeRow);
    if (!directErr) {
      rememberResolvedTableName(primaryName, name);
      return {};
    }
    if (isPostgrestMissingTableError(directErr)) {
      lastMissingTableError = directErr;
      continue;
    }
    console.error(`Error insertTableRow(${name}) [direct]:`, directErr);
    throw directErr;
  }

  throw lastMissingTableError || new Error(`No Supabase table found for ${primaryName}`);
}

/**
 * Update a row by id. Sets record = row.
 * @param {string} tableName
 * @param {string} id - uuid
 * @param {object} row - full record to store
 */
export async function updateTableRowById(tableName, id, row) {
  const primaryName = getTableName(tableName);
  let lastMissingTableError = null;
  const safeRecord = toRecordPayload(row);

  for (const name of getTableCandidateNames(tableName)) {
    const { error } = await supabase
      .from(name)
      .update({ record: safeRecord })
      .eq('id', id);

    if (!error) {
      rememberResolvedTableName(primaryName, name);
      return;
    }
    if (isPostgrestMissingTableError(error)) {
      lastMissingTableError = error;
      continue;
    }
    if (!isLegacyJsonSchemaError(error)) {
      console.error(`Error updateTableRowById(${name}, ${id}):`, error);
      throw error;
    }

    const directPayload = safeRecord;
    const { error: directErr } = await supabase
      .from(name)
      .update(directPayload)
      .eq('id', id);

    if (!directErr) {
      rememberResolvedTableName(primaryName, name);
      return;
    }
    if (isLegacyJsonSchemaError(directErr)) {
      const keyColumns = getNaturalKeyColumns(directPayload, id);
      for (const keyColumn of keyColumns) {
        const { error: keyedErr } = await supabase
          .from(name)
          .update(directPayload)
          .eq(keyColumn, id);
        if (!keyedErr) {
          rememberResolvedTableName(primaryName, name);
          return;
        }
      }
    }
    if (isPostgrestMissingTableError(directErr)) {
      lastMissingTableError = directErr;
      continue;
    }
    console.error(`Error updateTableRowById(${name}, ${id}) [direct]:`, directErr);
    throw directErr;
  }

  throw lastMissingTableError || new Error(`No Supabase table found for ${primaryName}`);
}

/**
 * Delete a row by id.
 * @param {string} tableName
 * @param {string} id
 */
export async function deleteTableRowById(tableName, id) {
  const primaryName = getTableName(tableName);
  let lastMissingTableError = null;

  for (const name of getTableCandidateNames(tableName)) {
    const { error } = await supabase.from(name).delete().eq('id', id);
    if (!error) {
      rememberResolvedTableName(primaryName, name);
      return;
    }
    if (isLegacyJsonSchemaError(error)) {
      const keyColumns = [
        'ClientCode',
        'clientCode',
        'clientcode',
        'Vendor Code',
        'VendorCode',
        'UniqueId',
        'DispatchUniqueId',
        'POId',
        'FlowId',
        'LogId',
        'EmployeeCode',
        'ProductCode',
        'Code',
      ];
      for (const keyColumn of keyColumns) {
        const { error: keyedErr } = await supabase.from(name).delete().eq(keyColumn, id);
        if (!keyedErr) {
          rememberResolvedTableName(primaryName, name);
          return;
        }
      }
    }
    if (isPostgrestMissingTableError(error)) {
      lastMissingTableError = error;
      continue;
    }
    console.error(`Error deleteTableRowById(${name}, ${id}):`, error);
    throw error;
  }

  throw lastMissingTableError || new Error(`No Supabase table found for ${primaryName}`);
}

/**
 * Update row by 1-based row index (1 = header, 2 = first data row).
 * @param {string} tableName
 * @param {number} rowIndex
 * @param {object} rowData
 */
export async function updateRowByIndex(tableName, rowIndex, rowData) {
  const rows = await getTableRows(tableName);
  const dataIndex = rowIndex - 2;
  const row = rows[dataIndex];
  if (!row?.id) throw new Error(`Row at index ${rowIndex} not found`);
  const existing = toRecordPayload(row);
  const merged = toRecordPayload({ ...existing, ...(rowData || {}) });
  await updateTableRowById(tableName, row.id, merged);
}

/**
 * Delete row by 1-based row index.
 * @param {string} tableName
 * @param {number} rowIndex
 */
export async function deleteRowByIndex(tableName, rowIndex) {
  const rows = await getTableRows(tableName);
  const dataIndex = rowIndex - 2;
  const row = rows[dataIndex];
  if (!row?.id) throw new Error(`Row at index ${rowIndex} not found`);
  await deleteTableRowById(tableName, row.id);
}

/**
 * Get column names from first row (for compatibility).
 * @param {string} tableName
 * @returns {Promise<string[]>}
 */
export async function getTableHeaders(tableName) {
  const data = await getTableRows(tableName);
  return data.length > 0 ? Object.keys(data[0]).filter((k) => !ROW_METADATA_KEYS.has(k)) : [];
}

/**
 * Insert multiple rows. Each row can be object or array (converted to object).
 * @param {string} tableName
 * @param {Array<object|Array>} rows
 */
export async function batchInsertTableRows(tableName, rows) {
  const primaryName = getTableName(tableName);
  if (!rows?.length) return;

  const normalizeRow = (row) =>
    Array.isArray(row)
      ? Object.fromEntries(row.map((v, j) => [`col_${j}`, v]))
      : (row && typeof row === 'object' ? toRecordPayload(row) : {});

  let lastMissingTableError = null;

  for (const name of getTableCandidateNames(tableName)) {
    let nextOrder = -1;
    const { data: maxRow, error: maxErr } = await supabase
      .from(name)
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    let shouldFallbackToDirect = !!maxErr && isLegacyJsonSchemaError(maxErr);
    let legacyFailedMidway = false;

    if (maxErr && isPostgrestMissingTableError(maxErr)) {
      lastMissingTableError = maxErr;
      continue;
    }

    if (!maxErr) {
      if (maxRow?.sort_order != null) nextOrder = maxRow.sort_order;
      for (let i = 0; i < rows.length; i++) {
        nextOrder += 1;
        const record = normalizeRow(rows[i]);
        const { error } = await supabase.from(name).insert({ sort_order: nextOrder, record });
        if (error) {
          if (isPostgrestMissingTableError(error)) {
            lastMissingTableError = error;
            legacyFailedMidway = true;
            shouldFallbackToDirect = false;
            break;
          }
          if (isLegacyJsonSchemaError(error)) {
            legacyFailedMidway = true;
            break;
          }
          throw error;
        }
      }
      if (!legacyFailedMidway) {
        rememberResolvedTableName(primaryName, name);
        return;
      }
      if (shouldFallbackToDirect !== false) shouldFallbackToDirect = true;
    } else if (!isLegacyJsonSchemaError(maxErr)) {
      throw maxErr;
    }

    if (!shouldFallbackToDirect) continue;

    let directMissing = false;
    for (let i = 0; i < rows.length; i++) {
      const directPayload = normalizeRow(rows[i]);
      const { error } = await supabase.from(name).insert(directPayload);
      if (error) {
        if (isPostgrestMissingTableError(error)) {
          lastMissingTableError = error;
          directMissing = true;
          break;
        }
        throw error;
      }
    }
    if (!directMissing) {
      rememberResolvedTableName(primaryName, name);
      return;
    }
  }

  throw lastMissingTableError || new Error(`No Supabase table found for ${primaryName}`);
}

/**
 * Upload file to Supabase storage. Returns path or local fallback id.
 * @param {File} file
 * @param {string|null} folderId
 * @returns {Promise<string>}
 */
export async function uploadFile(file, folderId = null) {
  if (config.useLocalStorage) return `local_${Date.now()}_${file.name}`;
  try {
    const path = `${folderId || 'uploads'}/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
    const { data, error } = await supabase.storage.from('documents').upload(path, file, { upsert: false });
    if (error) throw error;
    return data?.path || path;
  } catch (error) {
    console.warn('Upload failed:', error);
    return `local_${Date.now()}_${file.name}`;
  }
}

/**
 * Get latest dispatch limit range for a date from daily_capacity table.
 * @param {string} tableName - e.g. 'daily_capacity'
 * @param {Date} forDate
 * @returns {Promise<{ startDate: Date, endDate: Date, limit: number }|null>}
 */
export async function getLatestDispatchLimitRange(tableName = 'daily_capacity', forDate = new Date()) {
  const data = await getTableRows(tableName);
  if (!data || data.length === 0) return null;
  let latest = null;
  const checkDate = new Date(forDate);
  data.forEach((row) => {
    const start = row['Start Date'] || row.startDate || row.start_date;
    const end = row['End Date'] || row.endDate || row.end_date;
    const limit = row.Limit || row.limit;
    if (!start || !end || !limit) return;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (checkDate >= startDate && checkDate <= endDate) {
      latest = { startDate, endDate, limit: parseInt(limit, 10) };
    }
  });
  if (!latest && data.length > 0) {
    const last = data[data.length - 1];
    latest = {
      startDate: new Date(last['Start Date'] || last.startDate || last.start_date),
      endDate: new Date(last['End Date'] || last.endDate || last.end_date),
      limit: parseInt(last.Limit || last.limit, 10),
    };
  }
  return latest;
}

export default {
  getTableName,
  getTableRows,
  getSendQuotationRows,
  insertTableRow,
  insertSendQuotationRow,
  updateTableRowById,
  deleteTableRowById,
  updateRowByIndex,
  deleteRowByIndex,
  getTableHeaders,
  batchInsertTableRows,
  uploadFile,
  getLatestDispatchLimitRange,
  TABLE_NAMES,
};
