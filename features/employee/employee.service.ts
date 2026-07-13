import { adminClient } from "@/lib/supabase/admin";
import { ActionResponse } from "@/types/action";

import {
  EMPLOYEE_ID_PADDING,
  EMPLOYEE_ID_PREFIX,
  EMPLOYEE_STATUS,
} from "./employee.constants";
import {
  Employee,
  EmployeeOnboardingResult,
} from "./employee.types";
import { EmployeeFormData } from "./employee.validation";

const WELCOME_EMAIL_SUBJECT = "Welcome to InfiniGoal";
const EMPLOYEE_SELECT =
  "id, employee_id, full_name, email, phone, department, designation, role, avatar_url, status, is_online, last_login, joined_date, created_at, updated_at";

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await adminClient
    .from("profiles")
    .select(EMPLOYEE_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data as Employee[];
}

export async function generateEmployeeId(): Promise<string> {
  const { data, error } = await adminClient
    .from("profiles")
    .select("employee_id")
    .like("employee_id", `${EMPLOYEE_ID_PREFIX}%`)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to generate employee ID.");
  }

  if (!data?.employee_id) {
    return formatEmployeeId(1);
  }

  const current = Number(
    data.employee_id.replace(EMPLOYEE_ID_PREFIX, "")
  );

  if (Number.isNaN(current)) {
    throw new Error("Latest employee ID is invalid.");
  }

  return formatEmployeeId(current + 1);
}

export function generateDefaultPassword(fullName: string) {
  const firstName = fullName.trim().split(/\s+/)[0];

  return `IG${firstName}@123`;
}

export async function createEmployeeAuthUser(
  employee: EmployeeFormData,
  password: string
) {
  return await adminClient.auth.admin.createUser({
    email: employee.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: employee.full_name,
      role: employee.role,
    },
  });
}

export async function createEmployeeProfile(
  userId: string,
  employee: EmployeeFormData,
  employeeId: string
) {
  return await adminClient
    .from("profiles")
    .insert({
      id: userId,
      employee_id: employeeId,
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      role: employee.role,
      status: EMPLOYEE_STATUS.PENDING,
      is_online: false,
    });
}

export async function updateEmployeeProfile(
  employeeId: string,
  employee: EmployeeFormData
): Promise<ActionResponse<Employee>> {
  const { data, error } = await adminClient
    .from("profiles")
    .update({
      full_name: employee.full_name,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      role: employee.role,
    })
    .eq("id", employeeId)
    .select(EMPLOYEE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Employee updated successfully.",
    data: data as Employee,
  };
}

export async function deleteEmployeeAccount(
  employeeId: string
): Promise<ActionResponse> {
  const { error: profileError } = await adminClient
    .from("profiles")
    .delete()
    .eq("id", employeeId);

  if (profileError) {
    return {
      success: false,
      error: profileError.message,
    };
  }

  const { error: authError } =
    await adminClient.auth.admin.deleteUser(employeeId);

  if (authError) {
    return {
      success: false,
      error: authError.message,
    };
  }

  return {
    success: true,
    message: "Employee deleted successfully.",
  };
}

export async function sendWelcomeEmail({
  employee,
  employeeId,
  password,
}: {
  employee: EmployeeFormData;
  employeeId: string;
  password: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn(
      "Welcome email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL."
    );
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: employee.email,
      subject: WELCOME_EMAIL_SUBJECT,
      html: buildWelcomeEmailHtml({
        employee,
        employeeId,
        password,
      }),
      text: buildWelcomeEmailText({
        employee,
        employeeId,
        password,
      }),
    }),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Unable to send the welcome email."
    );
  }

  return true;
}

export async function onboardEmployee(
  employee: EmployeeFormData
): Promise<ActionResponse<EmployeeOnboardingResult>> {
  const employeeId = await generateEmployeeId();
  const password = generateDefaultPassword(employee.full_name);
  const { data: authData, error: authError } =
    await createEmployeeAuthUser(employee, password);

  if (authError) {
    return {
      success: false,
      error: authError.message,
    };
  }

  const userId = authData.user?.id;

  if (!userId) {
    return {
      success: false,
      error: "Employee account was not created.",
    };
  }

  const { error: profileError } = await createEmployeeProfile(
    userId,
    employee,
    employeeId
  );

  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId);

    return {
      success: false,
      error: profileError.message,
    };
  }

  let welcomeEmailSent = false;

  try {
    welcomeEmailSent = await sendWelcomeEmail({
      employee,
      employeeId,
      password,
    });
  } catch (error) {
    console.warn(
      error instanceof Error
        ? error.message
        : "Unable to send the welcome email."
    );
  }

  return {
    success: true,
    message: welcomeEmailSent
      ? "Employee created successfully. Welcome email sent."
      : "Employee created successfully.",
    data: {
      employeeId,
    },
  };
}

function formatEmployeeId(value: number) {
  return `${EMPLOYEE_ID_PREFIX}${String(value).padStart(
    EMPLOYEE_ID_PADDING,
    "0"
  )}`;
}

function buildWelcomeEmailHtml({
  employee,
  employeeId,
  password,
}: {
  employee: EmployeeFormData;
  employeeId: string;
  password: string;
}) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;">
            <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;color:#047857;">
              Welcome to InfiniGoal
            </h1>

            <p style="margin:0 0 16px;font-size:16px;line-height:24px;">
              Hello ${escapeHtml(employee.full_name)},
            </p>

            <p style="margin:0 0 24px;font-size:16px;line-height:24px;">
              We are pleased to welcome you to InfiniGoal. Your employee account has been created successfully.
            </p>

            <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:20px;">
              <tbody>
                ${buildEmailTableRow("Employee Name", employee.full_name)}
                ${buildEmailTableRow("Employee ID", employeeId)}
                ${buildEmailTableRow("Role", employee.role)}
                ${buildEmailTableRow("Email", employee.email)}
                ${buildEmailTableRow("Default Password", password)}
              </tbody>
            </table>

            <p style="margin:24px 0 0;font-size:14px;line-height:22px;color:#475569;">
              Please keep these credentials secure. You can continue using the default password until you change it from your Profile page.
            </p>

            <p style="margin:24px 0 0;font-size:14px;line-height:22px;color:#475569;">
              Regards,<br />
              InfiniGoal Team
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function buildWelcomeEmailText({
  employee,
  employeeId,
  password,
}: {
  employee: EmployeeFormData;
  employeeId: string;
  password: string;
}) {
  return [
    "Welcome to InfiniGoal",
    "",
    `Hello ${employee.full_name},`,
    "",
    "We are pleased to welcome you to InfiniGoal. Your employee account has been created successfully.",
    "",
    `Employee Name: ${employee.full_name}`,
    `Employee ID: ${employeeId}`,
    `Role: ${employee.role}`,
    `Email: ${employee.email}`,
    `Default Password: ${password}`,
    "",
    "Please keep these credentials secure. You can continue using the default password until you change it from your Profile page.",
    "",
    "Regards,",
    "InfiniGoal Team",
  ].join("\n");
}

function buildEmailTableRow(label: string, value: string) {
  return `
    <tr>
      <td style="width:180px;border-top:1px solid #e2e8f0;padding:12px 0;color:#475569;font-weight:600;">
        ${escapeHtml(label)}
      </td>
      <td style="border-top:1px solid #e2e8f0;padding:12px 0;color:#0f172a;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
