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
  Trash2,
  Edit2,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

// Dialog components
import EmployeeCustomerDialog from "./EmployeeCustomerDialog";
import EmployeePurchaseDialog from "./EmployeePurchaseDialog";
import EmployeeFollowupDialog from "./EmployeeFollowupDialog";

// Display Components
import EmployeeSalesDashboard from "./EmployeeSalesDashboard";
import EmployeeCustomerDetails from "./EmployeeCustomerDetails";
import {
  EmployeeCustomerTable,
  EmployeePurchaseTable,
  EmployeeSalesAreaTable,
  EmployeeIncentivesTable,
} from "./EmployeeSalesTable";

// Server Actions
import {
  createEmployeeCustomerAction,
  updateEmployeeCustomerAction,
  deleteEmployeeCustomerAction,
  createEmployeePurchaseAction,
  updateEmployeePurchaseAction,
  deleteEmployeePurchaseAction,
  createEmployeeFollowupAction,
  updateEmployeeFollowupAction,
  deleteEmployeeFollowupAction,
} from "../employee-sales.actions";

// Types
import { Customer, SalesArea, CustomerPurchase, CustomerFollowup } from "@/features/sales/sales.types";
import { Incentive } from "@/features/incentive/incentive.types";
import {
  CustomerForm,
  CustomerPurchaseForm,
  CustomerFollowupForm,
} from "@/features/sales/sales.validation";

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  monthlySales: number;
  totalCustomers: number;
  totalPurchases: number;
  pendingFollowupsCount: number;
  completedFollowupsCount: number;
  todayFollowupsCount: number;
  earnedIncentives: number;
}

interface UpcomingFollowup {
  id: string;
  customerName: string;
  customerCode: string;
  date: string;
  priority: "High" | "Medium" | "Low";
  type: string;
}

interface RecentCustomer {
  id: string;
  customer_code: string;
  full_name: string;
  phone: string;
  email: string | null;
  areaName: string;
  status: string;
}

interface RecentPurchase {
  id: string;
  purchase_code: string;
  customerName: string;
  amount: number;
  incentive_amount: number;
  purchase_date: string;
  status: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
}

interface MonthlyTrendItem {
  label: string;
  amount: number;
}

interface EmployeeSalesClientProps {
  employeeId: string;
  customers: Customer[];
  purchases: CustomerPurchase[];
  followups: CustomerFollowup[];
  incentives: Incentive[];
  salesAreas: SalesArea[];
  activeSalesAreas?: SalesArea[];
  dashboardData: {
    stats: DashboardStats;
    upcomingFollowups: UpcomingFollowup[];
    recentCustomers: RecentCustomer[];
    recentPurchases: RecentPurchase[];
    recentActivities: RecentActivity[];
    monthlyTrend: MonthlyTrendItem[];
  };
}

type TabType = "dashboard" | "customers" | "purchases" | "followups" | "areas" | "incentives" | "reports";

