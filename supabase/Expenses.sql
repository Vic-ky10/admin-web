create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null,

  expense_code text not null unique,

  expense_type text not null,

  amount numeric(10,2) not null,

  approved_amount numeric(10,2),

  currency text not null default 'INR',

  description text,

  receipt_url text,

  expense_date date not null,

  status text not null default 'Pending',

  payment_status text not null default 'Pending',

  reviewed_by uuid,

  reviewed_at timestamptz,

  review_comment text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint expenses_profile_id_fkey
    foreign key (profile_id)
    references public.profiles(id)
    on update cascade
    on delete cascade,

  constraint expenses_reviewed_by_fkey
    foreign key (reviewed_by)
    references public.profiles(id)
    on update cascade
    on delete set null,

  constraint expenses_type_check
    check (
      expense_type in (
        'Travel',
        'Food',
        'Accommodation',
        'Petrol Charges',
        'Office Supplies',
        'Products',
        'Other'
      )
    ),

  constraint expenses_currency_check
    check (
      currency in (
        'INR'
      )
    ),

  constraint expenses_status_check
    check (
      status in (
        'Pending',
        'Approved',
        'Rejected'
      )
    ),

  constraint expenses_payment_status_check
    check (
      payment_status in (
        'Pending',
        'Paid'
      )
    ),
    constraint expenses_approved_amount_check
check (
  approved_amount is null
  or approved_amount >= 0
),

  constraint expenses_amount_check
    check (
      amount >= 0
    )
);

create index if not exists expenses_profile_id_idx
on public.expenses(profile_id);

create index if not exists expenses_status_idx
on public.expenses(status);

create index if not exists expenses_payment_status_idx
on public.expenses(payment_status);

create index if not exists expenses_expense_date_idx
on public.expenses(expense_date);

create or replace function public.set_expenses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_expenses_updated_at
on public.expenses;

create trigger set_expenses_updated_at
before update
on public.expenses
for each row
execute function public.set_expenses_updated_at();

alter table public.expenses
enable row level security;

drop policy if exists "Employees can read own expenses"
on public.expenses;

create policy "Employees can read own expenses"
on public.expenses
for select
using (profile_id = auth.uid());

drop policy if exists "Employees can create own expenses"
on public.expenses;

create policy "Employees can create own expenses"
on public.expenses
for insert
with check (profile_id = auth.uid());

drop policy if exists "Employees can update pending expenses"
on public.expenses;

create policy "Employees can update pending expenses"
on public.expenses
for update
using (
  profile_id = auth.uid()
  and status = 'Pending'
)
with check (
  profile_id = auth.uid()
);