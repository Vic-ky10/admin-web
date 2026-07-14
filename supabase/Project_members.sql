create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null,

  profile_id uuid not null,

  assigned_by uuid not null,

  member_role text not null default 'Developer',

  status text not null default 'Active',

  assigned_at timestamptz not null default now(),

  joined_date date not null default current_date,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint project_members_project_id_fkey
    foreign key (project_id)
    references public.projects(id)
    on update cascade
    on delete cascade,

  constraint project_members_profile_id_fkey
    foreign key (profile_id)
    references public.profiles(id)
    on update cascade
    on delete cascade,

  constraint project_members_assigned_by_fkey
    foreign key (assigned_by)
    references public.profiles(id)
    on update cascade
    on delete restrict,

 constraint project_members_member_role_check
check (
  member_role in (
    'Project Manager',
    'Developer',
    'Sales',
    'Marketing',
    'Analytics',
    'Other'
  )
),

  constraint project_members_status_check
    check (
      status in (
        'Active',
        'Completed',
        'Removed'
      )
    ),

  constraint project_members_unique_assignment
    unique (project_id, profile_id)
);

create index if not exists project_members_project_id_idx
on public.project_members(project_id);

create index if not exists project_members_profile_id_idx
on public.project_members(profile_id);

create index if not exists project_members_assigned_by_idx
on public.project_members(assigned_by);

create index if not exists project_members_status_idx
on public.project_members(status);

create or replace function public.set_project_members_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_project_members_updated_at
on public.project_members;

create trigger set_project_members_updated_at
before update
on public.project_members
for each row
execute function public.set_project_members_updated_at();

alter table public.project_members
enable row level security;

drop policy if exists "Employees can read project memberships"
on public.project_members;

create policy "Employees can read project memberships"
on public.project_members
for select
using (true);