import { ReactNode } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import Button from "./Button";
import clsx from "clsx";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center sm:p-12 shadow-xs",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200/60 shadow-2xs">
        {icon || <Inbox className="h-6 w-6" />}
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900 tracking-tight">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-xs text-slate-500 leading-relaxed">{description}</p>
      )}

      {actionLabel && (
        <div className="mt-5">
          {actionHref ? (
            <Link href={actionHref}>
              <Button size="sm">{actionLabel}</Button>
            </Link>
          ) : (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
