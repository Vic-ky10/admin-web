create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null,

  title text not null,

  message text not null,

  notification_type text not null,

  reference_id uuid,

  action_url text,

  is_read boolean not null default false,

  created_by uuid,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint notifications_profile_id_fkey
    foreign key (profile_id)
    references public.profiles(id)
    on update cascade
    on delete cascade,

  constraint notifications_created_by_fkey
    foreign key (created_by)
    references public.profiles(id)
    on update cascade
    on delete set null,

  constraint notifications_type_check
    check (
      notification_type in (
        'Leave',
        'Expense',
        'Project',
        'Task',
        'Attendance',
        'Announcement',
        'Incentive',
        'General'
      )
    )
);

create index if not exists notifications_profile_id_idx
on public.notifications(profile_id);

create index if not exists notifications_is_read_idx
on public.notifications(is_read);

create index if not exists notifications_type_idx
on public.notifications(notification_type);

create index if not exists notifications_created_at_idx
on public.notifications(created_at desc);

  create or replace function public.set_notifications_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_notifications_updated_at
on public.notifications;

create trigger set_notifications_updated_at
before update
on public.notifications
for each row
execute function public.set_notifications_updated_at();

alter table public.notifications
enable row level security;

drop policy if exists "Employees can read own notifications"
on public.notifications;

create policy "Employees can read own notifications"
on public.notifications
for select
using (profile_id = auth.uid());

drop policy if exists "Employees can update own notifications"
on public.notifications;

create policy "Employees can update own notifications"
on public.notifications
for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());