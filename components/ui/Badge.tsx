import clsx from "clsx";

export interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Badge({
  variant = "info",
  size = "md",
  showDot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset transition-colors",
        {
          "px-2 py-0.5 text-[11px]": size === "sm",
          "px-2.5 py-1 text-xs": size === "md",

          "bg-emerald-50 text-emerald-700 ring-emerald-200/70": variant === "success",
          "bg-amber-50 text-amber-700 ring-amber-200/70": variant === "warning",
          "bg-rose-50 text-rose-700 ring-rose-200/70": variant === "danger",
          "bg-blue-50 text-blue-700 ring-blue-200/70": variant === "info",
          "bg-slate-100 text-slate-700 ring-slate-200": variant === "neutral",
          "bg-indigo-50 text-indigo-700 ring-indigo-200/70": variant === "primary",
        },
        className
      )}
    >
      {showDot && (
        <span
          className={clsx("h-1.5 w-1.5 rounded-full", {
            "bg-emerald-500": variant === "success",
            "bg-amber-500": variant === "warning",
            "bg-rose-500": variant === "danger",
            "bg-blue-500": variant === "info",
            "bg-slate-400": variant === "neutral",
            "bg-indigo-500": variant === "primary",
          })}
        />
      )}
      {children}
    </span>
  );
}
