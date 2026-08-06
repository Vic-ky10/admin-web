"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PhoneCall,
  MapPin,
  Award,
  BarChart3,
  Plus,
  TrendingUp,
  Edit2,
  Trash2,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

// Dialog components
import CustomerDialog from "./CustomerDialog";
import PurchaseDialog from "./PurchaseDialog";
import FollowupDialog from "./FollowupDialog";
import SalesAreaDialog from "./SalesAreaDialog";
import IncentiveRuleDialog from "./IncentiveRuleDialog";

// Display Components
import SalesDashboard from "./SalesDashboard";
import CustomerDetails from "./CustomerDetails";
import SalesFilters from "./SalesFilters";
import {
  CustomerTable,
  PurchaseTable,
  SalesAreaTable,
  IncentiveRuleTable,
} from "./SalesTable";

// Server Actions
import {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
  createCustomerPurchaseAction,
  updateCustomerPurchaseAction,
  deleteCustomerPurchaseAction,
  createCustomerFollowupAction,
  updateCustomerFollowupAction,
  deleteCustomerFollowupAction,
  createSalesAreaAction,
  updateSalesAreaAction,
  deleteSalesAreaAction,
  createIncentiveRuleAction,
  updateIncentiveRuleAction,
  deleteIncentiveRuleAction,
} from "../sales.actions";

// Types
import {
  Customer,
  SalesArea,
  CustomerPurchase,
  CustomerFollowup,
  IncentiveRule,
} from "../sales.types";
import { Employee } from "@/features/employee/employee.types";
import {
  CustomerForm,
  CustomerPurchaseForm,
  CustomerFollowupForm,
  SalesAreaForm,
  IncentiveRuleForm,
} from "../sales.validation";

interface SalesClientProps {
  initialCustomers: Customer[];
  initialSalesAreas: SalesArea[];
  initialPurchases: CustomerPurchase[];
  initialFollowups: CustomerFollowup[];
  initialIncentiveRules: IncentiveRule[];
  employees: Employee[];
}

type TabType =
  | "dashboard"
  | "customers"
  | "purchases"
  | "followups"
  | "areas"
  | "rules"
  | "reports";

