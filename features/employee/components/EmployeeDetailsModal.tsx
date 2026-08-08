"use client";

import { useRef } from "react";
import {
  UserCircle,
  Briefcase,
  MapPin,
  GraduationCap,
  Phone,
  Clock,
  LucideIcon,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Employee } from "../employee.types";

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
}


const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

const GRADIENT_PRESETS = [
  "from-violet-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENT_PRESETS[Math.abs(hash) % GRADIENT_PRESETS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}


const NAV_SECTIONS = [
  { id: "emp-personal", label: "Personal" },
  { id: "emp-employment", label: "Employment" },
  { id: "emp-address", label: "Address" },
  { id: "emp-education", label: "Education" },
  { id: "emp-emergency", label: "Emergency" },
  { id: "emp-account", label: "Account" },
] as const;


interface SectionCardProps {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}

function SectionCard({
  id,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  children,
}: SectionCardProps) {
  return (
    <section id={id} className="scroll-mt-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-5 py-3.5">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {title}
          </h3>
        </div>
        {/* Section Body */}
        <div className="p-5">{children}</div>
      </div>
    </section>
  );
}

interface DetailRowProps {
  label: string;
  value?: string | number | null;
}

function DetailRow({ label, value }: DetailRowProps) {
  const displayValue =
    value !== undefined && value !== null && value !== ""
      ? String(value)
      : null;

  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      {displayValue ? (
        <p className="break-words text-sm font-semibold text-slate-800">
          {displayValue}
        </p>
      ) : (
        <p className="text-sm italic text-slate-400">-</p>
      )}
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-white/90 ring-1 ring-white/10">
      <span className="text-white/50">{label}:</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}


export default function EmployeeDetailsModal({
  employee,
  open,
  onClose,
}: EmployeeDetailsModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!employee) return null;

  const gradient = getGradient(employee.full_name);
  const initials = getInitials(employee.full_name);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const top =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop -
        12;
      container.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <Modal open={open} title="Employee Profile" size="2xl" onClose={onClose}>
      <div className="flex flex-col -mx-6 -mt-6">
     
        <div className="relative overflow-hidden border-b border-slate-100 bg-white px-6 pb-6 pt-7">
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            {/* Avatar */}
            <div className="shrink-0">
              {employee.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={employee.avatar_url}
                  alt={employee.full_name}
                  className="h-20 w-20 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md"
                />
              ) : (
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-md`}
                >
                  <span className="text-2xl font-bold text-white">
                    {initials}
                  </span>
                </div>
              )}
            </div>

         
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-900">
                {employee.full_name}
              </h2>

       
              <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-500">
                {employee.employee_id}
              </span>

              <div className="mt-2.5 flex flex-wrap justify-center gap-2 sm:justify-start">
                {employee.department && (
                  <LightChip label="Dept" value={employee.department} />
                )}
                {employee.designation && (
                  <LightChip label="Title" value={employee.designation} />
                )}
                {employee.role && (
                  <LightChip label="Access" value={employee.role} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="flex gap-1 overflow-x-auto px-6 py-2">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex flex-col gap-5 overflow-y-auto px-6 pb-8 pt-5"
          style={{ maxHeight: "60vh" }}
        >
          {/* Personal Information */}
          <SectionCard
            id="emp-personal"
            icon={UserCircle}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
            title="Personal Information"
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <DetailRow label="Full Name" value={employee.full_name} />
              <DetailRow label="Employee ID" value={employee.employee_id} />
              <DetailRow label="Email" value={employee.email} />
              <DetailRow label="Phone Number" value={employee.phone} />
              <DetailRow
                label="Date of Birth"
                value={formatDate(employee.date_of_birth)}
              />
            </div>
          </SectionCard>

          {/* Employment */}
          <SectionCard
            id="emp-employment"
            icon={Briefcase}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            title="Employment"
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <DetailRow label="Department" value={employee.department} />
              <DetailRow label="Designation" value={employee.designation} />
              <DetailRow label="Role" value={employee.role} />
              <DetailRow
                label="Experience (Years)"
                value={employee.experience_years}
              />
              <DetailRow
                label="Joining Date"
                value={formatDate(employee.joined_date)}
              />
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard
            id="emp-address"
            icon={MapPin}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            title="Address"
          >
            <DetailRow
              label="Current Address"
              value={employee.current_address}
            />
          </SectionCard>

          {/* Education */}
          <SectionCard
            id="emp-education"
            icon={GraduationCap}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            title="Education"
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <DetailRow label="Qualification" value={employee.qualification} />
              <DetailRow label="Degree" value={employee.degree} />
            </div>
          </SectionCard>

          {/* Emergency Contact */}
          <SectionCard
            id="emp-emergency"
            icon={Phone}
            iconColor="text-rose-600"
            iconBg="bg-rose-50"
            title="Emergency Contact"
          >
            <DetailRow
              label="Contact Number"
              value={employee.emergency_contact}
            />
          </SectionCard>

         
          <SectionCard
            id="emp-account"
            icon={Clock}
            iconColor="text-slate-500"
            iconBg="bg-slate-100"
            title="Account Information"
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
             
              <DetailRow
                label="Created Date"
                value={formatDate(employee.created_at)}
              />
              <DetailRow
                label="Updated Date"
                value={formatDate(employee.updated_at)}
              />
            </div>
          </SectionCard>

          
        </div>
      </div>
    </Modal>
  );
}



function LightChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
      <span className="text-slate-400">{label}:</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </span>
  );
}

