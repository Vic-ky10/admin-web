import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface TableProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function Table({
  children,
  className,
  containerClassName,
}: TableProps) {
  return (
    <div className={clsx("w-full overflow-x-auto rounded-3xl border border-slate-200/60 bg-white/50 backdrop-blur-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]", containerClassName)}>
      <table className={clsx("min-w-full text-left border-collapse", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <thead className={clsx("bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200/60", className)}>
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tbody className={clsx("divide-y divide-slate-100/60 bg-white", className)}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode;
}) {
  return (
    <tr
      className={clsx(
        "transition-all duration-200 ease-in-out hover:bg-slate-50/80 group",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeader({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th className={clsx("px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500", className)}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td className={clsx("px-6 py-5 text-sm text-slate-700 align-middle transition-colors group-hover:text-slate-900", className)}>
      {children}
    </td>
  );
}
