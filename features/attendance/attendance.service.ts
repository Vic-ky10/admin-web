import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ActionResponse } from "@/types/action";

import {
  ATTENDANCE_STATUS,
  Attendance,
  AttendanceDashboard,
  AttendanceFilters,
  AttendanceStatus,
  AttendanceSummary,
  AttendanceWithEmployee,
  MonthlyEmployeeReport,
} from "./attendance.types";
import {
  calculateWorkingHours,
  getTodayDate,
  isAlreadyLoggedIn,
  isAlreadyLoggedOut,
} from "./attendance.utils";
import { Employee } from "../employee/employee.types";

const ATTENDANCE_SELECT =
  "id, profile_id, attendance_date, login_time, logout_time, working_hours, status, notes, created_at, updated_at";

const ATTENDANCE_WITH_EMPLOYEE_SELECT =
  "id, profile_id, attendance_date, login_time, logout_time, working_hours, status, notes, created_at, updated_at, employee:profiles!attendance_profile_id_fkey(employee_id, full_name, email, department, designation)";

export async function getCurrentProfileId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return user.id;
}

export async function loginAttendance(
  profileId: string,
  notes?: string,
): Promise<ActionResponse<Attendance>> {
  const todayAttendance = await getTodayAttendance(profileId);

  if (isAlreadyLoggedIn(todayAttendance)) {
    return {
      success: false,
      error: "Attendance login already exists for today.",
    };
  }

  const { data, error } = await adminClient
    .from("attendance")
    .insert({
      profile_id: profileId,
      attendance_date: getTodayDate(),
      login_time: new Date().toISOString(),
      status: ATTENDANCE_STATUS.PRESENT,
      notes: notes || null,
    })
    .select(ATTENDANCE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Attendance login marked successfully.",
    data: data as Attendance,
  };
}

export async function logoutAttendance(
  profileId: string,
): Promise<ActionResponse<Attendance>> {
  const todayAttendance = await getTodayAttendance(profileId);

  if (!isAlreadyLoggedIn(todayAttendance)) {
    return {
      success: false,
      error: "Please login attendance before logout.",
    };
  }

  if (!todayAttendance?.login_time) {
    return {
      success: false,
      error: "Please login attendance before logout.",
    };
  }

  if (isAlreadyLoggedOut(todayAttendance)) {
    return {
      success: false,
      error: "Attendance logout already exists for today.",
    };
  }

  const logoutTime = new Date().toISOString();
  const workingHours = calculateWorkingHours(
    todayAttendance.login_time,
    logoutTime,
  );
let status: AttendanceStatus;

if (workingHours >= 9) {
  status = ATTENDANCE_STATUS.PRESENT;
} else if (workingHours >= 6) {
  status = ATTENDANCE_STATUS.SHORT_HOURS;
} else {
  status = ATTENDANCE_STATUS.HALF_DAY;
}



  const { data, error } = await adminClient
    .from("attendance")
    .update({
      logout_time: logoutTime,
      working_hours: workingHours,
      status,
    })
    .eq("id", todayAttendance.id)
    .select(ATTENDANCE_SELECT)
    .single();
  

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Attendance logout marked successfully.",
    data: data as Attendance,
  };
}

export async function getTodayAttendance(
  profileId: string,
): Promise<Attendance | null> {
  const { data, error } = await adminClient
    .from("attendance")
    .select(ATTENDANCE_SELECT)
    .eq("profile_id", profileId)
    .eq("attendance_date", getTodayDate())
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Attendance | null;
}

