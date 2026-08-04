import { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode; // Right side primary actions
  className?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={clsx("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 pb-2 border-b border-slate-200/60", className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <span className="text-slate-300">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-blue-600 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-700">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-3xl sm:text-sm">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
          {children}
        </div>
      )}
    </div>
  );
}
