export const EMPLOYEE_STATUS = {
  ACTIVE: "Active",
  PENDING: "Pending",
  INACTIVE: "Inactive",
} as const;

export const EMPLOYEE_ROLE = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  HR: "HR",
  ADMIN: "Admin",
} as const;

export const DEPARTMENTS = [
  "IT",
  "HR",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
] as const;

export const EMPLOYEE_ID_PREFIX = "EMP";

export const EMPLOYEE_ID_PADDING = 3;
