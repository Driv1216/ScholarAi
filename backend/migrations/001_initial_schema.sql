create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  auth_provider text not null default 'email',
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null unique,
  full_name text,
  nationality text,
  current_country text,
  degree_level text check (degree_level in ('bachelors', 'masters', 'phd', 'other')),
  field_of_study text,
  cgpa numeric(4,2),
  income_range text,
  target_countries text[] default '{}',
  target_degrees text[] default '{}',
  documents_available jsonb default '[]',
  updated_at timestamptz not null default now()
);

create table public.scholarship_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_url text not null,
  source_type text check (source_type in ('university', 'government', 'ngo', 'foundation', 'portal')),
  active boolean default true,
  last_crawled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.scholarship_sources(id) on delete set null,
  name text not null,
  provider text not null,
  official_url text not null,
  country text,
  degree_level text,
  fields text[] default '{}',
  award_amount text,
  deadline date,
  application_url text,
  trust_score integer default 50 check (trust_score between 0 and 100),
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'verified', 'expired')),
  verified_by uuid references public.users(id) on delete set null,
  last_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.scholarship_criteria (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid references public.scholarships(id) on delete cascade not null,
  criterion_type text not null,
  operator text not null check (operator in ('eq', 'gte', 'lte', 'in', 'contains')),
  value text not null,
  required boolean default true
);

create table public.saved_scholarships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  scholarship_id uuid references public.scholarships(id) on delete cascade not null,
  match_score integer check (match_score between 0 and 100),
  match_reason text,
  saved_at timestamptz not null default now(),
  unique(user_id, scholarship_id)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  scholarship_id uuid references public.scholarships(id) on delete cascade not null,
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'submitted', 'accepted', 'rejected')),
  deadline_reminder date,
  applied_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, scholarship_id)
);

create table public.application_tasks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade not null,
  task_name text not null,
  task_type text check (task_type in ('document', 'essay', 'recommendation', 'test', 'form', 'other')),
  completed boolean default false,
  due_date date
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade not null,
  doc_type text not null,
  storage_path text,
  uploaded boolean default false,
  created_at timestamptz not null default now()
);

create table public.verification_logs (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid references public.scholarships(id) on delete cascade not null,
  action text not null check (action in ('approved', 'rejected', 'edited', 'flagged')),
  changed_fields text,
  verified_by uuid references public.users(id) on delete set null,
  verified_at timestamptz not null default now()
);

create table public.crawl_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.scholarship_sources(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  pages_crawled integer default 0,
  scholarships_found integer default 0,
  error_log text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null check (type in ('deadline', 'new_match', 'verification', 'system')),
  message text not null,
  read boolean default false,
  created_at timestamptz not null default now()
);

create index on public.scholarships(status);
create index on public.scholarships(deadline);
create index on public.scholarships(country);
create index on public.saved_scholarships(user_id);
create index on public.applications(user_id);
create index on public.notifications(user_id, read);

alter table public.users enable row level security;
alter table public.student_profiles enable row level security;
alter table public.saved_scholarships enable row level security;
alter table public.applications enable row level security;
alter table public.application_tasks enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;

create policy "users: own row" on public.users for all using (auth.uid() = id);
create policy "profiles: own row" on public.student_profiles for all using (auth.uid() = user_id);
create policy "saved: own rows" on public.saved_scholarships for all using (auth.uid() = user_id);
create policy "applications: own rows" on public.applications for all using (auth.uid() = user_id);
create policy "tasks: own rows" on public.application_tasks for all using (
  auth.uid() = (select user_id from public.applications where id = application_id)
);
create policy "documents: own rows" on public.documents for all using (
  auth.uid() = (select user_id from public.applications where id = application_id)
);
create policy "notifications: own rows" on public.notifications for all using (auth.uid() = user_id);

alter table public.scholarships enable row level security;
create policy "scholarships: public read verified" on public.scholarships
  for select using (status = 'verified');

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, auth_provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
