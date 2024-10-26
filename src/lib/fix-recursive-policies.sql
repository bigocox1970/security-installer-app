-- First, temporarily disable RLS to avoid recursion during setup
alter table users disable row level security;

-- Drop existing policies
drop policy if exists "Users can view own data" on users;
drop policy if exists "Users can update own data" on users;
drop policy if exists "Admin view all users" on users;
drop policy if exists "Admin manage all users" on users;

-- Create a security definer function to check admin status
create or replace function is_admin(user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from users
    where id = user_id
    and role = 'admin'
  );
$$;

-- Create new policies using the security definer function
create policy "Users can view own data"
  on users for select
  using (
    auth.uid() = id 
    or is_admin(auth.uid())
  );

create policy "Users can update own data"
  on users for update
  using (
    auth.uid() = id 
    or is_admin(auth.uid())
  );

create policy "Admin insert users"
  on users for insert
  with check (is_admin(auth.uid()));

create policy "Admin delete users"
  on users for delete
  using (is_admin(auth.uid()));

-- Re-enable RLS
alter table users enable row level security;

-- Grant necessary permissions
grant all on users to authenticated;
grant execute on function is_admin to authenticated;