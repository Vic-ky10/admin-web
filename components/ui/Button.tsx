import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
        {
          // Sizes
          "px-3 py-1.5 text-xs": size === "sm",
          "px-4 py-2 text-sm": size === "md",
          "px-5 py-2.5 text-base": size === "lg",

          // Variants
          "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 focus:ring-blue-500":
            variant === "primary",

          "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-400":
            variant === "secondary",

          "bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md hover:shadow-rose-600/20 focus:ring-rose-500":
            variant === "danger",

          "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/20 focus:ring-emerald-500":
            variant === "success",

          "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none focus:ring-slate-300":
            variant === "ghost",
        },
        className
      )}
    >
      {children}
    </button>
  );
}
