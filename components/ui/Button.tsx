
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
        "rounded-lg px-4 py-2 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-emerald-600 text-white hover:bg-emerald-700":
            variant === "primary",

          "bg-slate-200 text-slate-800 hover:bg-slate-300":
            variant === "secondary",

          "bg-red-600 text-white hover:bg-red-700":
            variant === "danger",
        },
        className
      )}
    >
      {children}
    </button>
  );
}