"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginEmployee } from "@/features/auth/auth.client";
import { toast } from "sonner";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/images/Logo.png";

export default function EmployeeLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const { error } = await loginEmployee(email, password);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    router.push("/employee/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <div className="flex items-center gap-3">
          <Image src={Logo} alt="InfiniGoal" width={40} height={40} className="object-contain" />
          <h1 className="text-3xl font-bold text-slate-900">
            InfiniGoal
          </h1>
        </div>

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

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full rounded-lg border p-3 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
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