import { adminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/services/email.service";
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

const WELCOME_EMAIL_SUBJECT = "Welcome to InfiniGoal Portal";
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
      joined_date: employee.joined_date,
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
      joined_date: employee.joined_date,
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
  password,
}: {
  employee: EmployeeFormData;
  password: string;
}) {
  const portalUrl = process.env.EMPLOYEE_PORTAL_URL!;

  await sendEmail({
    to: employee.email,
    subject: WELCOME_EMAIL_SUBJECT,
    html: buildWelcomeEmailHtml({
      employee,
      password,
      portalUrl,
    }),
    text: buildWelcomeEmailText({
      employee,
      password,
      portalUrl,
    }),
  });

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

  // TODO:
  // Re-enable sendWelcomeEmail() once a verified Resend domain is available.
  // The Credentials Modal will remain as a backup onboarding option.
  /*
  let welcomeEmailSent = false;

  try {
    welcomeEmailSent = await sendWelcomeEmail({
      employee,
      password,
    });
  } catch (error) {
    console.error(
      "Welcome email failed:",
      error instanceof Error
        ? error.message
        : "Unable to send the welcome email."
    );
  }
  */

  return {
    success: true,
    message: "Employee created successfully.",
    data: {
      employeeId,
      credentials: {
        fullName: employee.full_name,
        email: employee.email,
        password,
        portalUrl: process.env.EMPLOYEE_PORTAL_URL!,
      },
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
  password,
  portalUrl,
}: {
  employee: EmployeeFormData;
  password: string;
  portalUrl: string;
}) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;">
            <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;color:#047857;">
              Welcome to InfiniGoal Portal
            </h1>

            <p style="margin:0 0 16px;font-size:16px;line-height:24px;">
              Hello ${escapeHtml(employee.full_name)},
            </p>

            <p style="margin:0 0 24px;font-size:16px;line-height:24px;">
              Welcome to InfiniGoal. Your employee account has been created successfully.
            </p>

            <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:20px;">
              <tbody>
                ${buildEmailTableRow("Employee Portal", portalUrl)}
                ${buildEmailTableRow("Login Email", employee.email)}
                ${buildEmailTableRow("Temporary Password", password)}
              </tbody>
            </table>

            <p style="margin:24px 0 0;font-size:14px;line-height:22px;color:#475569;">
              Please use these credentials to access the Employee Portal.
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
  password,
  portalUrl,
}: {
  employee: EmployeeFormData;
  password: string;
  portalUrl: string;
}) {
  return [
    "Welcome to InfiniGoal Portal",
    "",
    `Hello ${employee.full_name},`,
    "",
    "Welcome to InfiniGoal.",
    "",
    "Your employee account has been created successfully.",
    "",
    `Employee Portal:`,
    portalUrl,
    "",
    `Login Email:`,
    employee.email,
    "",
    `Temporary Password:`,
    password,
    "",
    "Please use these credentials to access the Employee Portal.",
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

export async function updateSelfProfile(
  profileId: string,
  fullName: string,
  phone: string | null,
  avatarUrl: string | null
): Promise<ActionResponse<Employee>> {
  const { data, error } = await adminClient
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId)
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
    message: "Profile updated successfully.",
    data: data as Employee,
  };
}
