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
  Search, 
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
import { Employee } from "@/features/employee/employee.types";
import { DEPARTMENTS } from "@/features/employee/employee.constants";

import { reviewLeaveAction } from "../leave.actions";
import {
  LEAVE_STATUS,
  LEAVE_TYPE,
  LeaveRequestWithEmployee,
} from "../leave.types";
import { formatDate } from "../leave.utils";
import LeaveDetailsModal from "./LeaveDetailsModal";
import LeaveStatusBadge from "./LeaveStatusBadge";

interface AdminLeaveClientProps {
  leaves: LeaveRequestWithEmployee[];
  employees: Employee[];
  selectedProfileId?: string;
  selectedStatus?: string;
}

export default function AdminLeaveClient({
  leaves,
  employees,
  selectedProfileId = "",
  selectedStatus = "",
}: AdminLeaveClientProps) {
  const router = useRouter();
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestWithEmployee | null>(null);
  const [reviewLeave, setReviewLeave] = useState<LeaveRequestWithEmployee | null>(null);
  const [reviewStatus, setReviewStatus] = useState<typeof LEAVE_STATUS.APPROVED | typeof LEAVE_STATUS.REJECTED>(LEAVE_STATUS.APPROVED);
  const [reviewComment, setReviewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [search, setSearch] = useState("");
  const [profileId, setProfileId] = useState(selectedProfileId);
  const [status, setStatus] = useState(selectedStatus);
  const [department, setDepartment] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [summaryEmployeeId, setSummaryEmployeeId] = useState("");
  const [summaryMonth, setSummaryMonth] = useState(
    new Date().getMonth().toString()
  );

  // Client-Side Multi-Filtering
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const emp = leave.employee;

      // 1. Search filter (Name or Employee ID)
      if (search) {
        const keyword = search.toLowerCase();
        const empName = emp?.full_name?.toLowerCase() ?? "";
        const empId = emp?.employee_id?.toLowerCase() ?? "";
        if (!empName.includes(keyword) && !empId.includes(keyword)) {
          return false;
        }
      }

      // 2. Employee dropdown filter
      if (profileId && leave.profile_id !== profileId) {
        return false;
      }

      // 3. Status filter
      if (status && leave.status !== status) {
        return false;
      }

      // 4. Department filter
      if (department && emp?.department !== department) {
        return false;
      }

      // 5. Leave Type filter
      if (leaveType && leave.leave_type !== leaveType) {
        return false;
      }

      // 6. Selected Date filter
      if (selectedDate) {
        if (leave.start_date > selectedDate || leave.end_date < selectedDate) {
          return false;
        }
      }

      return true;
    });
  }, [leaves, search, profileId, status, department, leaveType, selectedDate]);

  // Statistics calculated dynamically from the filtered dataset
  const stats = useMemo(() => {
    const total = filteredLeaves.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let thisMonth = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    filteredLeaves.forEach((leave) => {
      if (leave.status === LEAVE_STATUS.PENDING) pending++;
      else if (leave.status === LEAVE_STATUS.APPROVED) approved++;
      else if (leave.status === LEAVE_STATUS.REJECTED) rejected++;

      const leaveStart = new Date(leave.start_date);
      if (
        leaveStart.getFullYear() === currentYear &&
        leaveStart.getMonth() === currentMonth
      ) {
        thisMonth++;
      }
    });

    return { total, pending, approved, rejected, thisMonth };
  }, [filteredLeaves]);

  // Employee Monthly Leave Summary
  const employeeSummary = useMemo(() => {
    let total = 0;
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let totalDays = 0;

    if (!summaryEmployeeId || !summaryMonth) {
      return { total, approved, pending, rejected, totalDays };
    }

    leaves.forEach((leave) => {
      if (leave.profile_id !== summaryEmployeeId) return;

      const leaveStart = new Date(leave.start_date);
      if (leaveStart.getMonth() === parseInt(summaryMonth, 10)) {
        total++;
        totalDays += leave.total_days;
        if (leave.status === LEAVE_STATUS.PENDING) pending++;
        else if (leave.status === LEAVE_STATUS.APPROVED) approved++;
        else if (leave.status === LEAVE_STATUS.REJECTED) rejected++;
      }
    });

    return { total, approved, pending, rejected, totalDays };
  }, [leaves, summaryEmployeeId, summaryMonth]);

  function openReview(
    leave: LeaveRequestWithEmployee,
    status: typeof LEAVE_STATUS.APPROVED | typeof LEAVE_STATUS.REJECTED
  ) {
    setReviewLeave(leave);
    setReviewStatus(status);
    setReviewComment("");
  }

  function handleReview() {
    if (!reviewLeave) {
      return;
    }

    startTransition(async () => {
      const result = await reviewLeaveAction({
        leaveRequestId: reviewLeave.id,
        status: reviewStatus,
        review_comment: reviewComment,
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to review leave request.");
        return;
      }

      toast.success(result.message ?? "Leave request reviewed.");
      setReviewLeave(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={<CalendarDays className="h-5 w-5" />}
          theme="blue"
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
          theme="emerald"
        />
        <StatCard
          label="Rejected Requests"
          value={stats.rejected}
          icon={<Calendar className="h-5 w-5" />}
          theme="rose"
        />
      </div>

      {/* 1.5 Employee Monthly Leave Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="mb-4 text-sm font-bold text-slate-800 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-indigo-600" />
          Employee Monthly Leave Summary
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Employee</label>
            <select
              value={summaryEmployeeId}
              onChange={(e) => setSummaryEmployeeId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            >
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Month</label>
            <select
              value={summaryMonth}
              onChange={(e) => setSummaryMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            >
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
        </div>
        {summaryEmployeeId ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Leaves</p>
              <p className="mt-1 text-xl font-black text-slate-900">{employeeSummary.total}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved</p>
              <p className="mt-1 text-xl font-black text-emerald-600">{employeeSummary.approved}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</p>
              <p className="mt-1 text-xl font-black text-amber-500">{employeeSummary.pending}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rejected</p>
              <p className="mt-1 text-xl font-black text-rose-500">{employeeSummary.rejected}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Days Used</p>
              <p className="mt-1 text-xl font-black text-indigo-600">{employeeSummary.totalDays}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs font-medium text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
            Select an employee to view their summary.
          </div>
        )}
      </div>

      {/* 2. Filter Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-600" />
            Filter Leave Requests
          </h3>
          {(search || profileId || status || department || leaveType || selectedDate) && (
            <button
              onClick={() => {
                setSearch("");
                setProfileId("");
                setStatus("");
                setDepartment("");
                setLeaveType("");
                setSelectedDate("");
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-bold"
            >
              <RefreshCw className="h-3 w-3" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Search Employee</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Employee dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Employee Profile</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
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

          {/* Status */}
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

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* 3. Leave Table */}
      {filteredLeaves.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <Calendar className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-4 text-base font-bold text-slate-900">No Leave Requests Found</h2>
          <p className="mt-1 text-xs text-slate-500">
            There are no leave requests matching your selected filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Employee ID</TableHeader>
                <TableHeader>Employee Name</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Leave Type</TableHeader>
                <TableHeader>Leave Period</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeaves.map((leave) => (
                <TableRow key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-slate-600">
                    {leave.employee?.employee_id ?? leave.profile_id}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {leave.employee?.full_name ?? "Unknown Employee"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {leave.employee?.department ?? "-"}
                  </TableCell>
                  <TableCell className="text-slate-700 font-medium">
                    {leave.leave_type}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">
                        {formatDate(leave.start_date)} &rarr; {formatDate(leave.end_date)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {leave.total_days} {leave.total_days === 1 ? "Day" : "Days"} &bull; {leave.leave_duration}
                      </span>
                    </div>
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
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              openReview(leave, LEAVE_STATUS.APPROVED)
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              openReview(leave, LEAVE_STATUS.REJECTED)
                            }
                          >
                            Reject
                          </Button>
                        </>
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
      <LeaveDetailsModal
        leave={selectedLeave}
        open={selectedLeave !== null}
        onClose={() => setSelectedLeave(null)}
        showEmployee
      />

      <Modal
        open={reviewLeave !== null}
        title={`${reviewStatus} Leave Request`}
        onClose={() => setReviewLeave(null)}
      >
        <div className="space-y-5">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              {reviewLeave?.employee?.full_name ?? "Employee"}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {reviewLeave?.leave_type} &bull;{" "}
              {reviewLeave ? formatDate(reviewLeave.start_date) : ""} -{" "}
              {reviewLeave ? formatDate(reviewLeave.end_date) : ""}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Review Comment</label>
            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none text-sm"
              placeholder="Add a review comment"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReviewLeave(null)}
            >
              Cancel
            </Button>
            <LoadingButton
              type="button"
              variant={
                reviewStatus === LEAVE_STATUS.REJECTED
                  ? "danger"
                  : "primary"
              }
              loading={isPending}
              onClick={handleReview}
            >
              {reviewStatus}
            </LoadingButton>
          </div>
        </div>
      </Modal>
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
  value: number;
  icon: React.ReactNode;
  theme: "blue" | "amber" | "emerald" | "rose";
}) {
  const themeStyles = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100/60",
    amber: "bg-amber-50 text-amber-700 ring-amber-100/60",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100/60",
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
