
-- Create a table to log cron job executions
create table public.cron_logs (
  id uuid default gen_random_uuid() primary key,
  job_name text not null, -- 'generate' or 'distribute'
  status text not null, -- 'success', 'failure', 'skipped'
  message text,
  details jsonb, -- store extra data like story_id, subscriber_count
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (optional, maybe public for now for ease of admin use)
alter table public.cron_logs enable row level security;

-- Allow anon/service_role to insert (for the API route)
create policy "Enable insert for service_role" on public.cron_logs for insert with check (true);
create policy "Enable read for authenticated users" on public.cron_logs for select using (true);
