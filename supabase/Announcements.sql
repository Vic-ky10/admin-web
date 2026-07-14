create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  message text not null,

  announcement_type text not null default 'General',

  target_audience text not null default 'Everyone',

  attachment_url text,

  status text not null default 'Draft',

  is_pinned boolean not null default false,

  publish_at timestamptz,

  expires_at timestamptz,

  created_by uuid not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint announcements_created_by_fkey
    foreign key (created_by)
    references public.profiles(id)
    on update cascade
    on delete restrict,

  constraint announcements_type_check
    check (
      announcement_type in (
        'General',
        'Holiday',
        'Meeting',
        'Event',
        'Policy',
        'Emergency'
      )
    ),

  constraint announcements_target_check
    check (
      target_audience in (
        'Everyone',
        'Admin',
        'Employee',
        'Sales',
        'Marketing',
        'Analytics',
        'Developer'
      )
    ),

  constraint announcements_status_check
    check (
      status in (
        'Draft',
        'Published',
        'Archived'
      )
    ),

  constraint announcements_expiry_check
    check (
      expires_at is null
      or publish_at is null
      or expires_at >= publish_at
    )
);

create index if not exists announcements_status_idx
on public.announcements(status);

create index if not exists announcements_type_idx
on public.announcements(announcement_type);

create index if not exists announcements_target_idx
on public.announcements(target_audience);

create index if not exists announcements_publish_at_idx
on public.announcements(publish_at);

create index if not exists announcements_created_by_idx
on public.announcements(created_by);

create or replace function public.set_announcements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_announcements_updated_at
on public.announcements;

create trigger set_announcements_updated_at
before update
on public.announcements
for each row
execute function public.set_announcements_updated_at();

alter table public.announcements
enable row level security;

drop policy if exists "Employees can read published announcements"
on public.announcements;

create policy "Employees can read published announcements"
on public.announcements
for select
using (
  status = 'Published'
);