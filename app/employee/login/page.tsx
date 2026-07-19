"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginEmployee } from "@/features/auth/auth.service";

export default function EmployeeLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const { error } = await loginEmployee(email, password);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/employee/attendance");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-slate-900">
          InfiniGoal
        </h1>

        <p className="mt-2 text-slate-500">
          Employee Portal Login
        </p>

        <div className="mt-8">
          <label className="block mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mt-5">
          <label className="block mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-lg border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-8 w-full rounded-lg bg-emerald-600 p-3 text-white hover:bg-emerald-700"
        >
          {loading ? "Logging in..." : "Employee Login"}
        </button>

      </div>
    </main>
  );
}