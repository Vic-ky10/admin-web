"use client";

import clsx from "clsx";
import { Users, CircleCheckBig, Clock3, UserX, Timer } from "lucide-react";

import { AttendanceSummary } from "../attendance.types";
import { formatWorkingHours } from "../attendance.utils";
import { ATTENDANCE_STATUS } from "../attendance.types";

interface AdminAttendanceSummaryProps {
  summary: AttendanceSummary;
  selected:
    | "all"
    | typeof ATTENDANCE_STATUS.PRESENT
    | typeof ATTENDANCE_STATUS.INCOMPLETE
    | typeof ATTENDANCE_STATUS.ABSENT;

  onSelect: (
    value:
      | "all"
      | typeof ATTENDANCE_STATUS.PRESENT
      | typeof ATTENDANCE_STATUS.INCOMPLETE
      | typeof ATTENDANCE_STATUS.ABSENT,
  ) => void;
}

type SummaryFilter =
  | "all"
  | typeof ATTENDANCE_STATUS.PRESENT
  | typeof ATTENDANCE_STATUS.INCOMPLETE
  | typeof ATTENDANCE_STATUS.ABSENT;

type SummaryCard = {
  label: string;
  value: string | number;
  key: SummaryFilter | "working-hours";
  icon: React.ElementType;
};

export default function AdminAttendanceSummary({
  summary,
  selected,
  onSelect,
}: AdminAttendanceSummaryProps) {
  const cards: SummaryCard[] = [
    {
      label: "Total Employees",
      value: summary.total,
      key: "all",
      icon: Users,
    },
    {
      label: "Present",
      value: summary.present,
      key: ATTENDANCE_STATUS.PRESENT,
      icon: CircleCheckBig,
    },
    {
      label: "Incomplete",
      value: summary.incomplete,
      key: ATTENDANCE_STATUS.INCOMPLETE,
      icon: Clock3,
    },
    {
      label: "Absent",
      value: summary.absent,
      key: ATTENDANCE_STATUS.ABSENT,
      icon: UserX,
    },
    {
      label: "Working Hours",
      value: formatWorkingHours(summary.totalWorkingHours),
      key: "working-hours",
      icon: Timer,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        const active = selected === card.key;

        const clickable = card.key !== "working-hours";

        return (
          <button
            key={card.label}
            type="button"
            disabled={!clickable}
            onClick={() => {
              if (card.key !== "working-hours") {
                onSelect(card.key);
              }
            }}
            className={clsx(
              "rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-200",

              clickable &&
                "cursor-pointer hover:-translate-y-1 hover:shadow-md",

              active && "border-blue-500 bg-blue-50 ring-2 ring-blue-200",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>

              <Icon
                size={20}
                className={clsx(active ? "text-blue-600" : "text-slate-400")}
              />
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {card.value}
            </p>
          </button>
        );
      })}
    </div>
  );
}