export async function getAttendanceHistory(
  profileId: string,
  limit = 30,
): Promise<Attendance[]> {
  const { data, error } = await adminClient
    .from("attendance")
    .select(ATTENDANCE_SELECT)
    .eq("profile_id", profileId)
    .order("attendance_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return data as Attendance[];
}

export async function getAttendanceByEmployee(
  profileId: string,
): Promise<Attendance[]> {
  return getAttendanceHistory(profileId, 100);
}

export async function getAttendanceRecords(
  filters: AttendanceFilters = {},
): Promise<AttendanceWithEmployee[]> {
  let query = adminClient
    .from("attendance")
    .select(ATTENDANCE_WITH_EMPLOYEE_SELECT)
    .order("attendance_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.profileId) {
    query = query.eq("profile_id", filters.profileId);
  }

  if (filters.date) {
    query = query.eq("attendance_date", filters.date);
  }

  query = query.eq("attendance_date", filters.date ?? getTodayDate());

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  const records = (data as unknown as SupabaseAttendanceRecord[]).map(
    (record) => ({
      ...record,
      employee: Array.isArray(record.employee)
        ? (record.employee[0] ?? null)
        : record.employee,
    }),
  );
  const search = filters.search?.toLowerCase();

  if (!search) {
    return records;
  }

  return records.filter((record) => {
    const employee = record.employee;

    return (
      record.profile_id.toLowerCase().includes(search) ||
      employee?.employee_id.toLowerCase().includes(search) ||
      employee?.full_name.toLowerCase().includes(search) ||
      employee?.email.toLowerCase().includes(search)
    );
  });
}

type SupabaseAttendanceRecord = AttendanceWithEmployee & {
  employee:
    | AttendanceWithEmployee["employee"]
    | NonNullable<AttendanceWithEmployee["employee"]>[];
};

export async function getAttendanceSummary(
  filters: AttendanceFilters = {},
): Promise<AttendanceSummary> {
  // Get all employees
  const { data: employees, error: employeeError } = await adminClient
    .from("profiles")
    .select("id");

  if (employeeError) {
    console.error(employeeError);

   return {
  total: 0,
  present: 0,
  shortHours: 0,
  halfDay: 0,
  incomplete: 0,
  absent: 0,
  totalWorkingHours: 0,
};
  }

  // Always calculate summary for today's attendance
  const records = await getAttendanceRecords({
    ...filters,
    date: filters.date ?? getTodayDate(),
  });

  const attendanceMap = new Map(
    records.map((record) => [record.profile_id, record]),
  );

 const summary: AttendanceSummary = {
  total: employees.length,
  present: 0,
  shortHours: 0,
  halfDay: 0,
  incomplete: 0,
  absent: 0,
  totalWorkingHours: 0,
};

  for (const employee of employees) {
    const attendance = attendanceMap.get(employee.id);

    // No attendance record today
    if (!attendance) {
      summary.absent++;
      continue;
    }

    // Logged in but not logged out
    if (attendance.login_time && !attendance.logout_time) {
      summary.incomplete++;
      continue;
    }

 // Logged in and logged out
if (attendance.status === ATTENDANCE_STATUS.HALF_DAY) {
  summary.halfDay++;
} else if (attendance.status === ATTENDANCE_STATUS.SHORT_HOURS) {
  summary.shortHours++;
} else {
  summary.present++;
}

summary.totalWorkingHours += attendance.working_hours ?? 0;
  }
  return summary;
}

export async function getTodayAttendanceDashboard(
  filters: AttendanceFilters = {}
): Promise<AttendanceDashboard> {
  // Get all employees
  const { data: employees, error: employeeError } = await adminClient
    .from("profiles")
    .select("*");

  if (employeeError) {
    console.error(employeeError);

    return {
      summary: {
        total: 0,
        present: 0,
        shortHours: 0,
        halfDay: 0,
        incomplete: 0,
        absent: 0,
        totalWorkingHours: 0,
      },
      present: [],
      shortHours: [],
      halfDay: [],
      incomplete: [],
      absent: [],
    };
  }

  const targetDate = filters.date ?? getTodayDate();

  // Get attendance for the target date
  const attendanceRecords = await getAttendanceRecords({
    date: targetDate,
  });

  const attendanceMap = new Map(
    attendanceRecords.map((record) => [record.profile_id, record]),
  );

  // Filter employees in memory based on filters
  let filteredEmployees = employees as Employee[];
  if (filters.profileId) {
    filteredEmployees = filteredEmployees.filter(emp => emp.id === filters.profileId);
  }
  if (filters.department) {
    filteredEmployees = filteredEmployees.filter(emp => emp.department === filters.department);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.full_name.toLowerCase().includes(s) ||
      emp.employee_id.toLowerCase().includes(s) ||
      emp.email.toLowerCase().includes(s)
    );
  }

  const present: AttendanceWithEmployee[] = [];
  const shortHours: AttendanceWithEmployee[] = [];
  const halfDay: AttendanceWithEmployee[] = [];
  const incomplete: AttendanceWithEmployee[] = [];
  const absent: AttendanceWithEmployee[] = [];

  let totalWorkingHours = 0;

  for (const employee of filteredEmployees) {
    const attendance = attendanceMap.get(employee.id);

    // No attendance => Absent
    if (!attendance) {
      if (filters.status && filters.status !== ATTENDANCE_STATUS.ABSENT) {
        continue;
      }

      const absentRecord: AttendanceWithEmployee = {
        id: `absent-${employee.id}`,
        profile_id: employee.id,
        attendance_date: targetDate,
        login_time: null,
        logout_time: null,
        working_hours: 0,
        status: ATTENDANCE_STATUS.ABSENT,
        notes: null,
        created_at: "",
        updated_at: "",
        employee: {
          employee_id: employee.employee_id,
          full_name: employee.full_name,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
        },
      };

      absent.push(absentRecord);
      continue;
    }

    // Logged in only => Incomplete
    if (attendance.login_time && !attendance.logout_time) {
      if (filters.status && filters.status !== ATTENDANCE_STATUS.INCOMPLETE) {
        continue;
      }
      incomplete.push(attendance);
      continue;
    }

    // Logged in + Logged out => Present / Short Hours / Half Day
    if (filters.status && attendance.status !== filters.status) {
      continue;
    }

    if (attendance.status === ATTENDANCE_STATUS.HALF_DAY) {
      halfDay.push(attendance);
    } else if (attendance.status === ATTENDANCE_STATUS.SHORT_HOURS) {
      shortHours.push(attendance);
    } else {
      present.push(attendance);
    }

    totalWorkingHours += attendance.working_hours ?? 0;
  }

  return {
    summary: {
      total: present.length + shortHours.length + halfDay.length + incomplete.length + absent.length,
      present: present.length,
      shortHours: shortHours.length,
      halfDay: halfDay.length,
      incomplete: incomplete.length,
      absent: absent.length,
      totalWorkingHours,
    },
    present,
    shortHours,
    halfDay,
    incomplete,
    absent,
  };
}

