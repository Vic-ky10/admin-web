create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),

  project_name text not null,

  project_code text not null unique,

  description text,

  priority text not null default 'Medium',

  progress integer not null default 0,

  start_date date not null,

  end_date date,

  status text not null default 'Planning',

  created_by uuid not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint projects_created_by_fkey
    foreign key (created_by)
    references public.profiles(id)
    on update cascade
    on delete restrict,

  constraint projects_priority_check
    check (
      priority in (
        'Low',
        'Medium',
        'High'
      )
    ),

  constraint projects_progress_check
    check (
      progress >= 0
      and progress <= 100
    ),

  constraint projects_status_check
    check (
      status in (
        'Planning',
        'Active',
        'On Hold',
        'Completed',
        'Archived',
        'Cancelled'
      )
    ),

  constraint projects_dates_check
    check (
      end_date is null
      or end_date >= start_date
    )
);

create index if not exists projects_project_code_idx
on public.projects(project_code);

create index if not exists projects_status_idx
on public.projects(status);

create index if not exists projects_priority_idx
on public.projects(priority);

create index if not exists projects_created_by_idx
on public.projects(created_by);

create index if not exists projects_start_date_idx
on public.projects(start_date);

create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at
on public.projects;

create trigger set_projects_updated_at
before update
on public.projects
for each row
execute function public.set_projects_updated_at();

alter table public.projects
enable row level security;

drop policy if exists "Employees can read projects"
on public.projects;

create policy "Employees can read projects"
on public.projects
for select
using (true);