export default function SalesClient({
  initialCustomers,
  initialSalesAreas,
  initialPurchases,
  initialFollowups,
  initialIncentiveRules,
  employees,
}: SalesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Selected customer for detailed view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  // Dialog State
  const [customerModal, setCustomerModal] = useState<{
    open: boolean;
    item: Customer | null;
  }>({
    open: false,
    item: null,
  });
  const [purchaseModal, setPurchaseModal] = useState<{
    open: boolean;
    item: CustomerPurchase | null;
  }>({
    open: false,
    item: null,
  });
  const [followupModal, setFollowupModal] = useState<{
    open: boolean;
    item: CustomerFollowup | null;
  }>({
    open: false,
    item: null,
  });
  const [areaModal, setAreaModal] = useState<{
    open: boolean;
    item: SalesArea | null;
  }>({
    open: false,
    item: null,
  });
  const [ruleModal, setRuleModal] = useState<{
    open: boolean;
    item: IncentiveRule | null;
  }>({
    open: false,
    item: null,
  });

  useEffect(() => {
    const purchaseId = searchParams?.get("purchaseId");
    if (purchaseId) {
      const match = initialPurchases.find(
        (p) => p.id === purchaseId || p.purchase_code === purchaseId,
      );
      if (match) {
        setTimeout(() => {
          setActiveTab("purchases");
          setPurchaseModal({ open: true, item: match });
        }, 0);
      }
    }
  }, [searchParams, initialPurchases]);

  // Filter/Search states
  const [search, setSearch] = useState("");
  const [areaId, setAreaId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("");
  const [followupStatusFilter, setFollowupStatusFilter] = useState<
    "All" | "Pending" | "Completed" | "Overdue"
  >("All");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Deletion Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    onConfirm: () => {},
  });

  // Selected Customer details object lookup
  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return initialCustomers.find((c) => c.id === selectedCustomerId) || null;
  }, [selectedCustomerId, initialCustomers]);

  // --- SUBMISSIONS & CRUDS ---
  const handleCustomerSubmit = async (values: CustomerForm) => {
    startTransition(async () => {
      const res = customerModal.item
        ? await updateCustomerAction(customerModal.item.id, values)
        : await createCustomerAction(values);

      if (res.success) {
        toast.success(res.message || "Customer saved successfully.");
        setCustomerModal({ open: false, item: null });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save customer.");
      }
    });
  };

  const handleCustomerDelete = (cust: Customer) => {
    setDeleteConfirm({
      open: true,
      onConfirm: () => {
        setDeletingId(cust.id);
        startTransition(async () => {
          const res = await deleteCustomerAction(cust.id);
          setDeletingId(null);
          if (res.success) {
            toast.success("Customer deleted successfully.");
            if (selectedCustomerId === cust.id) setSelectedCustomerId(null);
            router.refresh();
          } else {
            toast.error(res.error || "Unable to delete customer.");
          }
        });
      },
    });
  };

  const handlePurchaseSubmit = async (values: CustomerPurchaseForm) => {
    startTransition(async () => {
      const res = purchaseModal.item
        ? await updateCustomerPurchaseAction(purchaseModal.item.id, values)
        : await createCustomerPurchaseAction(values);

      if (res.success) {
        toast.success(res.message || "Purchase recorded successfully.");
        if (!purchaseModal.item) {
          setPurchaseModal({ open: false, item: null });
        } else if (res.data) {
          setPurchaseModal({ open: true, item: res.data as CustomerPurchase });
        }
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save purchase.");
      }
    });
  };

  const handlePurchaseDelete = (p: CustomerPurchase) => {
    setDeleteConfirm({
      open: true,
      onConfirm: () => {
        setDeletingId(p.id);
        startTransition(async () => {
          const res = await deleteCustomerPurchaseAction(p.id);
          setDeletingId(null);
          if (res.success) {
            toast.success("Purchase deleted successfully.");
            router.refresh();
          } else {
            toast.error(res.error || "Unable to delete purchase.");
          }
        });
      },
    });
  };

  const handleFollowupSubmit = async (values: CustomerFollowupForm) => {
    startTransition(async () => {
      const res = followupModal.item
        ? await updateCustomerFollowupAction(followupModal.item.id, values)
        : await createCustomerFollowupAction(values);

      if (res.success) {
        toast.success(res.message || "Follow-up logged successfully.");
        setFollowupModal({ open: false, item: null });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save follow-up.");
      }
    });
  };

  const handleFollowupDelete = (f: CustomerFollowup) => {
    setDeleteConfirm({
      open: true,
      onConfirm: () => {
        setDeletingId(f.id);
        startTransition(async () => {
          const res = await deleteCustomerFollowupAction(f.id);
          setDeletingId(null);
          if (res.success) {
            toast.success("Follow-up deleted successfully.");
            router.refresh();
          } else {
            toast.error(res.error || "Unable to delete follow-up.");
          }
        });
      },
    });
  };

  const handleSalesAreaSubmit = async (values: SalesAreaForm) => {
    startTransition(async () => {
      const res = areaModal.item
        ? await updateSalesAreaAction(areaModal.item.id, values)
        : await createSalesAreaAction(values);

      if (res.success) {
        toast.success(res.message || "Sales area saved successfully.");
        setAreaModal({ open: false, item: null });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save sales area.");
      }
    });
  };

  const handleSalesAreaDelete = (area: SalesArea) => {
    setDeleteConfirm({
      open: true,
      onConfirm: () => {
        setDeletingId(area.id);
        startTransition(async () => {
          const res = await deleteSalesAreaAction(area.id);
          setDeletingId(null);
          if (res.success) {
            toast.success("Sales area deleted successfully.");
            router.refresh();
          } else {
            toast.error(res.error || "Unable to delete sales area.");
          }
        });
      },
    });
  };

  const handleIncentiveRuleSubmit = async (values: IncentiveRuleForm) => {
    startTransition(async () => {
      const res = ruleModal.item
        ? await updateIncentiveRuleAction(ruleModal.item.id, values)
        : await createIncentiveRuleAction(values);

      if (res.success) {
        toast.success(res.message || "Incentive rule saved successfully.");
        setRuleModal({ open: false, item: null });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save rule.");
      }
    });
  };

  const handleIncentiveRuleDelete = (rule: IncentiveRule) => {
    setDeleteConfirm({
      open: true,
      onConfirm: () => {
        setDeletingId(rule.id);
        startTransition(async () => {
          const res = await deleteIncentiveRuleAction(rule.id);
          setDeletingId(null);
          if (res.success) {
            toast.success("Incentive rule deleted successfully.");
            router.refresh();
          } else {
            toast.error(res.error || "Unable to delete incentive rule.");
          }
        });
      },
    });
  };

  // --- FILTERS LOGIC ---
  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((c) => {
      const matchesSearch =
        !search ||
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        c.customer_code.toLowerCase().includes(search.toLowerCase());

      const matchesArea = !areaId || c.sales_area_id === areaId;
      const matchesEmployee =
        !employeeId || c.assigned_employee_id === employeeId;
      const matchesStatus = !status || c.status === status;

      return matchesSearch && matchesArea && matchesEmployee && matchesStatus;
    });
  }, [initialCustomers, search, areaId, employeeId, status]);

  const filteredPurchases = useMemo(() => {
    return initialPurchases.filter((p) => {
      const cust = initialCustomers.find((c) => c.id === p.customer_id);
      if (!cust) return false;

      const matchesSearch =
        !search ||
        cust.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.purchase_code.toLowerCase().includes(search.toLowerCase());

      const matchesArea = !areaId || cust.sales_area_id === areaId;
      const matchesEmployee =
        !employeeId || cust.assigned_employee_id === employeeId;
      const matchesStatus = !status || p.status === status;

      return matchesSearch && matchesArea && matchesEmployee && matchesStatus;
    });
  }, [initialPurchases, initialCustomers, search, areaId, employeeId, status]);

  // Compute followups categorized
  const computedFollowups = useMemo(() => {
    const now = new Date().getTime();

    return initialFollowups
      .map((f) => {
        const cust = initialCustomers.find((c) => c.id === f.customer_id);
        const emp = cust
          ? employees.find((e) => e.id === cust.assigned_employee_id)
          : null;

        let fStatus: "Completed" | "Pending" | "Overdue" = "Completed";
        if (f.next_followup_date) {
          const nextTime = new Date(f.next_followup_date).getTime();
          if (nextTime >= now) {
            fStatus = "Pending";
          } else {
            fStatus = "Overdue";
          }
        }

        // Priority calculation
        let priority: "High" | "Medium" | "Low" = "Low";
        if (f.next_followup_date) {
          const daysLeft = Math.ceil(
            (new Date(f.next_followup_date).getTime() - now) /
              (1000 * 60 * 60 * 24),
          );
          priority = daysLeft <= 2 ? "High" : daysLeft <= 5 ? "Medium" : "Low";
        }

        return {
          ...f,
          customer: cust,
          employee: emp,
          computedStatus: fStatus,
          computedPriority: priority,
        };
      })
      .filter((f) => {
        if (!f.customer) return false;

        const matchesSearch =
          !search ||
          f.customer.full_name.toLowerCase().includes(search.toLowerCase()) ||
          (f.remarks && f.remarks.toLowerCase().includes(search.toLowerCase()));

        const matchesArea = !areaId || f.customer.sales_area_id === areaId;
        const matchesEmployee =
          !employeeId || f.customer.assigned_employee_id === employeeId;
        const matchesStatus =
          followupStatusFilter === "All" ||
          f.computedStatus === followupStatusFilter;

        return matchesSearch && matchesArea && matchesEmployee && matchesStatus;
      });
  }, [
    initialFollowups,
    initialCustomers,
    employees,
    search,
    areaId,
    employeeId,
    followupStatusFilter,
  ]);

  // Tab configurations
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "customers", label: "Customers", icon: Users },
    { id: "purchases", label: "Purchases", icon: CreditCard },
    { id: "followups", label: "Follow-ups", icon: PhoneCall },
    { id: "areas", label: "Sales Areas", icon: MapPin },
    { id: "rules", label: "Incentive Rules", icon: Award },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === "dashboard"
              ? "Sales Dashboard"
              : activeTab === "customers"
                ? "Customers"
                : activeTab === "purchases"
                  ? "Customer Purchases"
                  : activeTab === "followups"
                    ? "Customer Follow-ups"
                    : activeTab === "areas"
                      ? "Sales Areas"
                      : activeTab === "rules"
                        ? "Incentive Rules"
                        : "Reports & Analytics"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === "dashboard" &&
              "Overview of sales performance and customer activities."}
            {activeTab === "customers" &&
              "Detailed CRM database of client portfolios and representatives."}
            {activeTab === "purchases" &&
              "Log, track, and approve client invoices and incentive eligibility."}
            {activeTab === "followups" &&
              "CRM pipeline and schedule of customer followups."}
            {activeTab === "areas" &&
              "Geographical sales sectors and representative workloads."}
            {activeTab === "rules" &&
              "Maintain logic and commissions thresholds."}
            {activeTab === "reports" &&
              "Visual revenue, performance and geographical charts."}
          </p>
        </div>

        {/* Global Primary Buttons depending on tab */}
        <div className="flex gap-2">
          {activeTab === "customers" && !selectedCustomerId && (
            <Button
              onClick={() => setCustomerModal({ open: true, item: null })}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Customer
              </span>
            </Button>
          )}
          {activeTab === "purchases" && (
            <Button
              onClick={() => setPurchaseModal({ open: true, item: null })}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Log Purchase
              </span>
            </Button>
          )}
          {activeTab === "followups" && (
            <Button
              onClick={() => setFollowupModal({ open: true, item: null })}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Log Follow-up
              </span>
            </Button>
          )}
          {activeTab === "areas" && (
            <Button onClick={() => setAreaModal({ open: true, item: null })}>
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Area
              </span>
            </Button>
          )}
          {activeTab === "rules" && (
            <Button onClick={() => setRuleModal({ open: true, item: null })}>
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Rule
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setSelectedCustomerId(null); // Clear selected customer on tab switch
              }}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
                isActive
                  ? "border-blue-600 text-blue-700 bg-blue-50/20"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Render Container */}
      <div className="min-h-[500px]">
        {/* Detail view overrides standard tabs for customers */}
        {selectedCustomer ? (
          <CustomerDetails
            customer={selectedCustomer}
            salesAreas={initialSalesAreas}
            employees={employees}
            purchases={initialPurchases}
            followups={initialFollowups}
            onBack={() => setSelectedCustomerId(null)}
          />
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <SalesDashboard
                customers={initialCustomers}
                salesAreas={initialSalesAreas}
                purchases={initialPurchases}
                followups={initialFollowups}
                employees={employees}
                onViewCustomer={(c) => {
                  setActiveTab("customers");
                  setSelectedCustomerId(c.id);
                }}
                onEditPurchase={(p) =>
                  setPurchaseModal({ open: true, item: p })
                }
                onDeletePurchase={handlePurchaseDelete}
                deletingId={deletingId}
              />
            )}

            {/* Customers Tab */}
            {activeTab === "customers" && (
              <div className="space-y-4">
                <SalesFilters
                  search={search}
                  setSearch={setSearch}
                  areaId={areaId}
                  setAreaId={setAreaId}
                  employeeId={employeeId}
                  setEmployeeId={setEmployeeId}
                  status={status}
                  setStatus={setStatus}
                  salesAreas={initialSalesAreas}
                  employees={employees}
                  placeholder="Search by name, code or phone..."
                />
                <CustomerTable
                  customers={filteredCustomers}
                  salesAreas={initialSalesAreas}
                  employees={employees}
                  onView={(c) => setSelectedCustomerId(c.id)}
                  onEdit={(c) => setCustomerModal({ open: true, item: c })}
                  onDelete={handleCustomerDelete}
                  deletingId={deletingId}
                />
              </div>
            )}

            {/* Purchases Tab */}
            {activeTab === "purchases" && (
              <div className="space-y-4">
                <SalesFilters
                  search={search}
                  setSearch={setSearch}
                  areaId={areaId}
                  setAreaId={setAreaId}
                  employeeId={employeeId}
                  setEmployeeId={setEmployeeId}
                  status={status}
                  setStatus={setStatus}
                  salesAreas={initialSalesAreas}
                  employees={employees}
                  statusOptions={[
                    "Not Eligible",
                    "Pending",
                    "Approved",
                    "Rejected",
                  ]}
                  placeholder="Search by client or purchase code..."
                />
                <PurchaseTable
                  purchases={filteredPurchases}
                  customers={initialCustomers}
                  salesAreas={initialSalesAreas}
                  employees={employees}
                  onEdit={(p) => setPurchaseModal({ open: true, item: p })}
                  onDelete={handlePurchaseDelete}
                  deletingId={deletingId}
                />
              </div>
            )}

            {/* Follow-ups CRM Timeline Tab */}
            {activeTab === "followups" && (
              <div className="space-y-6">
                {/* Filter and Mode controllers */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm overflow-hidden w-fit">
                    {(["All", "Pending", "Completed", "Overdue"] as const).map(
                      (filter) => (
                        <button
                          key={filter}
                          onClick={() => setFollowupStatusFilter(filter)}
                          className={`rounded-md px-4 py-1.5 text-xs font-bold transition ${
                            followupStatusFilter === filter
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {filter}
                        </button>
                      ),
                    )}
                  </div>

                  <SalesFilters
                    search={search}
                    setSearch={setSearch}
                    areaId={areaId}
                    setAreaId={setAreaId}
                    employeeId={employeeId}
                    setEmployeeId={setEmployeeId}
                    salesAreas={initialSalesAreas}
                    employees={employees}
                    placeholder="Search by customer..."
                  />
                </div>

                {/* Followups Cards Display */}
                {computedFollowups.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                    <p className="text-sm font-semibold text-slate-500">
                      No scheduled follow-up activities match filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {computedFollowups.map((f) => (
                      <div
                        key={f.id}
                        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <button
                              onClick={() => {
                                if (f.customer) {
                                  setActiveTab("customers");
                                  setSelectedCustomerId(f.customer.id);
                                }
                              }}
                              className="font-bold text-slate-800 hover:text-blue-600 text-left block hover:underline"
                            >
                              {f.customer?.full_name}
                            </button>
                            <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                              {f.customer?.customer_code}
                            </span>
                          </div>
                          <Badge
                            variant={
                              f.computedStatus === "Pending"
                                ? "warning"
                                : f.computedStatus === "Overdue"
                                  ? "danger"
                                  : "success"
                            }
                          >
                            {f.computedStatus}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600">
                          <p className="flex justify-between">
                            <span className="font-semibold text-slate-400">
                              Interaction Representative:
                            </span>
                            <span className="font-medium text-slate-800">
                              {f.employee?.full_name || "Unassigned"}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="font-semibold text-slate-400">
                              Type:
                            </span>
                            <span className="font-medium text-slate-800">
                              {f.followup_type}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="font-semibold text-slate-400">
                              Completed Date:
                            </span>
                            <span className="font-medium text-slate-800">
                              {new Date(f.followup_date).toLocaleDateString(
                                "en-IN",
                              )}
                            </span>
                          </p>
                          {f.next_followup_date && (
                            <p className="flex justify-between">
                              <span className="font-semibold text-slate-400">
                                Next Scheduled:
                              </span>
                              <span className="font-bold text-blue-700">
                                {new Date(
                                  f.next_followup_date,
                                ).toLocaleDateString("en-IN")}
                              </span>
                            </p>
                          )}
                          {f.next_followup_date && (
                            <p className="flex justify-between">
                              <span className="font-semibold text-slate-400">
                                Proximity Priority:
                              </span>
                              <span
                                className={`font-bold ${
                                  f.computedPriority === "High"
                                    ? "text-red-600 bg-red-50 px-1.5 rounded"
                                    : f.computedPriority === "Medium"
                                      ? "text-amber-600 bg-amber-50 px-1.5 rounded"
                                      : "text-blue-600 bg-blue-50 px-1.5 rounded"
                                }`}
                              >
                                {f.computedPriority}
                              </span>
                            </p>
                          )}
                        </div>

                        {f.remarks && (
                          <div className="bg-slate-50 p-3 rounded text-xs text-slate-500 italic border border-slate-100 max-h-24 overflow-y-auto">
                            &quot;{f.remarks}&quot;
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <Button
                            variant="secondary"
                            onClick={() =>
                              setFollowupModal({ open: true, item: f })
                            }
                            className="flex-1 text-xs h-8 inline-flex items-center justify-center gap-1.5 font-semibold"
                          >
                            <Edit2 size={16} strokeWidth={2} className="text-amber-600 shrink-0" />
                            Reschedule
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleFollowupDelete(f)}
                            disabled={deletingId === f.id}
                            className="h-8 w-8 inline-flex items-center justify-center"
                          >
                            <Trash2 size={16} strokeWidth={2} className="text-red-600 shrink-0" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sales Areas Tab */}
            {activeTab === "areas" && (
              <div className="space-y-4">
                <SalesAreaTable
                  salesAreas={initialSalesAreas}
                  customers={initialCustomers}
                  employees={employees}
                  onEdit={(area) => setAreaModal({ open: true, item: area })}
                  onDelete={handleSalesAreaDelete}
                  deletingId={deletingId}
                />
              </div>
            )}

            {/* Incentive Rules Tab */}
            {activeTab === "rules" && (
              <div className="space-y-4">
                <IncentiveRuleTable
                  incentiveRules={initialIncentiveRules}
                  onEdit={(rule) => setRuleModal({ open: true, item: rule })}
                  onDelete={handleIncentiveRuleDelete}
                  deletingId={deletingId}
                />
              </div>
            )}

            {/* Reports Analytics Tab */}
            {activeTab === "reports" && (
              <SalesReports
                customers={initialCustomers}
                salesAreas={initialSalesAreas}
                purchases={initialPurchases}
                employees={employees}
              />
            )}
          </>
        )}
      </div>

      {/* --- ALL MODALS INTEGRATIONS --- */}
      <CustomerDialog
        open={customerModal.open}
        customer={customerModal.item}
        salesAreas={initialSalesAreas}
        employees={employees}
        onClose={() => setCustomerModal({ open: false, item: null })}
        onSubmit={handleCustomerSubmit}
        loading={isPending}
      />

      <PurchaseDialog
        open={purchaseModal.open}
        purchase={purchaseModal.item}
        customers={initialCustomers}
        onClose={() => setPurchaseModal({ open: false, item: null })}
        onSubmit={handlePurchaseSubmit}
        loading={isPending}
      />

      <FollowupDialog
        open={followupModal.open}
        followup={followupModal.item}
        customers={initialCustomers}
        onClose={() => setFollowupModal({ open: false, item: null })}
        onSubmit={handleFollowupSubmit}
        loading={isPending}
      />

      <SalesAreaDialog
        open={areaModal.open}
        area={areaModal.item}
        onClose={() => setAreaModal({ open: false, item: null })}
        onSubmit={handleSalesAreaSubmit}
        loading={isPending}
      />

      <IncentiveRuleDialog
        open={ruleModal.open}
        rule={ruleModal.item}
        onClose={() => setRuleModal({ open: false, item: null })}
        onSubmit={handleIncentiveRuleSubmit}
        loading={isPending}
      />

      <Modal
        open={deleteConfirm.open}
        title="Delete"
        onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
      >
        <div className="space-y-6">
          <div className="space-y-2 text-sm text-slate-600">
            <p>Are you sure you want to delete?</p>
            <p className="font-medium text-slate-500">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteConfirm.onConfirm();
                setDeleteConfirm({ ...deleteConfirm, open: false });
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// --- REPORTS SUB-COMPONENT ---
interface ReportsProps {
  customers: Customer[];
  salesAreas: SalesArea[];
  purchases: CustomerPurchase[];
  employees: Employee[];
}

function SalesReports({
  customers,
  salesAreas,
  purchases,
  employees,
}: ReportsProps) {
  const approvedPurchases = useMemo(
    () => purchases.filter((p) => p.status === "Approved"),
    [purchases],
  );

  // Compute reports datasets
  const reportsStats = useMemo(() => {
    // 1. Total sales value
    const totalSales = approvedPurchases.reduce((sum, p) => sum + p.amount, 0);
    // 2. Average Ticket Value
    const averageTicket =
      approvedPurchases.length > 0 ? totalSales / approvedPurchases.length : 0;
    // 3. Conversion Rate (Customers with at least 1 purchase / Total Customers)
    const activeCustomers = new Set(approvedPurchases.map((p) => p.customer_id))
      .size;
    const conversionRate =
      customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0;

    return {
      totalSales,
      averageTicket,
      conversionRate,
      activeCustomers,
    };
  }, [approvedPurchases, customers]);

  // 4. Revenue Trend
  const monthlyRevenue = useMemo(() => {
    const months: { [key: string]: number } = {};

    // Group purchases by month
    approvedPurchases.forEach((p) => {
      const date = new Date(p.purchase_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + p.amount;
    });

    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([key, amount]) => {
        const [year, month] = key.split("-");
        const label = new Date(
          Number(year),
          Number(month) - 1,
          1,
        ).toLocaleDateString("en-US", {
          month: "short",
        });
        return { label, amount };
      });
  }, [approvedPurchases]);

  const maxMonthRev = Math.max(...monthlyRevenue.map((r) => r.amount), 1);

  // 5. Geographical Area Performance
  const areaPerformance = useMemo(() => {
    const Performance: {
      [id: string]: { area: SalesArea; revenue: number; customerCount: number };
    } = {};

    salesAreas.forEach((a) => {
      Performance[a.id] = { area: a, revenue: 0, customerCount: 0 };
    });

    customers.forEach((c) => {
      if (Performance[c.sales_area_id]) {
        Performance[c.sales_area_id].customerCount += 1;
      }
    });

    approvedPurchases.forEach((p) => {
      const c = customers.find((c) => c.id === p.customer_id);
      if (c && Performance[c.sales_area_id]) {
        Performance[c.sales_area_id].revenue += p.amount;
      }
    });

    return Object.values(Performance).sort((a, b) => b.revenue - a.revenue);
  }, [salesAreas, customers, approvedPurchases]);

  const maxAreaRev = Math.max(...areaPerformance.map((a) => a.revenue), 1);

  // 6. Employee Leaderboard
  const employeeLeaderboard = useMemo(() => {
    const board: {
      [id: string]: { emp: Employee; revenue: number; clientCount: number };
    } = {};

    employees.forEach((e) => {
      board[e.id] = { emp: e, revenue: 0, clientCount: 0 };
    });

    customers.forEach((c) => {
      if (board[c.assigned_employee_id]) {
        board[c.assigned_employee_id].clientCount += 1;
      }
    });

    approvedPurchases.forEach((p) => {
      const c = customers.find((c) => c.id === p.customer_id);
      if (c && board[c.assigned_employee_id]) {
        board[c.assigned_employee_id].revenue += p.amount;
      }
    });

    return Object.values(board).sort((a, b) => b.revenue - a.revenue);
  }, [employees, customers, approvedPurchases]);

  const maxEmpRev = Math.max(...employeeLeaderboard.map((e) => e.revenue), 1);

  return (
    <div className="space-y-6">
      {/* 3 Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Approved Sales
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            ₹{reportsStats.totalSales.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Realized business revenue</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Invoice Value
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            ₹{reportsStats.averageTicket.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Across all transaction tickets
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Customer Conversion
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {reportsStats.conversionRate.toFixed(1)}%
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {reportsStats.activeCustomers} of {customers.length} conversion
            accounts
          </p>
        </div>
      </div>

      {/* Row with Monthly Trends & Top Employees Horizontal Bar Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue over time (monthly) */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Monthly Performance Trends
          </h3>
          <div className="space-y-4">
            {monthlyRevenue.map((item, idx) => {
              const progress = (item.amount / maxMonthRev) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{item.label}</span>
                    <span>₹{item.amount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {monthlyRevenue.length === 0 && (
              <p className="text-xs text-center text-slate-400 py-6">
                No monthly purchase logs available.
              </p>
            )}
          </div>
        </div>

        {/* Employee performance list */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Sales Team Leaderboard
          </h3>
          <div className="space-y-4">
            {employeeLeaderboard.map((item, idx) => {
              const progress = (item.revenue / maxEmpRev) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>
                      {item.emp.full_name} ({item.clientCount} clients)
                    </span>
                    <span>₹{item.revenue.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {employeeLeaderboard.length === 0 && (
              <p className="text-xs text-center text-slate-400 py-6">
                No employee tracking data available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Row with Geographical Areas performance */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Geographical Sector Revenue
        </h3>
        <div className="space-y-4">
          {areaPerformance.map((item, idx) => {
            const progress = (item.revenue / maxAreaRev) * 100;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>
                    {item.area.area_name} ({item.customerCount} customers)
                  </span>
                  <span>₹{item.revenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
          {areaPerformance.length === 0 && (
            <p className="text-xs text-center text-slate-400 py-6">
              No sales area metrics generated.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