export async function getMonthlyEmployeeReport(
  year: number,
  month: number
): Promise<MonthlyEmployeeReport[]> {
  const startDate = new Date(year, month, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

  // Fetch active employees
  const { data: employees, error: employeeError } = await adminClient
    .from("profiles")
    .select("id, employee_id, full_name, department");

  if (employeeError) {
    console.error(employeeError);
    return [];
  }

  // Fetch attendance records for the given month
  const { data: attendanceRecords, error: attendanceError } = await adminClient
    .from("attendance")
    .select("profile_id, status")
    .gte("attendance_date", startDate)
    .lte("attendance_date", endDate);

  if (attendanceError) {
    console.error(attendanceError);
    return [];
  }

  // Fetch approved leave requests overlapping with the given month
  const { data: leaveRecords, error: leaveError } = await adminClient
    .from("leave_requests")
    .select("profile_id, start_date, end_date, total_days, leave_duration")
    .eq("status", "Approved")
    .lte("start_date", endDate)
    .gte("end_date", startDate);

  if (leaveError) {
    console.error(leaveError);
    return [];
  }

  // Process attendance and leaves per employee
  const reportMap = new Map<string, MonthlyEmployeeReport>();

  for (const emp of (employees || [])) {
    reportMap.set(emp.id, {
      profileId: emp.id,
      employeeName: emp.full_name || emp.employee_id,
      department: emp.department || "-",
      leave: 0,
      halfDay: 0,
      shortHours: 0,
      present: 0,
    });
  }

  // Count attendance
  for (const record of (attendanceRecords || [])) {
    const rep = reportMap.get(record.profile_id);
    if (!rep) continue;

    if (record.status === ATTENDANCE_STATUS.PRESENT) {
      rep.present++;
    } else if (record.status === ATTENDANCE_STATUS.SHORT_HOURS) {
      rep.shortHours++;
    } else if (record.status === ATTENDANCE_STATUS.HALF_DAY) {
      rep.halfDay++;
    }
  }

  // Count leaves
  for (const leave of (leaveRecords || [])) {
    const rep = reportMap.get(leave.profile_id);
    if (!rep) continue;

    // Calculate overlap days in the current month
    const start = leave.start_date < startDate ? startDate : leave.start_date;
    const end = leave.end_date > endDate ? endDate : leave.end_date;

    const startDateObj = new Date(`${start}T00:00:00`);
    const endDateObj = new Date(`${end}T00:00:00`);
    const diff = endDateObj.getTime() - startDateObj.getTime();
    
    let overlapDays = Math.floor(diff / 86_400_000) + 1;

    if (leave.leave_duration === "Half Day") {
      overlapDays = 0.5;
    }

    if (overlapDays > 0) {
      rep.leave += overlapDays;
    }
  }

  return Array.from(reportMap.values());
}
