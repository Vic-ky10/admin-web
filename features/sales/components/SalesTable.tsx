"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Customer,
  SalesArea,
  CustomerPurchase,
  IncentiveRule,
} from "../sales.types";
import { Employee } from "@/features/employee/employee.types";
import { Trash2, Edit2, Eye } from "lucide-react";
import { parsePurchaseRemarks } from "../sales.utils";

// --- CUSTOMERS TABLE ---
interface CustomerTableProps {
  customers: Customer[];
  salesAreas: SalesArea[];
  employees: Employee[];
  onView: (c: Customer) => void;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
  deletingId: string | null;
}

export function CustomerTable({
  customers,
  salesAreas,
  employees,
  onView,
  onEdit,
  onDelete,
  deletingId,
}: CustomerTableProps) {
  const getAreaName = (areaId: string) => {
    return salesAreas.find((a) => a.id === areaId)?.area_name || "N/A";
  };

  const getEmployeeName = (empId: string) => {
    return employees.find((e) => e.id === empId)?.full_name || "Unassigned";
  };

  const statusVariant = (status: string) => {
    if (status === "Active") return "success";
    if (status === "Blocked") return "danger";
    return "warning";
  };

  if (customers.length === 0) {
    return <EmptyState message="No customers found." />;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Code</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Phone</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Sales Area</TableHeader>
          <TableHeader>Representative</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Created Date</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {customers.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <span className="font-semibold text-slate-900">
                {c.customer_code}
              </span>
            </TableCell>
            <TableCell>
              <button
                onClick={() => onView(c)}
                className="font-semibold text-blue-600 hover:text-blue-800 text-left hover:underline"
              >
                {c.full_name}
              </button>
            </TableCell>
            <TableCell>{c.phone}</TableCell>
            <TableCell>{c.email || "-"}</TableCell>
            <TableCell>{getAreaName(c.sales_area_id)}</TableCell>
            <TableCell>{getEmployeeName(c.assigned_employee_id)}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
            </TableCell>
            <TableCell>
              {new Date(c.created_at).toLocaleDateString("en-IN")}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => onView(c)}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  title="View details"
                >
                  <Eye
                    size={16}
                    strokeWidth={2}
                    className="text-blue-600 shrink-0"
                  />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onEdit(c)}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  title="Edit customer"
                >
                  <Edit2
                    size={16}
                    strokeWidth={2}
                    className="text-amber-600 shrink-0"
                  />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onDelete(c)}
                  disabled={deletingId === c.id}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  title="Delete customer"
                >
                  <Trash2
                    size={16}
                    strokeWidth={2}
                    className="text-red-600 shrink-0"
                  />
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
  employees: Employee[];
  onEdit: (p: CustomerPurchase) => void;
  onDelete: (p: CustomerPurchase) => void;
  deletingId: string | null;
}

