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
}

export default function AttendanceClient({
  summary,
  presentRecords,
  shortHoursRecords,
  halfDayRecords,
  incompleteRecords,
  absentRecords,
}: AttendanceClientProps) {
  const [selected, setSelected] = useState<SummaryFilter>("all");
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
    <>
      <AdminAttendanceSummary
        summary={summary}
        selected={selected}
        onSelect={setSelected}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{tableHeader.title}</h2>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
            {tableHeader.count} Records
          </span>
        </div>

        <AttendanceHistoryTable records={filteredRecords} showEmployee />
      </section>
    </>
  );
}
