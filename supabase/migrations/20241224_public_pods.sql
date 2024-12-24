-- Drop the old select policy
drop policy if exists "Users can view their own pods" on pods;

-- Create new policies for pod visibility
create policy "Users can view their own pods" on pods
  for select using (
    auth.uid() = user_id
  );

create policy "Anyone can view published pods" on pods
  for select using (
    status = 'published'
  );
