"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Customer, SalesArea, CustomerPurchase } from "@/features/sales/sales.types";
import { Incentive } from "@/features/incentive/incentive.types";
import { Trash2, Edit2, Eye } from "lucide-react";
import { parsePurchaseRemarks } from "@/features/sales/sales.utils";

// --- CUSTOMERS TABLE ---
interface CustomerTableProps {
  customers: Customer[];
  salesAreas: SalesArea[];
  onView: (c: Customer) => void;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
  deletingId: string | null;
}

export function EmployeeCustomerTable({
  customers,
  salesAreas,
  onView,
  onEdit,
  onDelete,
  deletingId,
}: CustomerTableProps) {
  const getAreaName = (areaId: string) => {
    return salesAreas.find((a) => a.id === areaId)?.area_name || "N/A";
  };

  const statusVariant = (status: string) => {
    if (status === "Active") return "success";
    if (status === "Blocked") return "danger";
    return "warning";
  };

  if (customers.length === 0) {
    return <EmptyState message="No customers assigned to you." />;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Phone</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Sales Area</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Created Date</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {customers.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <button
                onClick={() => onView(c)}
                className="font-semibold text-emerald-600 hover:text-emerald-800 text-left hover:underline"
              >
                {c.full_name}
              </button>
            </TableCell>
            <TableCell>{c.phone}</TableCell>
            <TableCell>{c.email || "-"}</TableCell>
            <TableCell>{getAreaName(c.sales_area_id)}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
            </TableCell>
            <TableCell>{new Date(c.created_at).toLocaleDateString("en-IN")}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => onView(c)}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  title="View details"
                >
                  <Eye size={16} strokeWidth={2} className="text-blue-600 shrink-0" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onEdit(c)}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  title="Edit customer"
                >
                  <Edit2 size={16} strokeWidth={2} className="text-amber-600 shrink-0" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onDelete(c)}
                  disabled={deletingId === c.id}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  title="Delete customer"
                >
                  <Trash2 size={16} strokeWidth={2} className="text-red-600 shrink-0" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// --- PURCHASES TABLE ---
interface PurchaseTableProps {
  purchases: CustomerPurchase[];
  customers: Customer[];
  salesAreas: SalesArea[];
  onEdit: (p: CustomerPurchase) => void;
  onDelete: (p: CustomerPurchase) => void;
  deletingId: string | null;
}

export function EmployeePurchaseTable({
  purchases,
  customers,
  salesAreas,
  onEdit,
  onDelete,
  deletingId,
}: PurchaseTableProps) {
  const getCustomerName = (cId: string) => {
    return customers.find((c) => c.id === cId)?.full_name || "Unknown";
  };

  const getCustomerArea = (cId: string) => {
    const cust = customers.find((c) => c.id === cId);
    if (!cust) return "N/A";
    return salesAreas.find((a) => a.id === cust.sales_area_id)?.area_name || "N/A";
  };

  const statusVariant = (status: string) => {
    if (status === "Approved") return "success";
    if (status === "Pending") return "warning";
    if (status === "Rejected") return "danger";
    return "info";
  };

  const incentiveStatusVariant = (status: string) => {
    if (status === "Approved") return "success";
    if (status === "Pending Review" || status === "Eligible") return "warning";
    if (status === "Rejected") return "danger";
    return "info";
  };

  if (purchases.length === 0) {
    return <EmptyState message="No purchases logged yet." />;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Customer</TableHeader>
          <TableHeader>Sales Area</TableHeader>
          <TableHeader>Amount</TableHeader>
          <TableHeader>Incentive</TableHeader>
          <TableHeader>Purchase Date</TableHeader>
          <TableHeader>Purchase Status</TableHeader>
          <TableHeader>Incentive Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {purchases.map((p) => {
          const meta = parsePurchaseRemarks(p.remarks, p.status);
          return (
            <TableRow key={p.id}>
              <TableCell>
                <span className="font-medium text-slate-700">{getCustomerName(p.customer_id)}</span>
              </TableCell>
              <TableCell>{getCustomerArea(p.customer_id)}</TableCell>
              <TableCell>
                <span className="font-bold text-slate-900">₹{p.amount.toLocaleString("en-IN")}</span>
              </TableCell>
              <TableCell>
                <span className="text-emerald-700 font-semibold">₹{p.incentive_amount.toLocaleString("en-IN")}</span>
              </TableCell>
              <TableCell>{new Date(p.purchase_date).toLocaleDateString("en-IN")}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={incentiveStatusVariant(meta.incentive_status)}>{meta.incentive_status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(p)}
                    className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  >
                    <Edit2 size={16} strokeWidth={2} className="text-amber-600 shrink-0" />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onDelete(p)}
                    disabled={deletingId === p.id}
                    className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  >
                    <Trash2 size={16} strokeWidth={2} className="text-red-600 shrink-0" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// --- SALES AREAS TABLE (READ ONLY) ---
interface SalesAreaTableProps {
  salesAreas: SalesArea[];
  customers: Customer[];
}

export function EmployeeSalesAreaTable({ salesAreas, customers }: SalesAreaTableProps) {
  const getCustomerCount = (areaId: string) => {
    return customers.filter((c) => c.sales_area_id === areaId).length;
  };

  if (salesAreas.length === 0) {
    return <EmptyState message="No sales areas assigned to you." />;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Area Name</TableHeader>
          <TableHeader>Area Type</TableHeader>
          <TableHeader>Your Customer Count</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {salesAreas.map((area) => (
          <TableRow key={area.id}>
            <TableCell>
              <div>
                <span className="font-bold text-slate-800 block">{area.area_name}</span>
                {area.city && (
                  <span className="text-xs text-slate-400">
                    {area.city}, {area.state || ""}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>{area.area_type}</TableCell>
            <TableCell>
              <Badge variant="info">{getCustomerCount(area.id)}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={area.status === "Active" ? "success" : "danger"}>{area.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// --- INCENTIVES TABLE (READ ONLY) ---
interface IncentivesTableProps {
  incentives: Incentive[];
}

export function EmployeeIncentivesTable({ incentives }: IncentivesTableProps) {
  const statusVariant = (status: string) => {
    if (status === "Approved") return "success";
    if (status === "Pending") return "warning";
    return "danger";
  };

  const paymentStatusVariant = (status: string) => {
    return status === "Paid" ? "success" : "warning";
  };

  if (incentives.length === 0) {
    return <EmptyState message="No incentives earned yet." />;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Title</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>Amount</TableHeader>
          <TableHeader>Period</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Payment Status</TableHeader>
          <TableHeader>Created Date</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {incentives.map((i) => (
          <TableRow key={i.id}>
            <TableCell>
              <div>
                <span className="font-semibold text-slate-800 block">{i.title}</span>
                {i.description && <span className="text-xs text-slate-400 block">{i.description}</span>}
              </div>
            </TableCell>
            <TableCell>{i.incentive_type}</TableCell>
            <TableCell>
              <span className="font-bold text-slate-900">₹{i.amount.toLocaleString("en-IN")}</span>
            </TableCell>
            <TableCell>
              <span>{new Date(0, i.month - 1).toLocaleString("en-IN", { month: "long" })} {i.year}</span>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant(i.status)}>{i.status}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={paymentStatusVariant(i.payment_status)}>{i.payment_status}</Badge>
            </TableCell>
            <TableCell>{new Date(i.created_at).toLocaleDateString("en-IN")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// --- HELPER EMPTY STATE ---
function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
      <p className="text-sm font-semibold text-slate-500">{message}</p>
    </div>
  );
}
