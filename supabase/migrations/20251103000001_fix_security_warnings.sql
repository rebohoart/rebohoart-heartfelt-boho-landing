-- Fix Security Warnings
-- This migration addresses:
-- 1. Strengthens user_roles RLS policies to prevent enumeration attacks
-- 2. Enables leaked password protection

-- ==============================================
-- Part 1: Strengthen user_roles RLS policies
-- ==============================================

-- Drop existing user_roles policies to recreate them with stronger security
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate the SELECT policy with explicit restrictions
-- This policy ensures users can ONLY view their own roles, with no possibility of enumeration
CREATE POLICY "Users can view only their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  -- Strict check: user can only see their own user_id rows
  user_id = auth.uid()
);

-- Policy for admins to manage all roles
-- This uses the security definer function to safely check admin status
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  -- Only users with admin role can manage all user_roles
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  -- Double check on insert/update
  public.has_role(auth.uid(), 'admin')
);

-- Add an additional security measure: prevent users from inserting their own roles
-- Only admins should be able to assign roles
CREATE POLICY "Prevent self-role-assignment"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only admins can insert roles
  public.has_role(auth.uid(), 'admin')
);

-- ==============================================
-- Part 2: Enable Leaked Password Protection
-- ==============================================

-- Enable leaked password protection in Supabase Auth
-- This feature checks passwords against known leaked password databases
-- and prevents users from using compromised passwords

-- Update auth configuration to enable leaked password protection
DO $$
BEGIN
  -- Enable leaked password protection
  -- This setting prevents users from using passwords that appear in breach databases
  UPDATE auth.config
  SET
    leaked_password_protection = true
  WHERE true;

  -- If the config table doesn't exist or is empty, we'll handle it differently
  -- The auth.config approach may not work in all Supabase versions
  -- In that case, this should be configured via Supabase Dashboard:
  -- Dashboard -> Authentication -> Policies -> Enable "Leaked password protection"

  -- Log that this needs manual verification
  RAISE NOTICE 'Leaked password protection setting attempted. Please verify in Supabase Dashboard: Authentication -> Policies -> Enable "Leaked password protection"';

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'auth.config table not found. Please enable leaked password protection manually in Supabase Dashboard: Authentication -> Policies -> Enable "Leaked password protection"';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not update auth.config automatically. Please enable leaked password protection manually in Supabase Dashboard: Authentication -> Policies -> Enable "Leaked password protection"';
END $$;

-- Add a comment to document the security enhancement
COMMENT ON TABLE public.user_roles IS
'User roles table with strict RLS policies. Users can only view their own roles, and only admins can assign/modify roles. This prevents role enumeration attacks.';
