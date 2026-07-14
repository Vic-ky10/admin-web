
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-lg px-4 py-2 font-semibold shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20":
            variant === "primary",

          "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50":
            variant === "secondary",

          "bg-red-600 text-white hover:bg-red-700 hover:shadow-md hover:shadow-red-600/20":
            variant === "danger",
        },
        className
      )}
    >
      {children}
    </button>
  );
}