export function PurchaseTable({
  purchases,
  customers,
  salesAreas,
  employees,
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
    return (
      salesAreas.find((a) => a.id === cust.sales_area_id)?.area_name || "N/A"
    );
  };

  const getCustomerRepresentative = (cId: string) => {
    const cust = customers.find((c) => c.id === cId);
    if (!cust) return "Unassigned";
    return (
      employees.find((e) => e.id === cust.assigned_employee_id)?.full_name ||
      "Unassigned"
    );
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
    return <EmptyState message="No customer purchases recorded." />;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Purchase Code</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader>Sales Area</TableHeader>
          <TableHeader>Representative</TableHeader>
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
                <span className="font-semibold text-slate-900">
                  {p.purchase_code}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-medium text-slate-700">
                  {getCustomerName(p.customer_id)}
                </span>
              </TableCell>
              <TableCell>{getCustomerArea(p.customer_id)}</TableCell>
              <TableCell>{getCustomerRepresentative(p.customer_id)}</TableCell>
              <TableCell>
                <span className="font-bold text-slate-900">
                  ₹{p.amount.toLocaleString("en-IN")}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-emerald-700 font-semibold">
                  ₹{p.incentive_amount.toLocaleString("en-IN")}
                </span>
              </TableCell>
              <TableCell>
                {new Date(p.purchase_date).toLocaleDateString("en-IN")}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={incentiveStatusVariant(meta.incentive_status)}>
                  {meta.incentive_status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(p)}
                    className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  >
                    <Edit2
                      size={16}
                      strokeWidth={2}
                      className="text-amber-600 shrink-0"
                    />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onDelete(p)}
                    disabled={deletingId === p.id}
                    className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                  >
                    <Trash2
                      size={16}
                      strokeWidth={2}
                      className="text-red-600 shrink-0"
                    />
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

// --- SALES AREAS TABLE ---
interface SalesAreaTableProps {
  salesAreas: SalesArea[];
  customers: Customer[];
  employees: Employee[];
  onEdit: (a: SalesArea) => void;
  onDelete: (a: SalesArea) => void;
  deletingId: string | null;
}

export function SalesAreaTable({
  salesAreas,
  customers,
  employees,
  onEdit,
  onDelete,
  deletingId,
}: SalesAreaTableProps) {
  // Count customers in area
  const getCustomerCount = (areaId: string) => {
    return customers.filter((c) => c.sales_area_id === areaId).length;
  };

  // Find unique representatives assigned to customers in this sales area
  const getRepresentatives = (areaId: string) => {
    const areaCustomers = customers.filter((c) => c.sales_area_id === areaId);
    const empIds = Array.from(
      new Set(areaCustomers.map((c) => c.assigned_employee_id)),
    );
    if (empIds.length === 0) return "None Assigned";
    return empIds
      .map((id) => employees.find((e) => e.id === id)?.full_name)
      .filter(Boolean)
      .join(", ");
  };

  if (salesAreas.length === 0) {
    return <EmptyState message="No sales areas created." />;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Code</TableHeader>
          <TableHeader>Area Name</TableHeader>
          <TableHeader>Area Type</TableHeader>
          <TableHeader>Assigned Representatives</TableHeader>
          <TableHeader>Customer Count</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {salesAreas.map((area) => (
          <TableRow key={area.id}>
            <TableCell>
              <span className="font-semibold text-slate-900">
                {area.area_code}
              </span>
            </TableCell>
            <TableCell>
              <div>
                <span className="font-bold text-slate-800 block">
                  {area.area_name}
                </span>
                {area.city && (
                  <span className="text-xs text-slate-400">
                    {area.city}, {area.state || ""}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>{area.area_type}</TableCell>
            <TableCell>
              <span className="text-xs font-medium text-slate-600 block max-w-xs truncate">
                {getRepresentatives(area.id)}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant="info">{getCustomerCount(area.id)}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={area.status === "Active" ? "success" : "danger"}>
                {area.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => onEdit(area)}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                >
                  <Edit2
                    size={16}
                    strokeWidth={2}
                    className="text-amber-600 shrink-0"
                  />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onDelete(area)}
                  disabled={deletingId === area.id}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                >
                  <Trash2
                    size={16}
                    strokeWidth={2}
                    className="text-red-600 shrink-0"
                  />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface IncentiveRuleTableProps {
  incentiveRules: IncentiveRule[];
  onEdit: (r: IncentiveRule) => void;
  onDelete: (r: IncentiveRule) => void;
  deletingId: string | null;
}

export function IncentiveRuleTable({
  incentiveRules,
  onEdit,
  onDelete,
  deletingId,
}: IncentiveRuleTableProps) {
  if (incentiveRules.length === 0) {
    return <EmptyState message="No incentive rules defined." />;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Minimum Purchase Amount Target</TableHeader>
          <TableHeader>Incentive Commission Payout</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Created Date</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {incentiveRules.map((rule) => (
          <TableRow key={rule.id}>
            <TableCell>
              <span className="font-bold text-slate-800">
                ₹{rule.minimum_purchase.toLocaleString("en-IN")}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-emerald-700 font-bold">
                ₹{rule.incentive_amount.toLocaleString("en-IN")}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant={rule.status === "Active" ? "success" : "danger"}>
                {rule.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(rule.created_at).toLocaleDateString("en-IN")}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => onEdit(rule)}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                >
                  <Edit2
                    size={16}
                    strokeWidth={2}
                    className="text-amber-600 shrink-0"
                  />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onDelete(rule)}
                  disabled={deletingId === rule.id}
                  className="p-1.5 h-8 w-8 inline-flex items-center justify-center"
                >
                  <Trash2
                    size={16}
                    strokeWidth={2}
                    className="text-red-600 shrink-0"
                  />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
      <p className="text-sm font-semibold text-slate-500">{message}</p>
    </div>
  );
}
