-- Set up storage policies for audio bucket
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

-- Allow public read access to audio files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'audio' );

-- Allow authenticated uploads to audio bucket
create policy "Authenticated users can upload audio files"
on storage.objects for insert
with check (
  bucket_id = 'audio'
  and auth.role() = 'authenticated'
);

-- Allow service role to do anything
create policy "Service role has full access"
on storage.objects
using ( auth.jwt()->>'role' = 'service_role' )
with check ( auth.jwt()->>'role' = 'service_role' );
