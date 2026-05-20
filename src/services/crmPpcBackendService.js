import { supabase } from "../lib/supabaseClient";
import { toErpCompatibleRow } from "../lib/db";

const mapLead = (row) => ({
  id: row.id,
  companyName: row.company_name || row.companyName || row.CompanyName || row.name || "",
  contactPerson: row.contact_person || row.contactPerson || row.ContactPerson || "",
  phone: row.phone || row.Phone || "",
  email: row.email || row.Email || "",
  source: row.source || row.Source || "",
  status: row.status || row.Status || "",
  assignedTo: row.assigned_to || row.assignedTo || row.AssignedTo || "",
  score: row.score ?? row.Score ?? 0,
  budgetScore: row.budget_score ?? row.budgetScore ?? 0,
  requirementClarityScore: row.requirement_clarity_score ?? row.requirementClarityScore ?? 0,
  urgencyScore: row.urgency_score ?? row.urgencyScore ?? 0,
  engagementScore: row.engagement_score ?? row.engagementScore ?? 0,
  decisionAuthorityScore: row.decision_authority_score ?? row.decisionAuthorityScore ?? 0,
  createdDate: row.created_at?.slice(0, 10) || row.createdDate || ""
});

const mapCustomer = (row) => ({
  id: row.id,
  companyName: row.company_name || row.companyName || row.CompanyName || row.name || row.Name || "",
  gstNumber: row.gstin || row.GSTIN || "",
  contactPerson: row.contact_person || row.contactPerson || row.ContactPerson || "",
  phone: row.phone || row.Phone || "",
  email: row.email || row.Email || "",
  creditLimit: Number(row.credit_limit || row.creditLimit || row.CreditLimit || 0),
  outstandingAmount: Number(row.outstanding_amount || row.outstandingAmount || row.OutstandingAmount || 0),
  overdueDays: Number(row.overdue_days || row.overdueDays || row.OverdueDays || 0),
  createdDate: row.created_at?.slice(0, 10) || row.createdDate || ""
});

const mapProductionPlan = (row) => ({
  id: row.id,
  salesOrderId: row.sales_order_id || row.salesOrderId || row.SalesOrderId || row.SOId || "",
  productType: row.product_name || row.productType || row.ProductName || row.product_id || "",
  productId: row.product_id || row.productId || row.ProductId || "",
  quantity: Number(row.quantity || row.Quantity || 0),
  startDate: row.start_date || row.startDate || row.StartDate || "",
  endDate: row.end_date || row.endDate || row.EndDate || "",
  status: row.status || row.Status || ""
});

const mapWorkOrder = (row) => ({
  id: row.id,
  linkedPlanId: row.production_plan_id,
  machine: row.machine_id || "",
  operator: row.operator_id || "",
  status: row.status,
  outputProduced: Number(row.output || 0),
  defects: Number(row.defects || 0)
});

const readRows = async (tableName, orderColumn = "created_at") => {
  let query = supabase.from(tableName).select("*");
  if (orderColumn) query = query.order(orderColumn, { ascending: false });
  const { data, error } = await query;
  if (error && String(error.message || "").includes(orderColumn)) {
    const fallback = await supabase.from(tableName).select("*");
    if (fallback.error) throw fallback.error;
    return (fallback.data || []).map(toErpCompatibleRow);
  }
  if (error) throw error;
  return (data || []).map(toErpCompatibleRow);
};

export const crmPpcBackendService = {
  async getLeads() {
    return (await readRows("crm_leads")).map(mapLead);
  },

  async upsertLead(lead) {
    const payload = {
      id: lead.id?.startsWith("LD-") ? undefined : lead.id,
      company_name: lead.companyName,
      contact_person: lead.contactPerson,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      status: lead.status || "NEW",
      score: Number(lead.score || 0),
      budget_score: Number(lead.budgetScore || 0),
      requirement_clarity_score: Number(lead.requirementClarityScore || 0),
      urgency_score: Number(lead.urgencyScore || 0),
      engagement_score: Number(lead.engagementScore || 0),
      decision_authority_score: Number(lead.decisionAuthorityScore || 0)
    };
    const { data, error } = await supabase
      .from("crm_leads")
      .upsert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return mapLead(data);
  },

  async deleteLead(id) {
    const { error } = await supabase.from("crm_leads").delete().eq("id", id);
    if (error) throw error;
  },

  async getCustomers() {
    return (await readRows("customers")).map(mapCustomer);
  },

  async upsertCustomer(customer) {
    const payload = {
      id: customer.id?.startsWith("CUS-") ? undefined : customer.id,
      name: customer.companyName,
      company_name: customer.companyName,
      gstin: customer.gstNumber,
      contact_person: customer.contactPerson,
      phone: customer.phone,
      email: customer.email,
      credit_limit: Number(customer.creditLimit || 0),
      outstanding_amount: Number(customer.outstandingAmount || 0),
      overdue_days: Number(customer.overdueDays || 0)
    };
    const { data, error } = await supabase.from("customers").upsert(payload).select("*").single();
    if (error) throw error;
    return mapCustomer(data);
  },

  async getProductionPlans() {
    return (await readRows("ppc_production_plans")).map(mapProductionPlan);
  },

  async upsertProductionPlan(plan) {
    const payload = {
      id: plan.id?.startsWith("PLN-") ? undefined : plan.id,
      sales_order_id: plan.salesOrderId,
      product_id: plan.productId,
      quantity: Number(plan.quantity || 0),
      start_date: plan.startDate,
      end_date: plan.endDate,
      status: plan.status || "PLANNED"
    };
    const { data, error } = await supabase
      .from("ppc_production_plans")
      .upsert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return mapProductionPlan(data);
  },

  async getWorkOrders() {
    return (await readRows("ppc_work_orders")).map(mapWorkOrder);
  },

  subscribe(table, onEvent) {
    const channel = supabase
      .channel(`realtime-${table}-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => onEvent?.(payload))
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }
};

export default crmPpcBackendService;
