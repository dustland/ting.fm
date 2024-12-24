-- Drop all existing policies
drop policy if exists "Users can view their own pods" on pods;
drop policy if exists "Users can create their own pods" on pods;
drop policy if exists "Users can update their own pods" on pods;
drop policy if exists "Users can delete their own pods" on pods;
drop policy if exists "Enable read access for own pods" on pods;
drop policy if exists "Enable read access for published pods" on pods;

-- Re-enable RLS
alter table public.pods enable row level security;

-- Single policy with proper AND/OR logic for read access
create policy "pod_read_policy" on pods
  for select using (
    -- User can see their own pods OR published pods, but not other users' unpublished pods
    (auth.uid() = user_id) OR 
    (status = 'published' AND auth.uid() != user_id)
  );

-- Other policies remain simple
create policy "pod_insert_policy" on pods
  for insert with check (auth.uid() = user_id);

create policy "pod_update_policy" on pods
  for update using (auth.uid() = user_id);

create policy "pod_delete_policy" on pods
  for delete using (auth.uid() = user_id);
