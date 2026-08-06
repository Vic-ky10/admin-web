"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import AdminAttendanceSummary from "./AdminAttendanceSummary";
import AttendanceHistoryTable from "./AttendanceHistoryTable";

import {
  AttendanceSummary,
  AttendanceWithEmployee,
  ATTENDANCE_STATUS,
} from "../attendance.types";

type SummaryFilter =
  | "all"
  | typeof ATTENDANCE_STATUS.PRESENT
  | typeof ATTENDANCE_STATUS.INCOMPLETE
  | typeof ATTENDANCE_STATUS.ABSENT
  | typeof ATTENDANCE_STATUS.SHORT_HOURS
  | typeof ATTENDANCE_STATUS.HALF_DAY;

interface AttendanceClientProps {
  summary: AttendanceSummary;
  presentRecords: AttendanceWithEmployee[];
  shortHoursRecords: AttendanceWithEmployee[];
  incompleteRecords: AttendanceWithEmployee[];
  absentRecords: AttendanceWithEmployee[];
  halfDayRecords: AttendanceWithEmployee[];
  initialStatus?: SummaryFilter;
}

export default function AttendanceClient({
  summary,
  presentRecords,
  shortHoursRecords,
  halfDayRecords,
  incompleteRecords,
  absentRecords,
  initialStatus = "all",
}: AttendanceClientProps) {
  const [selected, setSelected] = useState<SummaryFilter>(initialStatus);
  const filteredRecords = useMemo(() => {
    switch (selected) {
      case ATTENDANCE_STATUS.PRESENT:
        return presentRecords;

      case ATTENDANCE_STATUS.SHORT_HOURS:
        return shortHoursRecords;

      case ATTENDANCE_STATUS.INCOMPLETE:
        return incompleteRecords;

      case ATTENDANCE_STATUS.HALF_DAY:
        return halfDayRecords;

      case ATTENDANCE_STATUS.ABSENT:
        return absentRecords;

      default:
        return [
          ...presentRecords,
          ...shortHoursRecords,
          ...halfDayRecords,
          ...incompleteRecords,
          ...absentRecords,
        ];
    }
  }, [
    selected,
    presentRecords,
    shortHoursRecords,
    incompleteRecords,
    absentRecords,
    halfDayRecords,
  ]);

  const tableHeader = {
    title:
      selected === "all"
        ? "All Employees Attendance"
        : selected === ATTENDANCE_STATUS.PRESENT
          ? "Present Employees"
          : selected === ATTENDANCE_STATUS.SHORT_HOURS
            ? "Short Hours Employees"
            : selected === ATTENDANCE_STATUS.INCOMPLETE
              ? "Incomplete Attendance"
              : selected === ATTENDANCE_STATUS.HALF_DAY
                ? "Half Day Attendance"
                : "Absent Employees",

    count:
      selected === "all"
        ? summary.total
        : selected === ATTENDANCE_STATUS.PRESENT
          ? summary.present
          : selected === ATTENDANCE_STATUS.SHORT_HOURS
            ? summary.shortHours
            : selected === ATTENDANCE_STATUS.HALF_DAY
              ? summary.halfDay
              : selected === ATTENDANCE_STATUS.INCOMPLETE
                ? summary.incomplete
                : summary.absent,
  };

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Attendance Tracker"
        description="Monitor daily attendance status, clock-in times, and work durations."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Attendance" }]}
      />

      <AdminAttendanceSummary
        summary={summary}
        selected={selected}
        onSelect={setSelected}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{tableHeader.title}</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            Total: {tableHeader.count}
          </span>
        </div>

        <AttendanceHistoryTable records={filteredRecords} showEmployee={true} />
      </div>
    </div>
  );
}
