create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null,

  project_member_id uuid not null,

  task_code text not null unique,

  title text not null,

  description text,

  priority text not null default 'Medium',

  status text not null default 'Todo',

  estimated_hours numeric(5,2),

  actual_hours numeric(5,2),

  due_date date,

  completed_at timestamptz,

  created_by uuid not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint tasks_project_id_fkey
    foreign key (project_id)
    references public.projects(id)
    on update cascade
    on delete cascade,

  constraint tasks_project_member_id_fkey
    foreign key (project_member_id)
    references public.project_members(id)
    on update cascade
    on delete cascade,

  constraint tasks_created_by_fkey
    foreign key (created_by)
    references public.profiles(id)
    on update cascade
    on delete restrict,

  constraint tasks_priority_check
    check (
      priority in (
        'Low',
        'Medium',
        'High',
        'Critical'
      )
    ),

  constraint tasks_status_check
    check (
      status in (
        'Todo',
        'In Progress',
        'In Review',
        'Completed',
        'Cancelled'
      )
    ),

  constraint tasks_estimated_hours_check
    check (
      estimated_hours is null
      or estimated_hours >= 0
    ),

  constraint tasks_actual_hours_check
    check (
      actual_hours is null
      or actual_hours >= 0
    )
);

create index if not exists tasks_project_id_idx
on public.tasks(project_id);

create index if not exists tasks_project_member_id_idx
on public.tasks(project_member_id);

create index if not exists tasks_status_idx
on public.tasks(status);

create index if not exists tasks_priority_idx
on public.tasks(priority);

create index if not exists tasks_due_date_idx
on public.tasks(due_date);

create or replace function public.set_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at
on public.tasks;

create trigger set_tasks_updated_at
before update
on public.tasks
for each row
execute function public.set_tasks_updated_at();

alter table public.tasks
enable row level security;

drop policy if exists "Employees can read assigned tasks"
on public.tasks;

create policy "Employees can read assigned tasks"
on public.tasks
for select
using (
  exists (
    select 1
    from public.project_members pm
    where pm.id = tasks.project_member_id
      and pm.profile_id = auth.uid()
  )
);