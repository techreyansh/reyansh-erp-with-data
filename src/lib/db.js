/**
 * Supabase table access: one table per entity (no sheet_rows / sheet_name).
 * All tables have: id, created_at, sort_order, record jsonb.
 */
import { supabase } from './supabaseClient';
import config from '../config/config';

const KNOWN_SUPABASE_TABLES = new Set([
  'approve_payment_terms',
  'approve_strategic_deals',
  'audit_log',
  'audit_logs',
  'bom',
  'bom_templates',
  'branches',
  'check_feasibility',
  'clients',
  'comparative_statement',
  'confirm_standard_and_compliance',
  'crm_activities',
  'crm_calllogs',
  'crm_calltasks',
  'crm_communications',
  'crm_interactions',
  'crm_invoices',
  'crm_logs',
  'crm_notes',
  'crm_opportunities',
  'crm_ordertaking',
  'crm_payments',
  'crm_reminder_templates',
  'crm_tasklogs',
  'crm_tasks',
  'customers',
  'daily_capacity',
  'dispatches',
  'documents',
  'employees',
  'evaluate_high_value_prospects',
  'finished_goods',
  'follow_up_delivery',
  'follow_up_quotations',
  'generate_grn',
  'get_approval_for_sample',
  'initial_call',
  'inspect_material',
  'inspect_sample',
  'inventory',
  'inventory_batches',
  'inventory_movements',
  'inventory_stock',
  'inventory_transactions',
  'kitting_sheet',
  'log_and_qualify_leads',
  'material_approval',
  'material_inward',
  'material_issue',
  'payments',
  'place_po',
  'po_import_temp',
  'po_master',
  'product_categories',
  'products',
  'prospects_clients',
  'purchase_flow_steps',
  'purchase_flows',
  'purchase_order_items',
  'purchase_order_steps',
  'purchase_orders',
  'release_payment',
  'request_sample',
  'return_history',
  'return_material',
  'rfq',
  'roles',
  'sales_flow_steps',
  'sales_flows',
  'sales_order_items',
  'sales_order_steps',
  'sales_orders',
  'sample_submission',
  'schedule_payment',
  'send_quotation',
  'sheet_approve_quotation',
  'sort_vendor',
  'stock',
  'units_of_measure',
  'users',
  'whatsapp_logs',
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

  // Clients — canonical migration table is public.clients.
  CLIENT: 'clients',
  clients: 'clients',
  PROSPECTS_CLIENTS: 'prospects_clients',
  prospects_clients: 'prospects_clients',
  Client_Orders: 'sales_orders',
  client_orders: 'sales_orders',
  Client_Payments: 'payments',
  client_payments: 'payments',
  Client_Quotations: 'send_quotation',
  client_quotations: 'send_quotation',
  Client_Notifications: 'crm_communications',
  client_notifications: 'crm_communications',
  Client_Messages: 'whatsapp_logs',
  client_messages: 'whatsapp_logs',

  // Vendors & stock
  Vendor: null,
  vendors: null,
  Stock: 'stock',
  stock: 'stock',
  'Material Inward': 'material_inward',
  'Material Issue': 'material_issue',
  BOM: 'bom',
  'Kitting Sheet': 'kitting_sheet',
  'Finished Goods': 'finished_goods',

  // Dispatches
  Dispatches: 'dispatches',
  dispatches: 'dispatches',

  // Purchase flow
  Purchase_Flow: 'purchase_flows',
  PurchaseFlow: 'purchase_flows',
  purchase_flows: 'purchase_flows',
  PurchaseFlowSteps: 'purchase_flow_steps',
  purchase_flow_steps: 'purchase_flow_steps',

  // Sales flow
  SalesFlow: 'sales_flows',
  sales_flows: 'sales_flows',
  SalesFlowSteps: 'sales_flow_steps',
  sales_flow_steps: 'sales_flow_steps',
  LogAndQualifyLeads: 'log_and_qualify_leads',
  InitialCall: 'initial_call',
  SendQuotation: 'send_quotation',
  ApprovePaymentTerms: 'approve_payment_terms',
  SampleSubmission: 'sample_submission',
  GetApprovalForSample: 'get_approval_for_sample',
  ApproveStrategicDeals: 'approve_strategic_deals',
  EvaluateHighValueProspects: 'evaluate_high_value_prospects',
  CheckFeasibility: 'check_feasibility',
  ConfirmStandardAndCompliance: 'confirm_standard_and_compliance',
  FollowUpQuotations: 'follow_up_quotations',
  'Comparative Statement': 'comparative_statement',
  SheetApproveQuotation: 'sheet_approve_quotation',
  RequestSample: 'request_sample',
  InspectMaterial: 'inspect_material',
  MaterialApproval: 'material_approval',
  PlacePO: 'place_po',
  ReturnHistory: 'return_history',
  GenerateGRN: 'generate_grn',
  SchedulePayment: 'schedule_payment',
  ReleasePayment: 'release_payment',

  // Logs & products
  Audit_Log: 'audit_log',
  audit_log: 'audit_log',
  'WhatsApp Message Logs': 'whatsapp_logs',
  whatsapp_logs: 'whatsapp_logs',
  PRODUCT: 'products',
  products: 'products',
  PO_Master: 'po_master',
  po_master: 'po_master',
  SO_Master: 'sales_orders',
  so_master: 'sales_orders',
  Inventory: 'inventory',
  inventory: 'inventory',
  Daily_CAPACITY: 'daily_capacity',
  daily_capacity: 'daily_capacity',
  'Cable Products': null,
  cable_products: null,
  'Cable Production Plans': null,
  cable_production_plans: null,
  'Machine Schedules': null,
  machine_schedules: null,
  RFQ: 'rfq',
  rfq: 'rfq',
  BOM_Templates: 'bom_templates',
  bom_templates: 'bom_templates',
  SortVendor: 'sort_vendor',
  sort_vendor: 'sort_vendor',
  FollowUpDelivery: 'follow_up_delivery',
  follow_up_delivery: 'follow_up_delivery',
  ReturnMaterial: 'return_material',
  return_material: 'return_material',
  InspectSample: 'inspect_sample',
  inspect_sample: 'inspect_sample',

  // HR / admin custom data tables
  Employees: 'employees',
  employees: 'employees',
  Performance: 'user_scores',
  performance: 'user_scores',
  Attendance: null,
  attendance: null,
  EmployeeTasks: 'task_instances',
  employee_tasks: 'task_instances',
  Notifications: 'task_audit_log',
  notifications: 'task_audit_log',

  // CRM / payment reminder tables
  CRM_Opportunities: 'crm_opportunities',
  CRM_Activities: 'crm_activities',
  CRM_Interactions: 'crm_interactions',
  CRM_Tasks: 'crm_tasks',
  CRM_Notes: 'crm_notes',
  CRM_OrderTaking: 'crm_ordertaking',
  CRM_CallLogs: 'crm_calllogs',
  CRM_Payments: 'crm_payments',
  CRM_Invoices: 'crm_invoices',
  CRM_ReminderTemplates: 'crm_reminder_templates',
  CRM_Communications: 'crm_communications',
  CRM_CallTasks: 'crm_calltasks',
  CRM_TaskLogs: 'crm_tasklogs',
  Petty_Cash: 'payments',
  Enquiries: 'crm_logs',
  Enquiries_Export: 'crm_logs',
  Enquiries_IndiaMart: 'crm_logs',
  Checklists: 'task_templates',
  Delegation: 'task_instances',
  MIS_Scores: 'user_scores',
  Delegation_Scores: 'user_scores',
  Employee_Dashboards: 'employees',
  Quotation_Formats: 'send_quotation',
  SCOT_Sheet: null,
  Die_Repair: null,
  HR_Induction: null,
  HR_Resignation: null,
  Costing_Breakup: null,
  'Material Requisitions': 'inventory_movements',
  'Production Orders': null,
};

const TABLE_ALIASES = {
};

const tableNameCache = new Map();

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

function flattenDirectRow(row) {
  if (!row || typeof row !== 'object') return row;
  const record = row.record && typeof row.record === 'object' && !Array.isArray(row.record)
    ? row.record
    : {};
  return {
    ...record,
    ...row,
  };
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

const SEND_QUOTATION_PHYSICAL = ['send_quotation'];

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
 * Insert into send_quotation.
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
  debugGetTableRows('invoke', { tableName, resolvedName: primaryName, candidateNames, useLocalStorage: config.useLocalStorage });
  console.log('Using Supabase, not local storage');

  let lastMissingTableError = null;

  for (const name of candidateNames) {
    const { data: rows, error } = await supabase
      .from(name)
      .select('id, created_at, sort_order, record')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      debugGetTableRows('primary select error', { resolvedName: name, error });
      if (isPostgrestMissingTableError(error)) {
        lastMissingTableError = error;
        continue;
      }
      // Fallback for direct-column tables (no sort_order/record wrapper)
      if (!isLegacyJsonSchemaError(error)) {
        console.error(`Error getTableRows(${name}):`, error);
        throw error;
      }
      // Legacy flat tables may omit created_at/sort_order/record — select all columns, no order.
      const { data: directRows, error: directErr } = await supabase.from(name).select('*');
      if (directErr) {
        if (isPostgrestMissingTableError(directErr)) {
          lastMissingTableError = directErr;
          continue;
        }
        console.error(`Error getTableRows(${name}) [direct]:`, directErr);
        debugGetTableRows('fallback select error', { resolvedName: name, error: directErr });
        throw directErr;
      }
      rememberResolvedTableName(primaryName, name);
      debugGetTableRows('fallback success', { resolvedName: name, rowCount: (directRows || []).length });
      return (directRows || []).map(flattenDirectRow);
    }

    rememberResolvedTableName(primaryName, name);
    debugGetTableRows('success', { resolvedName: name, rowCount: (rows || []).length });
    return (rows || []).map((r) => ({
      id: r.id,
      ...(r.record || {}),
    }));
  }

  if (lastMissingTableError) {
    console.warn(`No Supabase table found for ${primaryName}; returning an empty list.`, lastMissingTableError);
    return [];
  }

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
    typeof row === 'object' && row !== null && !Array.isArray(row) ? { ...row } : {};

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

  for (const name of getTableCandidateNames(tableName)) {
    const { error } = await supabase
      .from(name)
      .update({ record: row || {} })
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

    const directPayload = row && typeof row === 'object' ? row : {};
    const { error: directErr } = await supabase
      .from(name)
      .update(directPayload)
      .eq('id', id);

    if (!directErr) {
      rememberResolvedTableName(primaryName, name);
      return;
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
  const existing = { ...row };
  delete existing.id;
  const merged = { ...existing, ...(rowData || {}) };
  delete merged.id;
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
  return data.length > 0 ? Object.keys(data[0]).filter((k) => k !== 'id') : [];
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
      : (row && typeof row === 'object' ? row : {});

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
