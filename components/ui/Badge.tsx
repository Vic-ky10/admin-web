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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        {
          "bg-green-100 text-green-700": variant === "success",

          "bg-yellow-100 text-yellow-700":
            variant === "warning",

          "bg-red-100 text-red-700":
            variant === "danger",

          "bg-blue-100 text-blue-700":
            variant === "info",
        }
      )}
    >
      {children}
    </span>
  );
}