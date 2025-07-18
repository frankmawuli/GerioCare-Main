/*
  # Create function to set up admin user

  1. Function
    - `setup_admin_user()` - Creates an admin user for testing
    - Can be called after authentication is set up

  2. Usage
    - This function should be called once to create the initial admin user
    - The admin can then manage other users through the application
*/

-- Function to create admin user
CREATE OR REPLACE FUNCTION setup_admin_user(
  admin_email text DEFAULT 'admin@unifiedcare.com',
  admin_password text DEFAULT 'admin123',
  admin_first_name text DEFAULT 'System',
  admin_last_name text DEFAULT 'Administrator'
)
RETURNS json AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- This function should be called from the application after user signup
  -- For now, we'll create a placeholder that can be updated when a real admin signs up
  
  result := json_build_object(
    'message', 'Admin setup function created. Call this after creating admin user through signup.',
    'admin_email', admin_email,
    'instructions', 'Sign up through the app with admin credentials, then update the user role to admin in the database.'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to admin (can be called by existing admin)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email text)
RETURNS json AS $$
DECLARE
  target_user_id uuid;
  current_user_role user_role;
  result json;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM users
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RETURN json_build_object('error', 'Only admins can promote users');
  END IF;
  
  -- Find target user
  SELECT id INTO target_user_id
  FROM users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  -- Update user role
  UPDATE users
  SET role = 'admin'
  WHERE id = target_user_id;
  
  result := json_build_object(
    'success', true,
    'message', 'User promoted to admin successfully',
    'user_id', target_user_id
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;