import clsx from "clsx";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx("inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600 h-5 w-5", className)}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return (
    <div className={clsx("animate-pulse rounded-md bg-slate-200/80 h-4 w-full", className)} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx("animate-pulse rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xs space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded-md bg-slate-200/80" />
        <div className="h-8 w-8 rounded-lg bg-slate-200/70" />
      </div>
      <div className="h-7 w-20 rounded-md bg-slate-200/90" />
      <div className="h-3 w-36 rounded-md bg-slate-100" />
    </div>
  );
}

export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 w-full max-w-[120px] rounded-md bg-slate-200/70" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="bg-slate-50 p-4 border-b border-slate-200/80 flex items-center justify-between">
        <div className="h-5 w-32 rounded-md bg-slate-200" />
        <div className="h-8 w-24 rounded-lg bg-slate-200/80" />
      </div>
      <table className="min-w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="h-10 w-48 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonTable rows={4} columns={5} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <Spinner className="h-8 w-8 text-blue-600" />
    </div>
  );
}
