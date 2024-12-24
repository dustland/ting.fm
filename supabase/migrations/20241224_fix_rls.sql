-- Drop all existing policies
drop policy if exists "Users can view their own pods" on pods;
drop policy if exists "Users can create their own pods" on pods;
drop policy if exists "Users can update their own pods" on pods;
drop policy if exists "Users can delete their own pods" on pods;

-- Re-enable RLS
alter table public.pods enable row level security;

-- Create policies
create policy "Enable read access for own pods"
  on pods for select
  using (auth.uid() = user_id);

create policy "Enable read access for published pods"
  on pods for select
  using (status = 'published');

create policy "Enable insert for own pods"
  on pods for insert
  with check (auth.uid() = user_id);

create policy "Enable update for own pods"
  on pods for update
  using (auth.uid() = user_id);

create policy "Enable delete for own pods"
  on pods for delete
  using (auth.uid() = user_id);
