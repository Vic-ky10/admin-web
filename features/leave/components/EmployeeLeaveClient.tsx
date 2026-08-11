"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { 
  Calendar, 
  CalendarCheck, 
  CalendarClock, 
  CalendarDays, 
  Filter, 
  RefreshCw 
} from "lucide-react";

import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { cancelLeaveAction } from "../leave.actions";
import { LEAVE_STATUS, LEAVE_TYPE, LeaveRequest } from "../leave.types";
import { formatDate } from "../leave.utils";
import LeaveDetailsModal from "./LeaveDetailsModal";
import LeaveRequestForm from "./LeaveRequestForm";
import LeaveStatusBadge from "./LeaveStatusBadge";

interface EmployeeLeaveClientProps {
  leaves: LeaveRequest[];
  selectedStatus?: string;
}

export default function EmployeeLeaveClient({
  leaves,
  selectedStatus = "",
}: EmployeeLeaveClientProps) {
  const router = useRouter();
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [status, setStatus] = useState(selectedStatus);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Client-Side Multi-Filtering
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      // 1. Status Filter
      if (status && leave.status !== status) {
        return false;
      }
      // 2. Leave Type Filter
      if (leaveType && leave.leave_type !== leaveType) {
        return false;
      }
      // 3. Date Range Filter
      if (startDate && leave.start_date < startDate) {
        return false;
      }
      if (endDate && leave.end_date > endDate) {
        return false;
      }
      // 4. Month Filter
      if (month !== "") {
        const leaveStart = new Date(leave.start_date);
        if (leaveStart.getMonth() !== parseInt(month, 10)) {
          return false;
        }
      }
      // 5. Year Filter
      if (year !== "") {
        const leaveStart = new Date(leave.start_date);
        if (leaveStart.getFullYear() !== parseInt(year, 10)) {
          return false;
        }
      }
      return true;
    });
  }, [leaves, status, leaveType, startDate, endDate, month, year]);

  // Statistics (Leave Balance is absolute and current-year, pending/approved/rejected respect filters)
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Sum of approved leaves this year
    const approvedDaysThisYear = leaves
      .filter((l) => l.status === LEAVE_STATUS.APPROVED && new Date(l.start_date).getFullYear() === currentYear)
      .reduce((sum, l) => sum + Number(l.total_days || 0), 0);

    // Leave Balance Safety: never become negative (Math.max(0, ...))
    const leaveBalance = Math.max(0, 22 - approvedDaysThisYear);

    let pending = 0;
    let approved = 0;
    let rejected = 0;

    filteredLeaves.forEach((leave) => {
      if (leave.status === LEAVE_STATUS.PENDING) pending++;
      else if (leave.status === LEAVE_STATUS.APPROVED) approved++;
      else if (leave.status === LEAVE_STATUS.REJECTED) rejected++;
    });

    return { leaveBalance, pending, approved, rejected };
  }, [leaves, filteredLeaves]);

  function handleCancel(leaveRequestId: string) {
    setPendingId(leaveRequestId);
    startTransition(async () => {
      const result = await cancelLeaveAction({ leaveRequestId });
      setPendingId(null);

      if (!result.success) {
        toast.error(result.error ?? "Unable to cancel leave request.");
        return;
      }

      toast.success(result.message ?? "Leave request cancelled.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Leave Balance (Yearly)"
          value={`${stats.leaveBalance} Days`}
          icon={<CalendarDays className="h-5 w-5" />}
          theme="emerald"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pending}
          icon={<CalendarClock className="h-5 w-5" />}
          theme="amber"
        />
        <StatCard
          label="Approved Requests"
          value={stats.approved}
          icon={<CalendarCheck className="h-5 w-5" />}
          theme="blue"
        />
        <StatCard
          label="Rejected Requests"
          value={stats.rejected}
          icon={<Calendar className="h-5 w-5" />}
          theme="rose"
        />
      </div>

      {/* 2. Filter Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-600" />
            Filter My Leaves
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {(status || leaveType || startDate || endDate || month || year) && (
              <button
                onClick={() => {
                  setStatus("");
                  setLeaveType("");
                  setStartDate("");
                  setEndDate("");
                  setMonth("");
                  setYear("");
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-bold"
              >
                <RefreshCw className="h-3 w-3" />
                Reset Filters
              </button>
            )}
            <Button
              type="button"
              onClick={() => setApplyOpen(true)}
              size="sm"
              className="w-full md:w-auto"
            >
              Apply Leave
            </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Status filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            >
              <option value="">All Statuses</option>
              {Object.values(LEAVE_STATUS).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Leave Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            >
              <option value="">All Types</option>
              {Object.values(LEAVE_TYPE).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            />
          </div>

          {/* Month */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            >
              <option value="">All Months</option>
              <option value="0">January</option>
              <option value="1">February</option>
              <option value="2">March</option>
              <option value="3">April</option>
              <option value="4">May</option>
              <option value="5">June</option>
              <option value="6">July</option>
              <option value="7">August</option>
              <option value="8">September</option>
              <option value="9">October</option>
              <option value="10">November</option>
              <option value="11">December</option>
            </select>
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Leave Request Table */}
      {filteredLeaves.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <Calendar className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-4 text-base font-bold text-slate-900">No Leave Requests Found</h2>
          <p className="mt-1 text-xs text-slate-500">
            You don&apos;t have any leave requests matching the selected filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Leave Type</TableHeader>
                <TableHeader>Start Date</TableHeader>
                <TableHeader>End Date</TableHeader>
                <TableHeader>Total Days</TableHeader>
                <TableHeader>Applied Date</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium text-slate-900">{leave.leave_type}</TableCell>
                  <TableCell className="text-slate-600">{formatDate(leave.start_date)}</TableCell>
                  <TableCell className="text-slate-600">{formatDate(leave.end_date)}</TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {leave.total_days} {leave.total_days === 1 ? "day" : "days"}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(leave.created_at)}
                  </TableCell>
                  <TableCell>
                    <LeaveStatusBadge status={leave.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedLeave(leave)}
                      >
                        View
                      </Button>
                      {leave.status === LEAVE_STATUS.PENDING && (
                        <LoadingButton
                          type="button"
                          variant="danger"
                          size="sm"
                          loading={isPending && pendingId === leave.id}
                          onClick={() => handleCancel(leave.id)}
                        >
                          Cancel
                        </LoadingButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 4. Modals */}
      <Modal
        open={applyOpen}
        title="Apply Leave"
        onClose={() => setApplyOpen(false)}
      >
        <LeaveRequestForm
          onSuccess={() => setApplyOpen(false)}
          onCancel={() => setApplyOpen(false)}
        />
      </Modal>

      <LeaveDetailsModal
        leave={selectedLeave}
        open={selectedLeave !== null}
        onClose={() => setSelectedLeave(null)}
      />
    </div>
  );
}

// Stats Card Component
function StatCard({
  label,
  value,
  icon,
  theme,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  theme: "emerald" | "amber" | "blue" | "rose";
}) {
  const themeStyles = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100/60",
    amber: "bg-amber-50 text-amber-700 ring-amber-100/60",
    blue: "bg-blue-50 text-blue-700 ring-blue-100/60",
    rose: "bg-rose-50 text-rose-700 ring-rose-100/60",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${themeStyles[theme]}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
      </div>
    </div>
  );
}
