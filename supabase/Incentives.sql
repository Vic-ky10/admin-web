create table if not exists public.incentives (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null,

  incentive_code text not null unique,

  incentive_type text not null,

  title text not null,

  description text not null,

  amount numeric(10,2) not null,

  month integer not null,

  year integer not null,

  status text not null default 'Pending',

  payment_status text not null default 'Pending',

  approved_by uuid,

  approved_at timestamptz,

  paid_at timestamptz,

  created_by uuid,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint incentives_profile_id_fkey
    foreign key (profile_id)
    references public.profiles(id)
    on update cascade
    on delete cascade,

  constraint incentives_approved_by_fkey
    foreign key (approved_by)
    references public.profiles(id)
    on update cascade
    on delete set null,

  constraint incentives_created_by_fkey
    foreign key (created_by)
    references public.profiles(id)
    on update cascade
    on delete set null,

  constraint incentives_type_check
    check (
      incentive_type in (
        'Customer Conversion',
        'Performance',
        'Special Bonus'
      )
    ),

  constraint incentives_status_check
    check (
      status in (
        'Pending',
        'Approved',
        'Rejected'
      )
    ),

  constraint incentives_payment_status_check
    check (
      payment_status in (
        'Pending',
        'Paid'
      )
    ),

  constraint incentives_amount_check
    check (
      amount > 0
    ),

  constraint incentives_month_check
    check (
      month between 1 and 12
    ),

  constraint incentives_year_check
    check (
      year >= 2000
    )
);

create index if not exists incentives_profile_id_idx
on public.incentives(profile_id);

create index if not exists incentives_status_idx
on public.incentives(status);

create index if not exists incentives_payment_status_idx
on public.incentives(payment_status);

create index if not exists incentives_month_year_idx
on public.incentives(year, month);

create or replace function public.set_incentives_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_incentives_updated_at
on public.incentives;

create trigger set_incentives_updated_at
before update
on public.incentives
for each row
execute function public.set_incentives_updated_at();

alter table public.incentives
enable row level security;

drop policy if exists "Employees can read own incentives"
on public.incentives;

create policy "Employees can read own incentives"
on public.incentives
for select
using (profile_id = auth.uid());
