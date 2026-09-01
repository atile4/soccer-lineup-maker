-- Allowlist of users exempt from the MAX_TEAMS limit.
-- Add a user by inserting their auth user id; remove the row to revoke.
create table if not exists premium_users (
  user_id    uuid primary key references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

alter table premium_users enable row level security;

-- Users can only read their own premium status. Inserting is done
-- manually in the dashboard / psql, so there is no insert policy.
create policy "premium_users_self_read"
  on premium_users for select
  using (auth.uid() = user_id);
