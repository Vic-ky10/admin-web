import { NextResponse } from "next/server";

import { getCurrentEmployeeProfile, getCurrentEmployeeProfileFromToken } from "@/features/employee-portal/employee-portal.service";
import { getEmployeeExpenseSummary } from "@/features/expense/expense.service";
import { Employee } from "@/features/employee/employee.types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    let currentUser: Employee | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      currentUser = await getCurrentEmployeeProfileFromToken(token);

      if (!currentUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized: Profile not found.",
          },
          { status: 401 },
        );
      }
    } else {
      currentUser = await getCurrentEmployeeProfile();

      if (!currentUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized: Profile not found.",
          },
          { status: 401 },
        );
      }
    }

    const summary = await getEmployeeExpenseSummary(
      currentUser.id,
      currentUser,
    );
    return NextResponse.json({ success: true, data: summary });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("API Employee Expense Summary Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch employee expense summary.",
      },
      {
        status: error.message?.includes("Unauthorized") ? 401 : 500,
      },
    );
  }
}
