"use client";

import { Search } from "lucide-react";
interface ProjectSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ProjectSearch({
  value,
  onChange,
}: ProjectSearchProps) {
  return (

    
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-slate-400" />
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search projects..."
        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
