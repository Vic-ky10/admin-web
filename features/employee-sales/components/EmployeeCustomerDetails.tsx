"use client";

import { useMemo } from "react";
import { ArrowLeft, Calendar, DollarSign, Phone, Mail, MapPin, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Customer, SalesArea, CustomerPurchase, CustomerFollowup } from "@/features/sales/sales.types";
import { parsePurchaseRemarks } from "@/features/sales/sales.utils";

interface EmployeeCustomerDetailsProps {
  customer: Customer;
  salesAreas: SalesArea[];
  purchases: CustomerPurchase[];
  followups: CustomerFollowup[];
  onBack: () => void;
}

export default function EmployeeCustomerDetails({
  customer,
  salesAreas,
  purchases,
  followups,
  onBack,
}: EmployeeCustomerDetailsProps) {
  const salesAreaName = useMemo(() => {
    return salesAreas.find((a) => a.id === customer.sales_area_id)?.area_name || "N/A";
  }, [salesAreas, customer.sales_area_id]);

  const customerPurchases = useMemo(() => {
    return purchases
      .filter((p) => p.customer_id === customer.id)
      .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
  }, [purchases, customer.id]);

  const totalPurchaseValue = useMemo(() => {
    return customerPurchases.reduce((sum, p) => sum + p.amount, 0);
  }, [customerPurchases]);

  const lastPurchase = useMemo(() => {
    return customerPurchases[0] || null;
  }, [customerPurchases]);

  const customerFollowups = useMemo(() => {
    return followups
      .filter((f) => f.customer_id === customer.id)
      .sort((a, b) => new Date(b.followup_date).getTime() - new Date(a.followup_date).getTime());
  }, [followups, customer.id]);

  const nextFollowup = useMemo(() => {
    const active = customerFollowups.filter((f) => f.next_followup_date);
    if (active.length === 0) return null;
    return active.sort((a, b) => new Date(a.next_followup_date!).getTime() - new Date(b.next_followup_date!).getTime())[0];
  }, [customerFollowups]);

  const statusVariant = (status: string) => {
    if (status === "Active") return "success";
    if (status === "Blocked") return "danger";
    return "warning";
  };

  const purchaseStatusVariant = (status: string) => {
    if (status === "Approved") return "success";
    if (status === "Pending") return "warning";
    if (status === "Rejected") return "danger";
    return "info";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={onBack} className="p-2 border-slate-200 text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{customer.full_name}</h1>
            <Badge variant={statusVariant(customer.status)}>{customer.status}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Customer ID: {customer.customer_code}</p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Purchases</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹{totalPurchaseValue.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across {customerPurchases.length} transactions</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Last Purchase</span>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {lastPurchase ? `₹${lastPurchase.amount.toLocaleString("en-IN")}` : "No purchases"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {lastPurchase ? new Date(lastPurchase.purchase_date).toLocaleDateString("en-IN") : "N/A"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Next Follow-up</span>
            <Phone className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-700">
            {nextFollowup?.next_followup_date
              ? new Date(nextFollowup.next_followup_date).toLocaleDateString("en-IN")
              : "Not scheduled"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {nextFollowup ? `Type: ${nextFollowup.followup_type}` : "CRM calendar open"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Customer Profile
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-700">{customer.phone}</p>
                  {customer.alternate_phone && (
                    <p className="text-xs text-slate-500 mt-0.5">Alt: {customer.alternate_phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-700">{customer.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">Sales Area</p>
                  <p className="text-sm font-medium text-slate-700">{salesAreaName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">Account Created</p>
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(customer.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {customer.notes && (
              <div className="pt-4 border-t border-slate-100 space-y-1">
                <p className="text-xs font-semibold text-slate-400">Your Sales Notes</p>
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed italic border border-slate-100">
                  {customer.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Purchase history & CRM Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Purchase History */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Purchase History</span>
              <Badge variant="info">{customerPurchases.length}</Badge>
            </h2>

            {customerPurchases.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No purchases recorded for this customer yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-2">Code</th>
                      <th className="py-3 px-2">Amount</th>
                      <th className="py-3 px-2">Incentive</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Purchase Status</th>
                      <th className="py-3 px-2">Incentive Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerPurchases.map((p) => {
                      const meta = parsePurchaseRemarks(p.remarks, p.status);
                      const isVariant = (status: string) => {
                        if (status === "Approved") return "success";
                        if (status === "Pending Review" || status === "Eligible") return "warning";
                        if (status === "Rejected") return "danger";
                        return "info";
                      };
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-2 font-medium text-slate-900">{p.purchase_code}</td>
                          <td className="py-3 px-2 font-semibold">₹{p.amount.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-2 text-slate-500">₹{p.incentive_amount.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-2">{new Date(p.purchase_date).toLocaleDateString("en-IN")}</td>
                          <td className="py-3 px-2">
                            <Badge variant={purchaseStatusVariant(p.status)}>{p.status}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant={isVariant(meta.incentive_status)}>{meta.incentive_status}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CRM Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
              CRM Interaction Timeline
            </h2>

            {customerFollowups.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No follow-up activities logged yet.</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l border-slate-200 space-y-6 ml-2">
                {customerFollowups.map((f) => (
                  <div key={f.id} className="relative">
                    {/* Circle marker */}
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 border-2 border-white ring-1 ring-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(f.followup_date).toLocaleDateString("en-IN")}
                        </span>
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {f.followup_type}
                        </span>
                        {f.next_followup_date && (
                          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            Next Followup: {new Date(f.next_followup_date).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </div>
                      
                      {f.remarks && (
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/55 p-3 rounded-lg border border-slate-100">
                          {f.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
