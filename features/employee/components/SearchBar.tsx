"use client";

import Input from "@/components/ui/Input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="mb-6 max-w-md">
      <Input
        placeholder="Search by name, email or employee ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}