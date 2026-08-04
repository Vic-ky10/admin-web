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
    <div className={clsx("w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs", containerClassName)}>
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
    <thead className={clsx("bg-slate-50/90 backdrop-blur-xs sticky top-0 z-10 border-b border-slate-200/80", className)}>
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
  return <tbody className={clsx("divide-y divide-slate-100/80 bg-white", className)}>{children}</tbody>;
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
        "transition-colors duration-150 hover:bg-slate-50/80",
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
    <th className={clsx("px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500", className)}>
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
    <td className={clsx("px-5 py-4 text-sm text-slate-700 align-middle", className)}>
      {children}
    </td>
  );
}
