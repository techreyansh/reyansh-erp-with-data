/**
 * Supabase table access: one table per entity (no sheet_rows / sheet_name).
 * All tables have: id, created_at, sort_order, record jsonb.
 */
import { supabase } from './supabaseClient';
import config from '../config/config';

export const TABLE_NAMES = {
  // Auth & users
  Users: 'users',
  users: 'users',

  // Clients — physical table in Supabase (public.clients2)
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
  vendors: 'vendors_data',
  Stock: 'stock_data',
  stock: 'stock_data',
  'Material Inward': 'material_inward_data',
  'Material Issue': 'material_issue_data',
  BOM: 'company_bom_data',
  'Kitting Sheet': 'company_material_issue_data',
  'Finished Goods': 'finished_goods',

  // Dispatches
  Dispatches: 'dispatches',
  dispatches: 'dispatches',

  // Purchase flow
  Purchase_Flow: 'purchase_flow_data',
  PurchaseFlow: 'purchase_flow_data',
  purchase_flows: 'purchase_flow_data',
  PurchaseFlowSteps: 'purchase_flow_steps_data',
  purchase_flow_steps: 'purchase_flow_steps_data',

  // Sales flow
  SalesFlow: 'sales_flow_data',
  sales_flows: 'sales_flow_data',
  SalesFlowSteps: 'sales_flow_steps_data',
  sales_flow_steps: 'sales_flow_steps_data',
  LogAndQualifyLeads: 'log_and_qualify_leads_data',
  InitialCall: 'initial_call_data',
  // Migration 20250223100000: public.send_quotation (legacy deploys may use send_quotation_data)
  SendQuotation: 'send_quotation',
  ApprovePaymentTerms: 'approve_payment_terms_data',
  SampleSubmission: 'sample_submission_data',
  GetApprovalForSample: 'get_approval_for_sample_data',
  ApproveStrategicDeals: 'approve_strategic_deals_data',
  EvaluateHighValueProspects: 'evaluate_high_value_prospects_data',
  CheckFeasibility: 'check_feasibility_data',
  // Matches supabase/migrations/20250223100000_replace_sheet_rows_with_entity_tables.sql (not *_data).
  ConfirmStandardAndCompliance: 'confirm_standard_and_compliance',
  FollowUpQuotations: 'follow_up_quotations_data',
  'Comparative Statement': 'comparative_statement_data',
  SheetApproveQuotation: 'sheet_approve_quotation_data',
  RequestSample: 'request_sample_data',
  InspectMaterial: 'inspect_material_data',
  MaterialApproval: 'material_approval',
  PlacePO: 'place_po_data',
  ReturnHistory: 'return_history_data',
  GenerateGRN: 'generate_grn_data',
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
  Daily_CAPACITY: 'daily_capacity',
  daily_capacity: 'daily_capacity',
  'Cable Products': 'cable_products',
  cable_products: 'cable_products',
  'Cable Production Plans': 'cable_production_plans',
  cable_production_plans: 'cable_production_plans',
  'Machine Schedules': 'machine_schedules',
  machine_schedules: 'machine_schedules',
  RFQ: 'rfq_data',
  rfq: 'rfq_data',
  BOM_Templates: 'bom_templates',
  bom_templates: 'bom_templates',
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
  Performance: 'performance_data',
  performance: 'performance_data',
  Attendance: 'attendance_data',
  attendance: 'attendance_data',
  EmployeeTasks: 'employee_tasks_data',
  employee_tasks: 'employee_tasks_data',
  Notifications: 'notifications_data',
  notifications: 'notifications_data',
};

