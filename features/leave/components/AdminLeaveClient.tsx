"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { 
  Calendar, 
  CalendarCheck, 
  CalendarClock, 
  CalendarDays, 
  Filter, 
  Search, 
  RefreshCw,
  ChevronDown,
  ChevronUp
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

import { getMonthlyEmployeeReportAction } from "@/features/attendance/attendance.actions";
import { MonthlyEmployeeReport } from "@/features/attendance/attendance.types";
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

  // Report Filters State
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth().toString());
  const [reportDepartment, setReportDepartment] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [isReportVisible, setIsReportVisible] = useState(false);

  const [reportData, setReportData] = useState<MonthlyEmployeeReport[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(false);

  useEffect(() => {
    async function loadReport() {
      setIsReportLoading(true);
      const res = await getMonthlyEmployeeReportAction(parseInt(reportYear), parseInt(reportMonth));
      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        toast.error(res.error || "Failed to load report");
      }
      setIsReportLoading(false);
    }
    loadReport();
  }, [reportYear, reportMonth]);

  const filteredReportData = useMemo(() => {
    return reportData.filter((row) => {
      if (reportDepartment && row.department !== reportDepartment) {
        return false;
      }
      if (reportSearch) {
        const keyword = reportSearch.toLowerCase();
        if (!row.employeeName.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      return true;
    });
  }, [reportData, reportDepartment, reportSearch]);

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
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer" onClick={() => setIsReportVisible(!isReportVisible)}>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            Employee-wise Monthly Report
          </h3>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            {isReportVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
        
        {isReportVisible && (
          <>
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Year</label>
              <select
                value={reportYear}
                onChange={(e) => setReportYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-all shadow-2xs text-slate-700"
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = new Date().getFullYear() - 2 + i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Month</label>
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-all shadow-2xs text-slate-700"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Department</label>
              <select
                value={reportDepartment}
                onChange={(e) => setReportDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-all shadow-2xs text-slate-700"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Search Employee</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Name..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isReportLoading ? (
            <div className="p-12 text-center text-sm text-slate-500 animate-pulse">Loading report data...</div>
          ) : filteredReportData.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">No data found for the selected filters.</div>
          ) : (
            <Table>
              <TableHead className="bg-slate-50">
                <TableRow>
                  <TableHeader className="py-3 px-4 font-bold text-slate-700">Employee</TableHeader>
                  <TableHeader className="py-3 px-4 font-bold text-slate-700">Department</TableHeader>
                  <TableHeader className="py-3 px-4 font-bold text-slate-700 text-center">Leave</TableHeader>
                  <TableHeader className="py-3 px-4 font-bold text-slate-700 text-center">Half Day</TableHeader>
                  <TableHeader className="py-3 px-4 font-bold text-slate-700 text-center">Short Hours</TableHeader>
                  <TableHeader className="py-3 px-4 font-bold text-slate-700 text-center">Present</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReportData.map((row) => (
                  <TableRow key={row.profileId} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-3 px-4 font-medium text-slate-900">{row.employeeName}</TableCell>
                    <TableCell className="py-3 px-4 text-slate-600">{row.department}</TableCell>
                    <TableCell className="py-3 px-4 text-center font-semibold text-rose-600">{row.leave}</TableCell>
                    <TableCell className="py-3 px-4 text-center font-semibold text-amber-500">{row.halfDay}</TableCell>
                    <TableCell className="py-3 px-4 text-center font-semibold text-orange-500">{row.shortHours}</TableCell>
                    <TableCell className="py-3 px-4 text-center font-semibold text-emerald-600">{row.present}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
          </>
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
                  <TableCell className="font-medium text-slate-900">
                    {leave.employee?.full_name ?? "Unknown Employee"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {leave.employee?.department ?? "-"}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {leave.leave_type}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-800">
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
