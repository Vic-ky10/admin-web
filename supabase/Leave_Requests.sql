  create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null,

  leave_type text not null,

  leave_duration text not null,

  half_day_session text,

  start_date date not null,

  end_date date not null,

  total_days numeric(3,1) not null,

  reason text not null,

  status text not null default 'Pending',

  reviewed_by uuid,

  reviewed_at timestamptz,

  review_comment text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint leave_requests_profile_id_fkey
    foreign key (profile_id)
    references public.profiles(id)
    on update cascade
    on delete cascade,

  constraint leave_requests_reviewed_by_fkey
    foreign key (reviewed_by)
    references public.profiles(id)
    on update cascade
    on delete set null,

  constraint leave_requests_leave_type_check
    check (
      leave_type in (
        'Casual Leave',
        'Sick Leave',
        'Work From Home',
        'Other'
      )
    ),

  constraint leave_requests_leave_duration_check
    check (
      leave_duration in (
        'Full Day',
        'Half Day'
      )
    ),

constraint leave_requests_half_day_session_check
check (
  (
    leave_duration = 'Full Day'
    and half_day_session is null
  )
  or
  (
    leave_duration = 'Half Day'
    and half_day_session in (
      'Morning',
      'Afternoon'
    )
  )
),

  constraint leave_requests_status_check
    check (
      status in (
        'Pending',
        'Approved',
        'Rejected',
        'Cancelled'
      )
    ),

  constraint leave_requests_dates_check
    check (end_date >= start_date),

  constraint leave_requests_total_days_check
    check (total_days > 0)
);

create index if not exists leave_requests_profile_id_idx
on public.leave_requests(profile_id);

create index if not exists leave_requests_status_idx
on public.leave_requests(status);

create index if not exists leave_requests_start_date_idx
on public.leave_requests(start_date);

create index if not exists leave_requests_profile_start_date_idx
on public.leave_requests(profile_id, start_date desc);

create or replace function public.set_leave_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leave_requests_updated_at
on public.leave_requests;

create trigger set_leave_requests_updated_at
before update
on public.leave_requests
for each row
execute function public.set_leave_requests_updated_at();

alter table public.leave_requests
enable row level security;

drop policy if exists "Employees can read own leave requests"
on public.leave_requests;

create policy "Employees can read own leave requests"
on public.leave_requests
for select
using (profile_id = auth.uid());

drop policy if exists "Employees can create own leave requests"
on public.leave_requests;

create policy "Employees can create own leave requests"
on public.leave_requests
for insert
with check (profile_id = auth.uid());

drop policy if exists "Employees can cancel pending leave requests"
on public.leave_requests;

create policy "Employees can cancel pending leave requests"
on public.leave_requests
for update
using (
  profile_id = auth.uid()
  and status = 'Pending'
)
with check (
  profile_id = auth.uid()
);