-- Drop existing views and policy
drop view if exists published_pods;
drop view if exists pods_view;
drop policy if exists "pod_access_policy" on pods;

-- Create view for discover page
create view published_pods as
select *
from pods
where status = 'published';

-- Enable RLS on base table
alter table pods enable row level security;

-- RLS policy for user workspace
create policy "pod_access_policy" on pods
  for all using (auth.uid() = user_id);

-- Grant access to published_pods view
grant select on published_pods to authenticated, anon;
