import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
import { getAdminExpenseSummary } from "@/features/expense/expense.service";
import { getCurrentEmployeeProfileFromToken } from "@/features/employee-portal/employee-portal.service";
import { Employee } from "@/features/employee/employee.types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    let currentUser: Employee | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      console.log("Mobile Token:", token.substring(0, 20) + "...");

     currentUser = await getCurrentEmployeeProfileFromToken(token);
      console.log("Current User:", currentUser);

      if (!currentUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized: Profile not found.",
          },
          { status: 401 },
        );
      }

      if (currentUser.role !== "Admin") {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized: Admin access required.",
          },
          { status: 403 },
        );
      }
      // const token = authHeader.substring(7);
      // const projectRef = "ljcadqyopnzupgrbryay";
      // const cookieName = `sb-${projectRef}-auth-token`;
      // const cookieValue = JSON.stringify([token, null, null, null]);

      // const cookieStore = await cookies();
      // cookieStore.set(cookieName, cookieValue, {
      //   path: "/",
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "lax",
      // });
    }

   const summary = await getAdminExpenseSummary(currentUser);
    return NextResponse.json({ success: true, data: summary });
  } catch (error: unknown) {
    console.error("API Admin Expense Summary Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch admin expense summary.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: message.includes("Unauthorized") ? 401 : 500,
      },
    );
  }
}
