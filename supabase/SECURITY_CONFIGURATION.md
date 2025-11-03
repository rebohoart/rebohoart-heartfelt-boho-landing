# Supabase Security Configuration Guide

This document provides instructions for configuring security features in Supabase that cannot be set via SQL migrations alone.

## Leaked Password Protection

The migration `20251103000001_fix_security_warnings.sql` attempts to enable leaked password protection programmatically, but this feature typically requires manual configuration in the Supabase Dashboard.

### How to Enable Leaked Password Protection Manually

1. **Access Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `rebohoart-heartfelt-boho-landing`

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Go to "Policies" or "Settings" tab

3. **Enable Leaked Password Protection**
   - Look for the "Leaked password protection" toggle or checkbox
   - Enable this setting
   - Save the configuration

### What This Feature Does

Leaked password protection checks user passwords against databases of known compromised passwords (like Have I Been Pwned). When enabled:
- Users cannot set passwords that appear in known data breaches
- This significantly improves account security
- Users will be prompted to choose a different password if theirs is compromised

### Alternative: Configure via Supabase CLI

If you have the Supabase CLI installed, you can also enable this via configuration:

```bash
# In your Supabase config file (supabase/config.toml), add or update:
[auth]
enable_leaked_password_protection = true
```

Then run:
```bash
supabase db push
```

## User Roles Security

The migration `20251103000001_fix_security_warnings.sql` has automatically applied the following security enhancements:

### RLS Policies for user_roles Table

1. **Users can view only their own roles**
   - Users can only SELECT rows where `user_id = auth.uid()`
   - Prevents role enumeration attacks
   - No user can discover other users' roles

2. **Admins can manage all user roles**
   - Only users with the 'admin' role can INSERT, UPDATE, or DELETE user roles
   - Uses a secure SECURITY DEFINER function for role checking

3. **Prevention of self-role-assignment**
   - Regular users cannot assign roles to themselves
   - Only admins can assign roles
   - Prevents privilege escalation attacks

### Security Best Practices

- **Never expose user_roles data in public APIs**: Even though RLS protects the table, avoid creating public-facing endpoints that query user roles
- **Audit admin actions**: Consider adding logging for all role changes
- **Use the has_role() function**: When checking permissions, always use the `public.has_role()` security definer function
- **Regularly review admin users**: Periodically audit who has admin access

## Verification

After applying the migration and configuring leaked password protection, verify the security settings:

### Test RLS Policies

```sql
-- As a regular user, try to view other users' roles (should return empty)
SELECT * FROM user_roles WHERE user_id != auth.uid();

-- As a regular user, try to view your own roles (should work)
SELECT * FROM user_roles WHERE user_id = auth.uid();

-- As a regular user, try to insert a role for yourself (should fail)
INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'admin');
```

### Test Leaked Password Protection

1. Try to sign up or change password with a known compromised password (e.g., "password123")
2. The system should reject it with an error message
3. Try with a strong, unique password - it should be accepted

## Support

If you encounter issues with these security configurations:
- Check Supabase documentation: https://supabase.com/docs/guides/auth
- Review migration logs for any errors
- Contact Supabase support if features are not available in your plan
