-- Add admin role to the user catarinarebocho30@gmail.com
INSERT INTO public.user_roles (user_id, role) 
VALUES ('3ab8c1d4-0691-4a17-8fb4-a0d432c8e0e9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;