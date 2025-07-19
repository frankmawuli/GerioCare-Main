# UnifiedCare Authentication Setup

## Environment Configuration

To set up the authentication system, you need to configure your Supabase credentials.

### 1. Create a `.env` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Development Mode (optional)
VITE_DEVELOPMENT_MODE=false
```

### 2. Get your Supabase credentials:

1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to Settings > API in your project dashboard
3. Copy the "Project URL" and "anon public" key
4. Paste them in your `.env` file

### 3. Database Setup

The application includes Supabase migrations that need to be applied:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link your project (you'll need your project ref and access token)
supabase link --project-ref your-project-ref

# Apply the migrations
supabase db push
```

### 4. Authentication Features

The authentication system includes:

- **User Registration**: Users can register as older adults, caregivers, or therapists
- **User Login**: Secure login with email and password
- **Role-based Access Control**: Different dashboards based on user roles
- **Protected Routes**: Automatic redirection for unauthorized access
- **Error Handling**: Comprehensive error messages and loading states
- **Session Management**: Automatic session persistence and cleanup

### 5. User Roles

- **older_adult**: Primary care recipients with subscription management
- **caregiver**: Professional caregivers managing assigned clients
- **therapist**: Healthcare professionals providing therapy services
- **admin**: System administrators with full access

### 6. Testing the Authentication

1. Start the development server: `npm run dev`
2. Navigate to `/register` to create a new account
3. Try logging in with your credentials
4. Test different user roles and protected routes

### 7. Troubleshooting

**Common Issues:**

1. **"Missing Supabase environment variables"**
   - Ensure your `.env` file exists and contains the correct credentials
   - Check that the file is in the root directory

2. **"Failed to create user account"**
   - Verify your Supabase project has authentication enabled
   - Check that the database migrations have been applied

3. **"Role not authorized"**
   - Ensure the user profile was created correctly in the database
   - Check that the role field is properly set

4. **"Invalid email or password"**
   - Verify the user exists in your Supabase auth system
   - Check that the password meets the minimum requirements (6 characters)

### 8. Security Notes

- Passwords are hashed and stored securely by Supabase
- All authentication requests use HTTPS
- Session tokens are automatically managed
- Row-level security policies protect user data
- Error messages are generic for security (don't reveal specific details) 