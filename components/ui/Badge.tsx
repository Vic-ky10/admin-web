import clsx from "clsx";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

export default function Badge({
  variant = "info",
  children,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        {
          "bg-emerald-50 text-emerald-700 ring-emerald-200": variant === "success",

          "bg-amber-50 text-amber-700 ring-amber-200":
            variant === "warning",

          "bg-red-50 text-red-700 ring-red-200":
            variant === "danger",

          "bg-blue-50 text-blue-700 ring-blue-200":
            variant === "info",
        }
      )}
    >
      {children}
    </span>
  );
}
