"use client";

import { login } from "@/features/auth/auth.service";
import { useRouter } from "next/navigation";

import React from "react";

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin() {

    router.push("/dashboard"); // Redirect after successful login.
  }
  return (
    <main className="min-h-screen flex items-center justify-center gap-4">
      <button
  onClick={handleLogin}
  className="mt-8 w-full rounded-lg bg-emerald-600 p-3 text-white"
>
  Login
</button>

  
    </main>
  );
}
