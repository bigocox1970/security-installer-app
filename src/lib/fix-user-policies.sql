-- Drop existing policies if they exist
drop policy if exists "Users can view own data" on users;
drop policy if exists "Users can view own user data" on users;
drop policy if exists "Users can update own data" on users;
drop policy if exists "Users can update own user data" on users;
drop policy if exists "Admins can view all users" on users;
drop policy if exists "Admins can update all users" on users;
drop policy if exists "Admin full access" on users;

-- Create new policies
create policy "Users can view own data"
  on users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on users for update
  using (auth.uid() = id);

create policy "Admin view all users"
  on users for select
  using (
    exists (
      select 1 from users
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admin manage all users"
  on users for all
  using (
    exists (
      select 1 from users
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Grant necessary permissions
grant all on users to authenticated;