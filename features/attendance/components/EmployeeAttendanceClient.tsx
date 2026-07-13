"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import LoadingButton from "@/components/feedback/LoadingButton";

import {
  loginAttendanceAction,
  logoutAttendanceAction,
} from "../attendance.actions";
import { Attendance } from "../attendance.types";
import {
  formatAttendanceTime,
  formatWorkingHours,
  isAlreadyLoggedIn,
  isAlreadyLoggedOut,
} from "../attendance.utils";
import AttendanceHistoryTable from "./AttendanceHistoryTable";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

interface EmployeeAttendanceClientProps {
  todayAttendance: Attendance | null;
  history: Attendance[];
}

export default function EmployeeAttendanceClient({
  todayAttendance,
  history,
}: EmployeeAttendanceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hasLoggedIn = isAlreadyLoggedIn(todayAttendance);
  const hasLoggedOut = isAlreadyLoggedOut(todayAttendance);

  function handleLogin() {
    startTransition(async () => {
      const result = await loginAttendanceAction({});

      if (!result.success) {
        toast.error(result.error ?? "Unable to login attendance.");
        return;
      }

      toast.success(
        result.message ?? "Attendance login marked successfully."
      );
      router.refresh();
    });
  }

  function handleLogout() {
    startTransition(async () => {
      const result = await logoutAttendanceAction();

      if (!result.success) {
        toast.error(result.error ?? "Unable to logout attendance.");
        return;
      }

      toast.success(
        result.message ?? "Attendance logout marked successfully."
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Today's Status"
          value={
            todayAttendance ? (
              <AttendanceStatusBadge status={todayAttendance.status} />
            ) : (
              "Not Logged In"
            )
          }
        />
        <SummaryCard
          label="Login Time"
          value={formatAttendanceTime(
            todayAttendance?.login_time ?? null
          )}
        />
        <SummaryCard
          label="Logout Time"
          value={formatAttendanceTime(
            todayAttendance?.logout_time ?? null
          )}
        />
        <SummaryCard
          label="Working Hours"
          value={formatWorkingHours(
            todayAttendance?.working_hours ?? null
          )}
        />
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-5">
        <LoadingButton
          loading={isPending}
          disabled={hasLoggedIn}
          onClick={handleLogin}
        >
          Login Attendance
        </LoadingButton>
        <LoadingButton
          loading={isPending}
          disabled={!hasLoggedIn || hasLoggedOut}
          onClick={handleLogout}
          variant="secondary"
        >
          Logout Attendance
        </LoadingButton>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Attendance History
        </h2>
        <AttendanceHistoryTable records={history} />
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 text-xl font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}
