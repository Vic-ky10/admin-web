import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}
const variants = {
  primary:
    "bg-emerald-600 hover:bg-emerald-700 text-white",

  secondary:
    "bg-slate-200 hover:bg-slate-300 text-slate-900",

  danger:
    "bg-red-600 hover:bg-red-700 text-white",
};
export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl px-5 py-3 font-semibold transition-all duration-200 active:scale-95",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}