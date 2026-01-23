
create table email_metrics (
  date date not null,
  email_type text not null,
  sent_count integer default 0,
  delivered_count integer default 0,
  opened_count integer default 0,
  unsubscribe_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (date, email_type)
);

-- Add RLS policies (optional but good practice)
alter table email_metrics enable row level security;

-- Allow read access to authenticated users (admin)
create policy "Allow read access to authenticated users"
  on email_metrics for select
  to authenticated
  using (true);

-- Allow service role to full access (for webhooks)
create policy "Allow service role full access"
  on email_metrics for all
  to service_role
  using (true);
