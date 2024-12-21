create table if not exists public.pods (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text,
  source jsonb,
  dialogues jsonb[] default array[]::jsonb[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  status text default 'draft'::text,
  user_id uuid references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.pods enable row level security;

-- Create policies
create policy "Users can view their own pods" on pods
  for select using (auth.uid() = user_id);

create policy "Users can create their own pods" on pods
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own pods" on pods
  for update using (auth.uid() = user_id);

create policy "Users can delete their own pods" on pods
  for delete using (auth.uid() = user_id);
