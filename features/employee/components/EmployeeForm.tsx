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
    resolver: zodResolver(employeeSchema),
    defaultValues: formValues,
  });

  useEffect(() => {
    reset(formValues);
  }, [formValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
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
    <form
      className="grid grid-cols-1 gap-5 md:grid-cols-2"
      onSubmit={onSubmit}
    >

      {isEdit && employee && (
        <Input
          label="Employee ID"
          value={employee.employee_id}
          readOnly
          className="bg-slate-100 text-slate-600"
        />
      )}

      <Input
        label="Full Name"
        autoComplete="name"
        placeholder="Enter Name"
        error={errors.full_name?.message}
        {...register("full_name")}
      />

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Enter email"
        readOnly={isEdit}
        className={isEdit ? "bg-slate-100 text-slate-600" : undefined}
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Phone"
        inputMode="numeric"
        maxLength={10}
        placeholder="Enter Phone no"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Department
        </label>

        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          {...register("department")}
        >
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>

        {errors.department?.message && (
          <p className="text-sm text-red-500">
            {errors.department.message}
          </p>
        )}
      </div>

      <Input
        label="Designation"
        placeholder="Enter Designation  "
        error={errors.designation?.message}
        {...register("designation")}
      />

      <div className="space-y-1">

        <label className="text-sm font-medium">
          Role
        </label>

        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          {...register("role")}
        >

          {Object.values(EMPLOYEE_ROLE).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}

        </select>

        {errors.role?.message && (
          <p className="text-sm text-red-500">
            {errors.role.message}
          </p>
        )}

      </div>

      <div className="flex justify-end gap-3 md:col-span-2">

        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <LoadingButton
          type="submit"
          loading={isSubmitting}
        >
          {isEdit ? "Update Employee" : "Create Employee"}
        </LoadingButton>

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
  };
}
