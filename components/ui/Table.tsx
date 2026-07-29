import {
  HTMLAttributes,
  ReactNode,
} from "react";

import clsx from "clsx";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({
  children,
  className,
}: TableProps) {
  return (
   <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className={clsx("min-w-full", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <thead className="bg-slate-50">
      {children}
    </thead>
  );
}

export function TableBody({
  children,
}: {
  children: ReactNode;
}) {
  return <tbody>{children}</tbody>;
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
      className={[
        "border-b border-slate-100 transition hover:bg-blue-50/50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

export function TableCell({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <td className="px-5 py-4 text-sm text-slate-700">
      {children}
    </td>
  );
}
