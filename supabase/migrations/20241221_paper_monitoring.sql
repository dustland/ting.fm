-- Create monitored_topics table
create table if not exists public.monitored_topics (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    query text not null,
    last_checked timestamp with time zone not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create papers table
create table if not exists public.papers (
    id uuid primary key default gen_random_uuid(),
    arxiv_id text unique not null,
    title text not null,
    authors text[] not null,
    summary text not null,
    published_date timestamp with time zone not null,
    pdf_link text not null,
    topic_id uuid references public.monitored_topics(id) on delete cascade,
    processed boolean default false,
    podcast_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.monitored_topics enable row level security;
alter table public.papers enable row level security;

-- Create policies
create policy "Enable read access for authenticated users" on public.monitored_topics
    for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on public.monitored_topics
    for insert with check (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users" on public.papers
    for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on public.papers
    for insert with check (auth.role() = 'authenticated');
