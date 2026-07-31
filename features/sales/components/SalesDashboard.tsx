"use client";

import { useMemo } from "react";
import { TrendingUp, Users, DollarSign, MapPin, Award, CheckCircle, Clock, Edit2, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Customer, SalesArea, CustomerPurchase, CustomerFollowup } from "../sales.types";
import { Employee } from "@/features/employee/employee.types";
import { parsePurchaseRemarks } from "../sales.utils";

interface SalesDashboardProps {
  customers: Customer[];
  salesAreas: SalesArea[];
  purchases: CustomerPurchase[];
  followups: CustomerFollowup[];
  employees: Employee[];
  onViewCustomer: (c: Customer) => void;
  onEditPurchase?: (p: CustomerPurchase) => void;
  onDeletePurchase?: (p: CustomerPurchase) => void;
  deletingId?: string | null;
}

export default function SalesDashboard({
  customers,
  salesAreas,
  purchases,
  followups,
  employees,
  onViewCustomer,
  onEditPurchase,
  onDeletePurchase,
  deletingId = null,
}: SalesDashboardProps) {
  const todayStr = new Date().toISOString().substring(0, 10);

  // 1. KPI Calculations
  const stats = useMemo(() => {
    const approvedPurchases = purchases.filter((p) => p.status === "Approved");
    const totalRev = approvedPurchases.reduce((sum, p) => sum + p.amount, 0);

    const todayRev = approvedPurchases
      .filter((p) => p.purchase_date.startsWith(todayStr))
      .reduce((sum, p) => sum + p.amount, 0);

    const totalCustomers = customers.length;
    const totalPurchases = purchases.length;

    // Followups categories
    const now = new Date().getTime();
    let pendingF = 0;
    let completedF = 0;

    followups.forEach((f) => {
      if (f.next_followup_date) {
        const nextTime = new Date(f.next_followup_date).getTime();
        if (nextTime >= now) {
          pendingF++;
        } else {
          completedF++;
        }
      } else {
        completedF++;
      }
    });

    const totalIncentives = purchases
      .filter((p) => parsePurchaseRemarks(p.remarks, p.status).incentive_status === "Approved")
      .reduce((sum, p) => sum + p.incentive_amount, 0);
    const totalAreas = salesAreas.length;

    return {
      totalRev,
      todayRev,
      totalCustomers,
      totalPurchases,
      pendingF,
      completedF,
      totalIncentives,
      totalAreas,
    };
  }, [purchases, customers, followups, salesAreas, todayStr]);

  // 2. Monthly Revenue Chart Data (Last 6 Months)
  const chartData = useMemo(() => {
    const approved = purchases.filter((p) => p.status === "Approved");
    const monthsData: { [key: string]: number } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); // Set day to 1st of the month first to prevent month overflow
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthsData[key] = 0;
    }

    approved.forEach((p) => {
      const date = new Date(p.purchase_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthsData[key] !== undefined) {
        monthsData[key] += p.amount;
      }
    });

    return Object.entries(monthsData).map(([key, val]) => {
      const [year, month] = key.split("-");
      const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
        month: "short",
      });
      return { label, amount: val };
    });
  }, [purchases]);

  const maxChartAmount = useMemo(() => {
    return Math.max(...chartData.map((d) => d.amount), 10000);
  }, [chartData]);

  // 3. Top Performing Employees
  const topEmployees = useMemo(() => {
    return employees
      .map((emp) => {
        const assignedCustomers = customers.filter((c) => c.assigned_employee_id === emp.id);
        const customerCount = assignedCustomers.length;
        const assignedCustomerIds = new Set(assignedCustomers.map((c) => c.id));
        const employeePurchases = purchases.filter((p) => assignedCustomerIds.has(p.customer_id));
        const salesCount = employeePurchases.length;
        const approvedRevenue = employeePurchases
          .filter((p) => p.status === "Approved")
          .reduce((sum, p) => sum + p.amount, 0);

        return {
          employee: emp,
          revenue: approvedRevenue,
          customerCount,
          sales: salesCount,
        };
      })
      .sort((a, b) => {
        if (b.revenue !== a.revenue) {
          return b.revenue - a.revenue;
        }
        if (b.sales !== a.sales) {
          return b.sales - a.sales;
        }
        return b.customerCount - a.customerCount;
      })
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }, [employees, purchases, customers]);

  // 4. Upcoming Follow-ups
  const upcomingFollowups = useMemo(() => {
    const now = new Date().getTime();
    return followups
      .filter((f) => f.next_followup_date && new Date(f.next_followup_date).getTime() >= now)
      .sort((a, b) => new Date(a.next_followup_date!).getTime() - new Date(b.next_followup_date!).getTime())
      .slice(0, 5)
      .map((f) => {
        const cust = customers.find((c) => c.id === f.customer_id);
        const emp = cust ? employees.find((e) => e.id === cust.assigned_employee_id) : null;

        // Priority based  (within 3 days = High, 7 days = Medium, Else Low)
        const daysLeft = Math.ceil(
          (new Date(f.next_followup_date!).getTime() - now) / (1000 * 60 * 60 * 24)
        );
        const priority = daysLeft <= 2 ? "High" : daysLeft <= 5 ? "Medium" : "Low";

        return {
          id: f.id,
          customer: cust,
          date: f.next_followup_date!,
          priority,
          employee: emp,
        };
      });
  }, [followups, customers, employees]);

  // 5. Recent Purchases
  const recentPurchases = useMemo(() => {
    return purchases
      .slice(0, 5)
      .map((p) => {
        const cust = customers.find((c) => c.id === p.customer_id);
        const area = cust ? salesAreas.find((a) => a.id === cust.sales_area_id) : null;
        const employee = cust ? employees.find((e) => e.id === cust.assigned_employee_id) : null;
        return {
          ...p,
          customer: cust,
          area: area,
          employee: employee,
        };
      });
  }, [purchases, customers, salesAreas, employees]);

  // KPI metadata
  const cards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRev.toLocaleString("en-IN")}`,
      icon: <DollarSign className="h-5 w-5 text-blue-700" />,
      bgClass: "bg-blue-50 ring-blue-100",
      trend: "Overall Approved Sales",
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRev.toLocaleString("en-IN")}`,
      icon: <TrendingUp className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: "Logged today",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: <Users className="h-5 w-5 text-slate-700" />,
      bgClass: "bg-slate-50 ring-slate-100",
      trend: "Active accounts",
    },
    {
      title: "Total Purchases",
      value: stats.totalPurchases.toString(),
      icon: <CheckCircle className="h-5 w-5 text-indigo-700" />,
      bgClass: "bg-indigo-50 ring-indigo-100",
      trend: "All invoices",
    },
    {
      title: "Pending Follow-ups",
      value: stats.pendingF.toString(),
      icon: <Clock className="h-5 w-5 text-amber-700" />,
      bgClass: "bg-amber-50 ring-amber-100",
      trend: "Scheduled ahead",
    },
    {
      title: "Completed Follow-ups",
      value: stats.completedF.toString(),
      icon: <CheckCircle className="h-5 w-5 text-emerald-700" />,
      bgClass: "bg-emerald-50 ring-emerald-100",
      trend: "Resolved interactions",
    },
    {
      title: "Total Incentives",
      value: `₹${stats.totalIncentives.toLocaleString("en-IN")}`,
      icon: <Award className="h-5 w-5 text-yellow-700" />,
      bgClass: "bg-yellow-50 ring-yellow-100",
      trend: "Earned commissions",
    },
    {
      title: "Sales Areas",
      value: stats.totalAreas.toString(),
      icon: <MapPin className="h-5 w-5 text-teal-700" />,
      bgClass: "bg-teal-50 ring-teal-100",
      trend: "Active sectors",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4x2 Grid of KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${c.bgClass}`}>
                {c.icon}
              </span>
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">{c.title}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 leading-none">{c.value}</p>
            <p className="mt-2 text-[11px] font-medium text-slate-500">{c.trend}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Monthly Revenue</h2>
        <p className="text-xs text-slate-500 mt-1">Total approved revenue generated over the last 6 months</p>

        <div className="mt-6 flex h-60 items-end justify-between gap-4 border-b border-slate-100 pb-2">
          {chartData.map((data, idx) => {
            const heightPercent = (data.amount / maxChartAmount) * 100;
            return (
              <div key={idx} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                {/* Tooltip */}
                <div className="absolute -top-10 scale-0 rounded bg-slate-900 px-2 py-1 text-xs text-white transition duration-200 group-hover:scale-100 shadow-lg font-semibold whitespace-nowrap z-10">
                  ₹{data.amount.toLocaleString("en-IN")}
                </div>
                {/* Visual Bar */}
                <div
                  className="w-full max-w-[64px] rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-sm"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                />
                <span className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{data.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Employees & Follow-ups */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Employees */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950 mb-4 pb-2 border-b border-slate-100">
            Top Performing Employees
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Employee</th>
                  <th className="py-2">Revenue</th>
                  <th className="py-2 text-center">Customers</th>
                  <th className="py-2 text-center">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topEmployees.map((e) => (
                  <tr key={e.employee.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-900">#{e.rank}</td>
                    <td className="py-3">
                      <div>
                        <span className="font-semibold text-slate-800 block">{e.employee.full_name}</span>
                        <span className="text-[11px] text-slate-400">{e.employee.designation}</span>
                      </div>
                    </td>
                    <td className="py-3 font-bold text-slate-900">₹{e.revenue.toLocaleString("en-IN")}</td>
                    <td className="py-3 text-center">{e.customerCount}</td>
                    <td className="py-3 text-center">{e.sales}</td>
                  </tr>
                ))}
                {topEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 text-xs font-medium">
                      No sales data logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Follow-ups */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950 mb-4 pb-2 border-b border-slate-100">
            Upcoming Follow-ups
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                  <th className="py-2">Customer</th>
                  <th className="py-2">Scheduled Date</th>
                  <th className="py-2">Priority</th>
                  <th className="py-2">Assigned Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingFollowups.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      {f.customer ? (
                        <button
                          onClick={() => onViewCustomer(f.customer!)}
                          className="font-semibold text-blue-600 hover:underline text-left"
                        >
                          {f.customer.full_name}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 font-medium">{new Date(f.date).toLocaleDateString("en-IN")}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${f.priority === "High"
                            ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                            : f.priority === "Medium"
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                              : "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                          }`}
                      >
                        {f.priority}
                      </span>
                    </td>
                    <td className="py-3">{f.employee?.full_name || "Unassigned"}</td>
                  </tr>
                ))}
                {upcomingFollowups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs font-medium">
                      No future follow-ups scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Purchases Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Recent Purchases
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                <th className="py-2 px-2">Purchase Code</th>
                <th className="py-2 px-2">Customer</th>
                <th className="py-2 px-2">Assigned Employee</th>
                <th className="py-2 px-2">Area</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Amount</th>
                <th className="py-2 px-2">Purchase Date</th>
                <th className="py-2 px-2">Purchase Status</th>
                <th className="py-2 px-2">Incentive Status</th>
                <th className="py-2 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-2 font-semibold text-slate-900">{p.purchase_code}</td>
                  <td className="py-3 px-2">
                    {p.customer ? (
                      <button
                        onClick={() => onViewCustomer(p.customer!)}
                        className="font-semibold text-blue-600 hover:underline text-left"
                      >
                        {p.customer.full_name}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {p.employee ? (
                      <div>
                        <span className="font-semibold text-slate-800 block">{p.employee.full_name}</span>
                        {p.employee.department && (
                          <span className="text-[11px] text-slate-400">{p.employee.department}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-2">{p.area?.area_name || "N/A"}</td>
                  <td className="py-3 px-2 text-slate-500 text-xs font-medium">
                    {(() => {
                      const meta = parsePurchaseRemarks(p.remarks, p.status);
                      return meta.remarks ? (meta.remarks.length > 25 ? `${meta.remarks.substring(0, 25)}...` : meta.remarks) : "Direct Sale";
                    })()}
                  </td>
                  <td className="py-3 px-2 font-bold text-slate-950">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-2">{new Date(p.purchase_date).toLocaleDateString("en-IN")}</td>
                  <td className="py-3 px-2">
                    <Badge variant={p.status === "Approved" ? "success" : p.status === "Pending" ? "warning" : p.status === "Rejected" ? "danger" : "info"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    {(() => {
                      const meta = parsePurchaseRemarks(p.remarks, p.status);
                      const isVariant = (status: string) => {
                        if (status === "Approved") return "success";
                        if (status === "Pending Review" || status === "Eligible") return "warning";
                        if (status === "Rejected") return "danger";
                        return "info";
                      };
                      return (
                        <Badge variant={isVariant(meta.incentive_status)}>
                          {meta.incentive_status}
                        </Badge>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex gap-2 justify-end">
                      {onEditPurchase && (
                        <Button variant="secondary" onClick={() => onEditPurchase(p)} className="p-1.5 h-8 w-8 inline-flex items-center justify-center">
                          <Edit2 size={16} strokeWidth={2} className="text-amber-600 shrink-0" />
                        </Button>
                      )}
                      {onDeletePurchase && (
                        <Button
                          variant="secondary"
                          onClick={() => onDeletePurchase(p)}
                          disabled={deletingId === p.id}
                          className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                        >
                          <Trash2 size={16} strokeWidth={2} className="text-red-600 shrink-0" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {recentPurchases.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-slate-400 text-xs font-medium">
                    No purchases recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
