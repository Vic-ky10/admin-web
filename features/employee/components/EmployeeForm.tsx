"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import {
  createEmployee,
  updateEmployee,
} from "../employee.actions";
import {
  DEPARTMENTS,
  EMPLOYEE_ROLE,
} from "../employee.constants";
import {
  EmployeeFormData,
  employeeSchema,
} from "../employee.validation";
import { Employee, EmployeeCredentials } from "../employee.types";

interface EmployeeFormProps {
  employee?: Employee;
  mode?: "create" | "edit";
  onCancel: () => void;
  onSuccess: () => void;
  onCreated?: (credentials: EmployeeCredentials) => void;
}

const defaultValues: EmployeeFormData = {
  full_name: "",
  email: "",
  phone: "",
  department: DEPARTMENTS[0],
  designation: "",
  role: EMPLOYEE_ROLE.EMPLOYEE,
  joined_date: new Date().toISOString().slice(0, 10),
  date_of_birth: "",
  current_address: "",
  qualification: "",
  degree: "",
  experience_years: undefined,
  emergency_contact: "",
};

export default function EmployeeForm({
  employee,
  mode = "create",
  onCancel,
  onSuccess,
  onCreated,
}: EmployeeFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const formValues = useMemo(
    () => (employee ? toFormValues(employee) : defaultValues),
    [employee]
  );

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<EmployeeFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: formValues,
  });

  useEffect(() => {
    reset(formValues);
  }, [formValues, reset]);

  const onSubmit = handleSubmit(async (v) => {
    const values = v as unknown as EmployeeFormData;
    const result =
      isEdit && employee
        ? await updateEmployee(employee.id, values)
        : await createEmployee(values);

    if (!result.success) {
      toast.error(
        result.error ??
          (isEdit
            ? "Unable to update employee."
            : "Unable to create employee.")
      );
      return;
    }

    const successMessage =
      result.message ??
        (isEdit
          ? "Employee updated successfully."
          : "Employee created successfully.");

    if (!isEdit && "data" in result && result.data && "credentials" in result.data) {
      if (onCreated) {
        onCreated(result.data.credentials as EmployeeCredentials);
      }
    } else {
      toast.success(successMessage);
      onSuccess();
    }

    reset(defaultValues);
    router.refresh();
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      {/* EMPLOYMENT */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800 border-b pb-2">Employment Details</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {isEdit && employee && (
            <Input label="Employee ID" value={employee.employee_id} readOnly className="bg-slate-100 text-slate-600" />
          )}
          <Input label="Email" type="email" autoComplete="email" placeholder="Enter email" readOnly={isEdit} className={isEdit ? "bg-slate-100 text-slate-600" : undefined} error={errors.email?.message} {...register("email")} />
          <div className="space-y-1">
            <label className="text-sm font-medium">Department</label>
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none" {...register("department")}>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
            {errors.department?.message && <p className="text-sm text-red-500">{errors.department.message}</p>}
          </div>
          <Input label="Designation" placeholder="Enter Designation" error={errors.designation?.message} {...register("designation")} />
          <div className="space-y-1">
            <label className="text-sm font-medium">Role</label>
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none" {...register("role")}>
              {Object.values(EMPLOYEE_ROLE).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.role?.message && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Joined Date</label>
            <input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none text-sm" {...register("joined_date")} />
            {errors.joined_date?.message && <p className="text-sm text-red-500">{errors.joined_date.message}</p>}
          </div>
          <Input label="Experience (Years)" type="number" min="0" step="0.5" placeholder="e.g. 2.5" error={errors.experience_years?.message} {...register("experience_years")} />
        </div>
      </div>

      {/* PERSONAL INFO & ADDRESS */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800 border-b pb-2">Personal Information</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input label="Full Name" autoComplete="name" placeholder="Enter Name" error={errors.full_name?.message} {...register("full_name")} />
          <div className="space-y-1">
            <label className="text-sm font-medium">Date of Birth</label>
            <input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none text-sm" {...register("date_of_birth")} />
            {errors.date_of_birth?.message && <p className="text-sm text-red-500">{errors.date_of_birth.message}</p>}
          </div>
          <Input label="Phone" inputMode="numeric" maxLength={10} placeholder="Enter Phone no" error={errors.phone?.message} {...register("phone")} />
        </div>

        <h3 className="mb-4 mt-6 text-sm font-semibold text-slate-800 border-b pb-2">Address</h3>
        <Input label="Current Address" placeholder="Enter full address" error={errors.current_address?.message} {...register("current_address")} />
      </div>

      {/* EDUCATION */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800 border-b pb-2">Education</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input label="Qualification" placeholder="e.g. B.Tech, MBA" error={errors.qualification?.message} {...register("qualification")} />
          <Input label="Degree" placeholder="e.g. Computer Science" error={errors.degree?.message} {...register("degree")} />
        </div>
      </div>

      {/* EMERGENCY CONTACT */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800 border-b pb-2">Emergency Contact</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input label="Emergency Contact Number" inputMode="numeric" maxLength={10} placeholder="Enter Phone no" error={errors.emergency_contact?.message} {...register("emergency_contact")} />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <LoadingButton type="submit" loading={isSubmitting}>{isEdit ? "Update Employee" : "Create Employee"}</LoadingButton>
      </div>
    </form>
  );
}

function toFormValues(employee: Employee): EmployeeFormData {
  return {
    full_name: employee.full_name,
    email: employee.email,
    phone: employee.phone ?? "",
    department: employee.department ?? DEPARTMENTS[0],
    designation: employee.designation ?? "",
    role: employee.role,
    joined_date: employee.joined_date ?? new Date().toISOString().slice(0, 10),
    date_of_birth: employee.date_of_birth ?? "",
    current_address: employee.current_address ?? "",
    qualification: employee.qualification ?? "",
    degree: employee.degree ?? "",
    experience_years: employee.experience_years ?? undefined,
    emergency_contact: employee.emergency_contact ?? "",
  };
}
