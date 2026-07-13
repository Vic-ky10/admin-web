create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  attendance_date date not null,
  login_time timestamptz,
  logout_time timestamptz,
  working_hours numeric(5, 2),
  status text not null default 'Present',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_profile_id_fkey
    foreign key (profile_id)
    references public.profiles(id)
    on update cascade
    on delete cascade,
  constraint attendance_status_check
    check (status in ('Present', 'Incomplete', 'Absent')),
  constraint attendance_working_hours_check
    check (working_hours is null or working_hours >= 0),
  constraint attendance_logout_after_login_check
    check (logout_time is null or login_time is null or logout_time >= login_time),
  constraint attendance_profile_date_unique
    unique (profile_id, attendance_date)
);

create index if not exists attendance_profile_id_idx
  on public.attendance(profile_id);

create index if not exists attendance_attendance_date_idx
  on public.attendance(attendance_date);

create index if not exists attendance_status_idx
  on public.attendance(status);

create index if not exists attendance_profile_date_idx
  on public.attendance(profile_id, attendance_date desc);

create or replace function public.set_attendance_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_attendance_updated_at on public.attendance;

create trigger set_attendance_updated_at
before update on public.attendance
for each row
execute function public.set_attendance_updated_at();

alter table public.attendance enable row level security;

drop policy if exists "Employees can read own attendance" on public.attendance;
create policy "Employees can read own attendance"
on public.attendance
for select
using (profile_id = auth.uid());

drop policy if exists "Employees can insert own attendance" on public.attendance;
create policy "Employees can insert own attendance"
on public.attendance
for insert
with check (profile_id = auth.uid());

drop policy if exists "Employees can update own attendance" on public.attendance;
create policy "Employees can update own attendance"
on public.attendance
for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());
