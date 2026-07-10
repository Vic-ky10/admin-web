"use client";

export default function LoginForm() {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      {/* Login Card */}

      <h1 className="text-3xl font-bold text-center">
        InfiniGoal
      </h1>

      <p className="text-center text-gray-500 mt-2">
        Employee Management Portal
      </p>

      {/* Email */}

      <div className="mt-8">
        <label className="block mb-2 font-medium">
          Email
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Password */}

      <div className="mt-5">
        <label className="block mb-2 font-medium">
          Password
        </label>

        <input
          type="password"
          placeholder="Enter your password"
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Login Button */}

      <button
        className="mt-8 w-full rounded-lg bg-blue-600 p-3 text-white font-semibold hover:bg-blue-700 transition"
      >
        Login
      </button>
    </div>
  );
}