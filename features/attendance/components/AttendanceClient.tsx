"use client";

import { useMemo, useState } from "react";

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
  | typeof ATTENDANCE_STATUS.ABSENT;

interface AttendanceClientProps {
  summary: AttendanceSummary;
  presentRecords: AttendanceWithEmployee[];
  incompleteRecords: AttendanceWithEmployee[];
  absentRecords: AttendanceWithEmployee[];
}

export default function AttendanceClient({
  summary,
  presentRecords,
  incompleteRecords,
  absentRecords,
}: AttendanceClientProps) {
  const [selected, setSelected] = useState<SummaryFilter>("all");
const filteredRecords = useMemo(() => {
  switch (selected) {
    case ATTENDANCE_STATUS.PRESENT:
      return presentRecords;

    case ATTENDANCE_STATUS.INCOMPLETE:
      return incompleteRecords;

    case ATTENDANCE_STATUS.ABSENT:
      return absentRecords;

    default:
      return [
        ...presentRecords,
        ...incompleteRecords,
        ...absentRecords,
      ];
  }
}, [
  selected,
  presentRecords,
  incompleteRecords,
  absentRecords,
]);

const tableHeader = {
  title:
    selected === "all"
      ? "All Employees Attendance"
      : selected === ATTENDANCE_STATUS.PRESENT
        ? "Present Employees"
        : selected === ATTENDANCE_STATUS.INCOMPLETE
          ? "Incomplete Attendance"
          : "Absent Employees",

  count:
    selected === "all"
      ? summary.total
      : selected === ATTENDANCE_STATUS.PRESENT
        ? summary.present
        : selected === ATTENDANCE_STATUS.INCOMPLETE
          ? summary.incomplete
          : summary.absent,
};

  return (
    <>
      <AdminAttendanceSummary
        summary={summary}
        selected={selected}
        onSelect={setSelected}
      />

    <section className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-semibold">
      {tableHeader.title}
    </h2>

    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
      {tableHeader.count} Records
    </span>
  </div>

  <AttendanceHistoryTable
    records={filteredRecords}
    showEmployee
  />
</section>
    </>
  );
}