export default function EmployeeSalesClient({
  employeeId,
  customers,
  purchases,
  followups,
  incentives,
  salesAreas,
  activeSalesAreas,
  dashboardData,
}: EmployeeSalesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Selected customer for detailed view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Dialog State
  const [customerModal, setCustomerModal] = useState<{ open: boolean; item: Customer | null }>({
    open: false,
    item: null,
  });
  const [purchaseModal, setPurchaseModal] = useState<{ open: boolean; item: CustomerPurchase | null }>({
    open: false,
    item: null,
  });
  const [followupModal, setFollowupModal] = useState<{ open: boolean; item: CustomerFollowup | null }>({
    open: false,
    item: null,
  });

  useEffect(() => {
    const purchaseId = searchParams?.get("purchaseId");
    if (purchaseId) {
      const match = purchases.find((p) => p.id === purchaseId || p.purchase_code === purchaseId);
      if (match) {
        setTimeout(() => {
          setActiveTab("purchases");
          setPurchaseModal({ open: true, item: match });
        }, 0);
      }
    }
  }, [searchParams, purchases]);

  // Filter/Search states
  const [search, setSearch] = useState("");
  const [areaId, setAreaId] = useState("");
  const [status, setStatus] = useState("");
  const [followupStatusFilter, setFollowupStatusFilter] = useState<"All" | "Pending" | "Completed" | "Overdue">("All");

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
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [selectedCustomerId, customers]);

  // --- SUBMISSIONS & CRUDS ---
  const handleCustomerSubmit = async (values: CustomerForm) => {
    startTransition(async () => {
      const res = customerModal.item
        ? await updateEmployeeCustomerAction(customerModal.item.id, values)
        : await createEmployeeCustomerAction(values);

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
          const res = await deleteEmployeeCustomerAction(cust.id);
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
        ? await updateEmployeePurchaseAction(purchaseModal.item.id, values)
        : await createEmployeePurchaseAction(values);

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
          const res = await deleteEmployeePurchaseAction(p.id);
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
        ? await updateEmployeeFollowupAction(followupModal.item.id, values)
        : await createEmployeeFollowupAction(values);

      if (res.success) {
        toast.success(res.message || "Follow-up logged successfully.");
        setFollowupModal({ open: false, item: null });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save follow-up.");
      }
    });
  };

  const handleFollowupComplete = async (f: CustomerFollowup) => {
    startTransition(async () => {
      const res = await updateEmployeeFollowupAction(f.id, {
        customer_id: f.customer_id,
        followup_date: new Date().toISOString().substring(0, 10),
        followup_type: f.followup_type,
        remarks: (f.remarks || "") + " (Completed follow-up)",
        next_followup_date: "", // Set blank to mark as completed
      });

      if (res.success) {
        toast.success("Follow-up marked as completed.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to complete follow-up.");
      }
    });
  };

  const handleFollowupDelete = (f: CustomerFollowup) => {
    setDeleteConfirm({
      open: true,
      onConfirm: () => {
        setDeletingId(f.id);
        startTransition(async () => {
          const res = await deleteEmployeeFollowupAction(f.id);
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

  // --- FILTERS LOGIC ---
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search ||
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        c.customer_code.toLowerCase().includes(search.toLowerCase());

      const matchesArea = !areaId || c.sales_area_id === areaId;
      const matchesStatus = !status || c.status === status;

      return matchesSearch && matchesArea && matchesStatus;
    });
  }, [customers, search, areaId, status]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const cust = customers.find((c) => c.id === p.customer_id);
      if (!cust) return false;

      const matchesSearch =
        !search ||
        cust.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.purchase_code.toLowerCase().includes(search.toLowerCase());

      const matchesArea = !areaId || cust.sales_area_id === areaId;
      const matchesStatus = !status || p.status === status;

      return matchesSearch && matchesArea && matchesStatus;
    });
  }, [purchases, customers, search, areaId, status]);

  // Compute followups categorized
  const computedFollowups = useMemo(() => {
    const now = new Date().getTime();

    return followups
      .map((f) => {
        const cust = customers.find((c) => c.id === f.customer_id);

        let fStatus: "Completed" | "Pending" | "Overdue" = "Completed";
        if (f.next_followup_date) {
          const nextTime = new Date(f.next_followup_date).getTime();
          if (nextTime >= now) {
            fStatus = "Pending";
          } else {
            fStatus = "Overdue";
          }
        }

        let priority: "High" | "Medium" | "Low" = "Low";
        if (f.next_followup_date) {
          const daysLeft = Math.ceil((new Date(f.next_followup_date).getTime() - now) / (1000 * 60 * 60 * 24));
          priority = daysLeft <= 2 ? "High" : daysLeft <= 5 ? "Medium" : "Low";
        }

        return {
          ...f,
          customer: cust,
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
        const matchesStatus = followupStatusFilter === "All" || f.computedStatus === followupStatusFilter;

        return matchesSearch && matchesArea && matchesStatus;
      });
  }, [followups, customers, search, areaId, followupStatusFilter]);

  // Tab configurations
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "customers", label: "My Customers", icon: Users },
    { id: "purchases", label: "My Purchases", icon: CreditCard },
    { id: "followups", label: "Follow-ups", icon: PhoneCall },
    { id: "areas", label: "Sales Areas", icon: MapPin },
    { id: "incentives", label: "Incentives", icon: Award },
    { id: "reports", label: "My Reports", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === "dashboard"
              ? "Sales Dashboard"
              : activeTab === "customers"
              ? "My Customers"
              : activeTab === "purchases"
              ? "My Customer Purchases"
              : activeTab === "followups"
              ? "CRM Follow-ups"
              : activeTab === "areas"
              ? "Assigned Sales Areas"
              : activeTab === "incentives"
              ? "Incentive Tracking"
              : "My Performance Reports"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === "dashboard" && "Overview of sales performance and customer activities."}
            {activeTab === "customers" && "CRM database of your client portfolios."}
            {activeTab === "purchases" && "Log, track, and manage customer purchase records."}
            {activeTab === "followups" && "CRM pipeline and schedule of customer follow-ups."}
            {activeTab === "areas" && "Geographical sales sectors where you have active customers."}
            {activeTab === "incentives" && "View rule commission thresholds and your earned history."}
            {activeTab === "reports" && "Visual trend charts and transaction statements."}
          </p>
        </div>

        {/* Global Primary Buttons depending on tab */}
        <div className="flex gap-2">
          {activeTab === "customers" && !selectedCustomerId && (
            <Button
              onClick={() => setCustomerModal({ open: true, item: null })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-2 hover:shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          )}
          {activeTab === "purchases" && (
            <Button
              onClick={() => setPurchaseModal({ open: true, item: null })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-2 hover:shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              Log Purchase
            </Button>
          )}
          {activeTab === "followups" && (
            <Button
              onClick={() => setFollowupModal({ open: true, item: null })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-2 hover:shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              Log Follow-up
            </Button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap -mb-px gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSelectedCustomerId(null);
                }}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-emerald-600 text-emerald-700 font-bold"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {selectedCustomer ? (
          <EmployeeCustomerDetails
            customer={selectedCustomer}
            salesAreas={salesAreas}
            purchases={purchases}
            followups={followups}
            onBack={() => setSelectedCustomerId(null)}
          />
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <EmployeeSalesDashboard
                stats={dashboardData.stats}
                upcomingFollowups={dashboardData.upcomingFollowups}
                recentCustomers={dashboardData.recentCustomers}
                recentPurchases={dashboardData.recentPurchases}
                recentActivities={dashboardData.recentActivities}
                monthlyTrend={dashboardData.monthlyTrend}
                onViewCustomer={(custName) => {
                  // Direct navigation to customer match
                  const match = customers.find((c) => c.full_name === custName);
                  if (match) {
                    setActiveTab("customers");
                    setSelectedCustomerId(match.id);
                  }
                }}
                onEditPurchase={(pId) => {
                  const match = purchases.find((p) => p.id === pId);
                  if (match) setPurchaseModal({ open: true, item: match });
                }}
                onDeletePurchase={(pId) => {
                  const match = purchases.find((p) => p.id === pId);
                  if (match) handlePurchaseDelete(match);
                }}
                deletingId={deletingId}
              />
            )}

            {/* Customers Tab */}
            {activeTab === "customers" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200 shadow-sm">
                  <input
                    type="text"
                    placeholder="Search by name, code or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[240px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={areaId}
                      onChange={(e) => setAreaId(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
                    >
                      <option value="">All Sales Areas</option>
                      {salesAreas.map((a) => (
                        <option key={a.id} value={a.id}>{a.area_name}</option>
                      ))}
                    </select>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                <EmployeeCustomerTable
                  customers={filteredCustomers}
                  salesAreas={salesAreas}
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
                <div className="flex flex-wrap gap-3 items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200 shadow-sm">
                  <input
                    type="text"
                    placeholder="Search by client or purchase code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[240px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={areaId}
                      onChange={(e) => setAreaId(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
                    >
                      <option value="">All Sales Areas</option>
                      {salesAreas.map((a) => (
                        <option key={a.id} value={a.id}>{a.area_name}</option>
                      ))}
                    </select>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Not Eligible">Not Eligible</option>
                    </select>
                  </div>
                </div>

                <EmployeePurchaseTable
                  purchases={filteredPurchases}
                  customers={customers}
                  salesAreas={salesAreas}
                  onEdit={(p) => setPurchaseModal({ open: true, item: p })}
                  onDelete={handlePurchaseDelete}
                  deletingId={deletingId}
                />
              </div>
            )}

            {/* Follow-ups CRM Timeline Tab */}
            {activeTab === "followups" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm overflow-hidden w-fit">
                    {(["All", "Pending", "Completed", "Overdue"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFollowupStatusFilter(filter)}
                        className={`rounded-md px-4 py-1.5 text-xs font-bold transition ${
                          followupStatusFilter === filter
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Search by customer name or remarks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-80 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-sm"
                  />
                </div>

                {computedFollowups.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                    <p className="text-sm font-semibold text-slate-500">No scheduled follow-up activities match filters.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {computedFollowups.map((f) => (
                      <div
                        key={f.id}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-emerald-200 hover:shadow-md transition duration-200"
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
                              className="font-bold text-slate-800 hover:text-emerald-700 text-left block hover:underline"
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
                            <span className="font-semibold text-slate-400">Interaction Type:</span>
                            <span className="font-medium text-slate-800">{f.followup_type}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="font-semibold text-slate-400">Completed Date:</span>
                            <span className="font-medium text-slate-800">{new Date(f.followup_date).toLocaleDateString("en-IN")}</span>
                          </p>
                          {f.next_followup_date && (
                            <p className="flex justify-between">
                              <span className="font-semibold text-slate-400">Next Scheduled:</span>
                              <span className="font-bold text-emerald-700">{new Date(f.next_followup_date).toLocaleDateString("en-IN")}</span>
                            </p>
                          )}
                          {f.next_followup_date && (
                            <p className="flex justify-between">
                              <span className="font-semibold text-slate-400">Proximity Priority:</span>
                              <span
                                className={`font-bold ${
                                  f.computedPriority === "High"
                                    ? "text-red-650 bg-red-50 px-1.5 rounded"
                                    : f.computedPriority === "Medium"
                                    ? "text-amber-650 bg-amber-50 px-1.5 rounded"
                                    : "text-emerald-650 bg-emerald-50 px-1.5 rounded"
                                }`}
                              >
                                {f.computedPriority}
                              </span>
                            </p>
                          )}
                        </div>

                        {f.remarks && (
                          <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 italic border border-slate-100 max-h-24 overflow-y-auto leading-relaxed">
                            &quot;{f.remarks}&quot;
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          {f.computedStatus !== "Completed" && (
                            <Button
                              variant="secondary"
                              onClick={() => handleFollowupComplete(f)}
                              className="flex-1 text-xs py-1.5 inline-flex items-center justify-center border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            onClick={() => setFollowupModal({ open: true, item: f })}
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
                <EmployeeSalesAreaTable
                  salesAreas={salesAreas}
                  customers={customers}
                />
              </div>
            )}

            {/* Incentives Tab */}
            {activeTab === "incentives" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-800">Your Sales Commissions</h3>
                    <p className="text-xs text-emerald-600 mt-1 leading-relaxed max-w-xl">
                      Incentives are auto-calculated from eligible approved purchases matching the minimum targets set by the Admin. Track your totals and payments here.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg px-6 py-4 shadow-sm border border-slate-100 text-center ring-1 ring-emerald-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Earned Incentives</span>
                    <span className="text-2xl font-extrabold text-slate-900 mt-1 block">₹{dashboardData.stats.earnedIncentives.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <EmployeeIncentivesTable
                  incentives={incentives}
                />
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                {/* Reports Summary Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue Generated</span>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">₹{dashboardData.stats.totalRevenue.toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-xs text-slate-500">From all approved purchases</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Month-to-Date Revenue</span>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">₹{dashboardData.stats.monthlyRevenue.toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-xs text-slate-500">Across {dashboardData.stats.monthlySales} invoices</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">My Client Portfolio</span>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{dashboardData.stats.totalCustomers} Accounts</p>
                    <p className="mt-1 text-xs text-slate-500">Active representative portfolios</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Accumulated Incentives</span>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">₹{dashboardData.stats.earnedIncentives.toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-xs text-slate-500">Calculated from approved incentives</p>
                  </div>
                </div>

                {/* CSS Bar Chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend (Last 6 Months)</h2>
                  <div className="flex h-64 items-end gap-6 px-2 pt-6">
                    {dashboardData.monthlyTrend.map((data, index) => {
                      const heightPercent = Math.max((data.amount / (Math.max(...dashboardData.monthlyTrend.map((d) => d.amount), 10000))) * 100, 3);
                      return (
                        <div key={index} className="group flex flex-1 flex-col items-center gap-2 h-full justify-end">
                          <div className="relative w-full flex justify-center">
                            <span className="absolute -top-10 scale-0 group-hover:scale-100 rounded bg-slate-900 px-2 py-1 text-[11px] font-bold text-white shadow-lg transition duration-200 z-10 whitespace-nowrap">
                              ₹{data.amount.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full rounded-t-lg bg-emerald-600 transition-all duration-300 group-hover:bg-emerald-700 shadow-sm"
                          />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {data.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statement of purchases */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">My Sales Invoices</h2>
                  <EmployeePurchaseTable
                    purchases={purchases}
                    customers={customers}
                    salesAreas={salesAreas}
                    onEdit={(p) => setPurchaseModal({ open: true, item: p })}
                    onDelete={handlePurchaseDelete}
                    deletingId={deletingId}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog Modals */}
      <EmployeeCustomerDialog
        open={customerModal.open}
        customer={customerModal.item}
        salesAreas={activeSalesAreas && activeSalesAreas.length > 0 ? activeSalesAreas : salesAreas}
        employeeId={employeeId}
        onClose={() => setCustomerModal({ open: false, item: null })}
        onSubmit={handleCustomerSubmit}
        loading={isPending}
      />

      <EmployeePurchaseDialog
        open={purchaseModal.open}
        purchase={purchaseModal.item}
        customers={customers}
        onClose={() => setPurchaseModal({ open: false, item: null })}
        onSubmit={handlePurchaseSubmit}
        loading={isPending}
      />

      <EmployeeFollowupDialog
        open={followupModal.open}
        followup={followupModal.item}
        customers={customers}
        onClose={() => setFollowupModal({ open: false, item: null })}
        onSubmit={handleFollowupSubmit}
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
