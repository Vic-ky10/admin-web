import { AttendanceSummary } from "../attendance.types";
import { formatWorkingHours } from "../attendance.utils";

interface AdminAttendanceSummaryProps {
  summary: AttendanceSummary;
}

export default function AdminAttendanceSummary({
  summary,
}: AdminAttendanceSummaryProps) {
  const cards = [
    ["Total Records", String(summary.total)],
    ["Present", String(summary.present)],
    ["Incomplete", String(summary.incomplete)],
    ["Absent", String(summary.absent)],
    [
      "Total Working Hours",
      formatWorkingHours(summary.totalWorkingHours),
    ],
  ];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {cards.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
