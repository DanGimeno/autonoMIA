-- Add onboarding flag to profiles
alter table profiles add column if not exists onboarding_completed boolean default false;

-- Allow users to insert their own notifications (for onboarding welcome)
-- Policy already exists from previous migration, but ensure it's there
