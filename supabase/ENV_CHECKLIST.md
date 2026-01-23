# Supabase Environment Configuration Checklist

This document provides a comprehensive guide to configuring Supabase for the InstaPrint project. It complements the `config.toml` file with additional context, security guidelines, and best practices.

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Database Configuration](#database-configuration)
3. [Authentication Settings](#authentication-settings)
4. [Storage Configuration](#storage-configuration)
5. [API & Security](#api--security)
6. [Edge Functions](#edge-functions)
7. [Environment-Specific Settings](#environment-specific-settings)
8. [Troubleshooting](#troubleshooting)

---

## Project Setup

### Creating a New Supabase Project

1. Navigate to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Configure the following:

| Setting | Value for InstaPrint | Notes |
|---------|---------------------|-------|
| Name | insta-print | Project display name |
| Organization | Your organization | Select appropriate org |
| Database Password | Strong random password | Save securely |
| Region | Closest to your users | Affects latency |
| Pricing Tier | Free (start) | Upgrade as needed |

### Project Credentials

After creation, gather these credentials from Project Settings:

| Credential | Location | Usage |
|------------|----------|-------|
| Project URL | Settings → API | Frontend & Backend |
| Anon Key | Settings → API | Frontend (public) |
| Service Role Key | Settings → API | Backend (secret) |
| JWT Secret | Settings → JWT | Auth verification |

---

## Database Configuration

### Connection String

**Development (Local)**
```
postgresql://postgres:password@localhost:54322/postgres
```

**Production (Remote)**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

### Required Database Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Major Version | 17 | Must match local development |
| Max Rows | 1000 | Payload size limit per request |
| Pool Mode | transaction | Connection pooling strategy |
| Default Pool Size | 20 | Connections per user |
| Max Client Conn | 100 | Total client connections |

### Seed Data

The project uses `seed.sql` for initial database seeding. Configure in `config.toml`:

```toml
[db.seed]
enabled = true
sql_paths = ["./seed.sql"]
```

---

## Authentication Settings

### Site URL Configuration

| Environment | Site URL | Purpose |
|-------------|----------|---------|
| Development | http://127.0.0.1:3000 | Local testing |
| Staging | https://staging.yourdomain.com | Pre-production |
| Production | https://yourdomain.com | Live environment |

### Redirect URLs

Configure allowed redirect URLs for OAuth and auth callbacks:

```toml
[auth]
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = [
  "https://127.0.0.1:3000",
  "http://localhost:3000"
]
```

### JWT Settings

| Setting | Development | Production |
|---------|-------------|------------|
| JWT Expiry | 3600 (1 hour) | 3600 (1 hour) |
| Refresh Token Rotation | Enabled | Enabled |
| Token Reuse Interval | 10 seconds | 10 seconds |
| Minimum Password Length | 6 | 8+ |

### Rate Limiting

| Action | Limit per Hour | Notes |
|--------|----------------|-------|
| Email Sent | 2 | Requires SMTP enabled |
| SMS Sent | 30 | Requires SMS provider |
| Sign Ups/Ins | 30 | Per IP address |
| OTP Verifications | 30 | Per IP address |
| Token Refreshes | 150 | Per 5 min per IP |

---

## Storage Configuration

### Bucket Setup

Create the following storage buckets:

| Bucket Name | Public Access | Max File Size | Purpose |
|-------------|---------------|---------------|---------|
| print-files | Private | 50MiB | Customer print documents |
| avatars | Public | 5MiB | User profile pictures |

### Storage Bucket Configuration

```toml
[storage]
enabled = true
file_size_limit = "50MiB"

[storage.buckets.print-files]
public = false
file_size_limit = "50MiB"
allowed_mime_types = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]
```

### Row Level Security (RLS)

Apply the following RLS policies to the `print-files` bucket:

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Users can only access their own files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'print-files' AND owner = auth.uid() );

-- Users can only view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'print-files' AND owner = auth.uid() );

-- Vendors can view files for their jobs
CREATE POLICY "Vendors can view job files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'print-files' AND
  exists (
    SELECT 1 FROM print_jobs
    WHERE print_jobs.vendor_id = auth.uid()
    AND print_jobs.document_path LIKE '%' || storage.foldername.name || '%'
  )
);
```

---

## API & Security

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| SUPABASE_URL | Yes | Project URL |
| SUPABASE_ANON_KEY | Yes | Public anonymous key |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Admin privileges (secret) |
| SUPABASE_STORAGE_BUCKET | Yes | Default bucket name |

### Security Checklist

- [ ] Anon key is safe to expose in frontend code
- [ ] Service role key is NEVER exposed to frontend
- [ ] RLS policies are enabled on all tables
- [ ] Storage buckets have appropriate access policies
- [ ] API rate limits are configured
- [ ] JWT secret is strong and unique
- [ ] MFA is enabled for admin accounts (production)

### Network Restrictions

```toml
[db.network_restrictions]
enabled = false  # Set to true in production
allowed_cidrs = ["0.0.0.0/0"]  # Configure for production
```

---

## Edge Functions

### Cleanup Old Print Files Function

The project includes an edge function for automatic cleanup of old print files.

**Function Location:** `supabase/functions/cleanup-old-print-files/`

**Configuration:**
```toml
[functions.cleanup-old-print-files]
enabled = true
verify_jwt = true
import_map = "./functions/cleanup-old-print-files/deno.json"
entrypoint = "./functions/cleanup-old-print-files/index.ts"
```

**Environment Variables for Function:**
```bash
# Add to backend/.env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Deploying Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy cleanup-old-print-files

# Set environment variables
supabase secrets set --env-file .env
```

---

## Environment-Specific Settings

### Development Configuration

```toml
# supabase/config.toml (Development)
project_id = "insta-print"

[api]
port = 54321

[db]
port = 54322
major_version = 17

[auth]
site_url = "http://127.0.0.1:3000"
enable_signup = true

[studio]
enabled = true
port = 54323

[storage]
enabled = true
file_size_limit = "50MiB"
```

### Production Configuration

```toml
# supabase/config.toml (Production - Recommended Settings)
project_id = "insta-print"

[api]
port = 443
max_rows = 1000

[db]
port = 5432
major_version = 17

[db.pooler]
enabled = true
pool_mode = "transaction"
default_pool_size = 20

[auth]
site_url = "https://yourdomain.com"
additional_redirect_urls = ["https://yourdomain.com"]
jwt_expiry = 3600
enable_refresh_token_rotation = true
secure_password_change = true
password_requirements = "lower_upper_letters_digits_symbols"

[db.network_restrictions]
enabled = true
allowed_cidrs = ["your-server-ip/32"]

[storage]
enabled = true
file_size_limit = "50MiB"

[auth.rate_limit]
email_sent = 10
sms_sent = 100
sign_in_sign_ups = 50
```

---

## Troubleshooting

### Common Issues

**Connection Refused**
- Verify project is not paused
- Check IP allowlist settings
- Confirm credentials are correct

**Authentication Errors**
- Check site URL matches redirect URLs
- Verify JWT secret configuration
- Review RLS policies

**Storage Upload Failures**
- Confirm bucket exists and is configured
- Check file size limits
- Verify RLS policies allow operation

**Edge Function Errors**
- Check function logs in Supabase Dashboard
- Verify environment variables are set
- Review function timeout settings

### Useful Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset local database
supabase db reset

# View logs
supabase logs

# Check status
supabase status

# Link to remote project
supabase link --project-ref your-project-ref
```

---

## Related Documentation

- [Root ENV_CHECKLIST.md](../ENV_CHECKLIST.md) — Complete project environment overview
- [backend/ENV_CHECKLIST.md](../backend/ENV_CHECKLIST.md) — Backend environment variables
- [frontend/ENV_CHECKLIST.md](../frontend/ENV_CHECKLIST.md) — Frontend environment variables
- [README.md](../README.md) — Project overview
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase API Reference](https://supabase.com/docs/reference/javascript/introduction)

