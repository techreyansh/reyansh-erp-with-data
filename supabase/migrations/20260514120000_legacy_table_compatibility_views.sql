-- Compatibility views for older deployed bundles that still request legacy
-- Google-Sheets-style table names. New frontend code uses the canonical tables
-- directly; these views keep stale deployments from failing with PGRST205 while
-- Vercel/CDN caches are being refreshed.

CREATE OR REPLACE FUNCTION public.create_legacy_record_view(
  source_table text,
  legacy_view text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  source_reg regclass;
  target_reg regclass;
  target_kind "char";
  has_created_at boolean;
  has_sort_order boolean;
  has_record boolean;
  created_expr text;
  sort_expr text;
  record_expr text;
BEGIN
  source_reg := to_regclass('public.' || source_table);
  IF source_reg IS NULL THEN
    RAISE NOTICE 'Skipping legacy view %. Source table % does not exist.', legacy_view, source_table;
    RETURN;
  END IF;

  target_reg := to_regclass('public.' || legacy_view);
  IF target_reg IS NOT NULL THEN
    SELECT c.relkind INTO target_kind
    FROM pg_class c
    WHERE c.oid = target_reg;

    IF target_kind <> 'v' THEN
      RAISE NOTICE 'Skipping legacy view %. A non-view relation already exists.', legacy_view;
      RETURN;
    END IF;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = source_table AND column_name = 'created_at'
  ) INTO has_created_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = source_table AND column_name = 'sort_order'
  ) INTO has_sort_order;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = source_table AND column_name = 'record'
  ) INTO has_record;

  created_expr := CASE
    WHEN has_created_at THEN 't.created_at'
    ELSE 'now()::timestamptz'
  END;

  sort_expr := CASE
    WHEN has_sort_order THEN 't.sort_order'
    ELSE '0::int'
  END;

  record_expr := CASE
    WHEN has_record THEN 't.record'
    ELSE 'to_jsonb(t) - ''id'' - ''created_at'' - ''sort_order'''
  END;

  EXECUTE format(
    'CREATE OR REPLACE VIEW public.%I AS SELECT t.id, %s AS created_at, %s AS sort_order, %s AS record FROM public.%I t',
    legacy_view,
    created_expr,
    sort_expr,
    record_expr,
    source_table
  );

  EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', legacy_view);
END;
$$;

SELECT public.create_legacy_record_view('clients', 'clients2');
SELECT public.create_legacy_record_view('sales_orders', 'client_orders_data');
SELECT public.create_legacy_record_view('payments', 'client_payments_data');
SELECT public.create_legacy_record_view('send_quotation', 'client_quotations_data');
SELECT public.create_legacy_record_view('crm_communications', 'client_notifications_data');
SELECT public.create_legacy_record_view('employees', 'employees_data');
SELECT public.create_legacy_record_view('user_scores', 'performance_data');
SELECT public.create_legacy_record_view('task_instances', 'employee_tasks_data');
SELECT public.create_legacy_record_view('task_audit_log', 'notifications_data');
SELECT public.create_legacy_record_view('send_quotation', 'send_quotation_data');
SELECT public.create_legacy_record_view('purchase_flows', 'purchase_flow_data');
SELECT public.create_legacy_record_view('purchase_flow_steps', 'purchase_flow_steps_data');
SELECT public.create_legacy_record_view('sales_flows', 'sales_flow_data');
SELECT public.create_legacy_record_view('sales_flow_steps', 'sales_flow_steps_data');
SELECT public.create_legacy_record_view('stock', 'stock_data');
SELECT public.create_legacy_record_view('material_inward', 'material_inward_data');
SELECT public.create_legacy_record_view('material_issue', 'material_issue_data');
SELECT public.create_legacy_record_view('bom', 'company_bom_data');
SELECT public.create_legacy_record_view('kitting_sheet', 'company_material_issue_data');
SELECT public.create_legacy_record_view('rfq', 'rfq_data');
SELECT public.create_legacy_record_view('sort_vendor', 'sort_vendor_data');
SELECT public.create_legacy_record_view('follow_up_delivery', 'follow_up_delivery_data');
SELECT public.create_legacy_record_view('return_material', 'return_material_data');
SELECT public.create_legacy_record_view('inspect_sample', 'inspect_sample_data');

DROP FUNCTION public.create_legacy_record_view(text, text);
