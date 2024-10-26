-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table if not exists
create table if not exists public.users (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    role text default 'user' check (role in ('admin', 'user')),
    full_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Create posts table if not exists
create table if not exists public.posts (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    content text not null,
    author_id uuid references public.users(id) on delete cascade not null,
    likes integer default 0,
    comments integer default 0
);

-- Enable RLS on posts
alter table public.posts enable row level security;

-- Create favorites table if not exists
create table if not exists public.favorites (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references public.users(id) on delete cascade not null,
    item_id uuid not null,
    item_type text check (item_type in ('post', 'manual', 'standard', 'user', 'video')) not null
);

-- Enable RLS on favorites
alter table public.favorites enable row level security;

-- Create unique constraint for favorites
alter table public.favorites
    add constraint unique_user_item_favorite unique (user_id, item_id, item_type);

-- Create standards table with correct schema including file_url
create table if not exists public.standards (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    description text,
    category text not null,
    file_url text not null,
    original_filename text not null,
    uploaded_by uuid references auth.users on delete cascade not null,
    likes integer default 0
);

-- Enable RLS on standards
alter table public.standards enable row level security;

-- Create RLS policies for users
create policy "Users can view own data"
    on users for select
    using (auth.uid() = id);

create policy "Users can update own data"
    on users for update
    using (auth.uid() = id);

-- Create RLS policies for posts
create policy "Anyone can view posts"
    on posts for select
    using (true);

create policy "Authenticated users can create posts"
    on posts for insert
    with check (auth.role() = 'authenticated');

create policy "Users can update own posts"
    on posts for update
    using (auth.uid() = author_id);

create policy "Users can delete own posts"
    on posts for delete
    using (auth.uid() = author_id);

-- Create RLS policies for favorites
create policy "Users can view own favorites"
    on favorites for select
    using (auth.uid() = user_id);

create policy "Users can create own favorites"
    on favorites for insert
    with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
    on favorites for delete
    using (auth.uid() = user_id);

-- Create RLS policies for standards
create policy "Public can view standards"
    on standards for select
    using (true);

create policy "Admins can upload standards"
    on standards for insert
    with check (exists (
        select 1 from public.users 
        where id = auth.uid() 
        and role = 'admin'
    ));

create policy "Admins can update standards"
    on standards for update
    using (exists (
        select 1 from public.users 
        where id = auth.uid() 
        and role = 'admin'
    ));

create policy "Admins can delete standards"
    on standards for delete
    using (exists (
        select 1 from public.users 
        where id = auth.uid() 
        and role = 'admin'
    ));

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
    insert into public.users (id, email, full_name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'role', 'user')
    );
    return new;
end;
$$;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Create triggers for updated_at columns
create trigger update_users_updated_at
    before update on users
    for each row execute function update_updated_at_column();

create trigger update_posts_updated_at
    before update on posts
    for each row execute function update_updated_at_column();

-- Function to handle favorites count
create or replace function update_likes_count()
returns trigger as $$
declare
    item_table text;
begin
    case new.item_type
        when 'post' then item_table := 'posts';
        when 'manual' then item_table := 'manuals';
        when 'standard' then item_table := 'standards';
        else return new;
    end case;

    execute format('
        update %I
        set likes = (
            select count(*)
            from favorites
            where item_id = $1
            and item_type = $2
        )
        where id = $1
    ', item_table)
    using new.item_id, new.item_type;

    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for favorites
drop trigger if exists update_likes_count_trigger on favorites;
create trigger update_likes_count_trigger
    after insert or delete on favorites
    for each row
    execute function update_likes_count();

-- Function to increment likes
create or replace function increment_likes(post_id uuid)
returns void as $$
begin
  update posts
  set likes = likes + 1
  where id = post_id;
end;
$$ language plpgsql security definer;

-- Function to decrement likes
create or replace function decrement_likes(post_id uuid)
returns void as $$
begin
  update posts
  set likes = greatest(0, likes - 1)
  where id = post_id;
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Create indexes for better performance
create index if not exists idx_posts_author_id on posts(author_id);
create index if not exists idx_favorites_user_id on favorites(user_id);
create index if not exists idx_favorites_item_id on favorites(item_id);
create index if not exists idx_favorites_composite on favorites(user_id, item_id, item_type);