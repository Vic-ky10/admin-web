import { Attendance } from "@/features/attendance/attendance.types";
import { Employee } from "@/features/employee/employee.types";

export interface EmployeeDashboardStats {
  todayAttendance: Attendance | null;
  pendingLeaveRequests: number;
  assignedProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
  pendingExpenses: number;
  leaveBalance: number;
  unreadNotifications: number;
}

export type EmployeeProfile = Employee;