/** True when table is not the wrapped shape (id, sort_order, record jsonb) — use select * / direct rows. */
function isLegacyJsonSchemaError(error) {
  if (!error) return false;
  // PostgREST/Postgres: column does not exist (e.g. flat "sheet" tables like clients2)
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

const SEND_QUOTATION_PHYSICAL = ['send_quotation', 'send_quotation_data'];

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
 * Insert into send_quotation / send_quotation_data depending on project schema.
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
  const resolved = TABLE_NAMES[logicalName];
  if (resolved) return resolved;
  // Fallback: convert to snake_case (simple)
  return String(logicalName)
    .replace(/\s+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Get all rows from a table as flattened objects { id, ...record }.
 * @param {string} tableName - actual table name (e.g. 'users', 'clients2')
 * @returns {Promise<Array<{ id: string, ... }>>}
 */
export async function getTableRows(tableName) {
  const name = getTableName(tableName);
  debugGetTableRows('invoke', { tableName, resolvedName: name, useLocalStorage: config.useLocalStorage });
  console.log('Using Supabase, not local storage');

  const { data: rows, error } = await supabase
    .from(name)
    .select('id, created_at, sort_order, record')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    debugGetTableRows('primary select error', { resolvedName: name, error });
    // Fallback for direct-column tables (no sort_order/record wrapper)
    if (!isLegacyJsonSchemaError(error)) {
      console.error(`Error getTableRows(${name}):`, error);
      throw error;
    }
    // Legacy flat tables may omit created_at/sort_order/record — select all columns, no order.
    const { data: directRows, error: directErr } = await supabase.from(name).select('*');
    if (directErr) {
      console.error(`Error getTableRows(${name}) [direct]:`, directErr);
      debugGetTableRows('fallback select error', { resolvedName: name, error: directErr });
      throw directErr;
    }
    debugGetTableRows('fallback success', { resolvedName: name, rowCount: (directRows || []).length });
    return directRows || [];
  }

  debugGetTableRows('success', { resolvedName: name, rowCount: (rows || []).length });
  return (rows || []).map((r) => ({
    id: r.id,
    ...(r.record || {}),
  }));
}

/**
 * Insert a row. Uses record = row and auto sort_order.
 * @param {string} tableName
 * @param {object} row - data object (no id)
 * @returns {Promise<object>}
 */
export async function insertTableRow(tableName, row) {
  const name = getTableName(tableName);
  const safeRow =
    typeof row === 'object' && row !== null && !Array.isArray(row) ? { ...row } : {};

  let nextOrder = 0;
  const { data: maxRow, error: maxErr } = await supabase
    .from(name)
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!maxErr && typeof maxRow?.sort_order === 'number') {
    nextOrder = maxRow.sort_order + 1;
  } else if (maxErr && !isLegacyJsonSchemaError(maxErr)) {
    console.error(`Error insertTableRow(${name}) [max sort]:`, maxErr);
    throw maxErr;
  }

  /** Prefer jsonb `record` (canonical sheet migration). Do not skip this when sort_order query failed. */
  const wrappedAttempts = [
    { sort_order: nextOrder, record: safeRow },
    { record: safeRow },
  ];

  for (const payload of wrappedAttempts) {
    const { error } = await supabase.from(name).insert(payload);
    if (!error) return {};
    if (!isLegacyJsonSchemaError(error)) {
      console.error(`Error insertTableRow(${name}):`, error);
      throw error;
    }
  }

  const { error: directErr } = await supabase.from(name).insert(safeRow);
  if (directErr) {
    console.error(`Error insertTableRow(${name}) [direct]:`, directErr);
    throw directErr;
  }
  return {};
}

/**
 * Update a row by id. Sets record = row.
 * @param {string} tableName
 * @param {string} id - uuid
 * @param {object} row - full record to store
 */
export async function updateTableRowById(tableName, id, row) {
  const name = getTableName(tableName);

  const { error } = await supabase
    .from(name)
    .update({ record: row || {} })
    .eq('id', id);

  if (!error) return;
  if (!isLegacyJsonSchemaError(error)) {
    console.error(`Error updateTableRowById(${name}, ${id}):`, error);
    throw error;
  }

  const directPayload = row && typeof row === 'object' ? row : {};
  const { error: directErr } = await supabase
    .from(name)
    .update(directPayload)
    .eq('id', id);

  if (directErr) {
    console.error(`Error updateTableRowById(${name}, ${id}) [direct]:`, directErr);
    throw directErr;
  }
}

/**
 * Delete a row by id.
 * @param {string} tableName
 * @param {string} id
 */
export async function deleteTableRowById(tableName, id) {
  const name = getTableName(tableName);

  const { error } = await supabase.from(name).delete().eq('id', id);
  if (error) {
    console.error(`Error deleteTableRowById(${name}, ${id}):`, error);
    throw error;
  }
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
  const name = getTableName(tableName);
  if (!rows?.length) return;

  const normalizeRow = (row) =>
    Array.isArray(row)
      ? Object.fromEntries(row.map((v, j) => [`col_${j}`, v]))
      : (row && typeof row === 'object' ? row : {});

  let nextOrder = -1;
  const { data: maxRow, error: maxErr } = await supabase
    .from(name)
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  let shouldFallbackToDirect = !!maxErr && isLegacyJsonSchemaError(maxErr);
  let legacyFailedMidway = false;

  if (!maxErr) {
    if (maxRow?.sort_order != null) nextOrder = maxRow.sort_order;
    for (let i = 0; i < rows.length; i++) {
      nextOrder += 1;
      const record = normalizeRow(rows[i]);
      const { error } = await supabase.from(name).insert({ sort_order: nextOrder, record });
      if (error) {
        if (isLegacyJsonSchemaError(error)) {
          legacyFailedMidway = true;
          break;
        }
        throw error;
      }
    }
    if (!legacyFailedMidway) return;
    shouldFallbackToDirect = true;
  } else if (!isLegacyJsonSchemaError(maxErr)) {
    throw maxErr;
  }

  if (!shouldFallbackToDirect) return;

  for (let i = 0; i < rows.length; i++) {
    const directPayload = normalizeRow(rows[i]);
    const { error } = await supabase.from(name).insert(directPayload);
    if (error) throw error;
  }
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
