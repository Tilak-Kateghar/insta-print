# Environment Variable Checklist — InstaPrint Project

This document provides a comprehensive overview of all environment variables required across the entire InstaPrint project. Each section covers a specific component (Backend, Frontend, Supabase) with clear requirements and security guidelines.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Backend Environment Variables](#backend-environment-variables)
3. [Frontend Environment Variables](#frontend-environment-variables)
4. [Supabase Configuration](#supabase-configuration)
5. [Security Guidelines](#security-guidelines)
6. [Deployment Checklist](#deployment-checklist)

---

## Quick Reference

| Component | Required Variables | Location |
|-----------|-------------------|----------|
| Backend | DATABASE_URL, JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET | backend/.env |
| Frontend | NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_KEY | frontend/.env.local |
| Supabase | Project URL, Anon Key, Service Role Key | Supabase Dashboard |

---

## Backend Environment Variables

The backend server requires the following environment variables for proper operation. All required variables MUST be present before deployment.

### Core Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | development | Application environment (development/production) |
| PORT | No | 4000 | Port number for the Express server |
| LOG_LEVEL | No | info | Logging verbosity (debug/info/warn/error) |

### Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string (file:./dev.db for SQLite) |
| DATABASE_TYPE | No | sqlite | Database engine (sqlite/postgres) |

### Authentication & Security

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| JWT_SECRET | Yes | - | Secret key for JWT token signing (minimum 32 characters) |
| JWT_EXPIRES_IN | No | 7d | JWT token expiration time |
| COOKIE_SECURE | Yes (prod) | false | Set to true in production for HTTPS cookies |
| COOKIE_SAMESITE | Yes (prod) | lax | Cookie same-site policy (strict/lax/none) |
| BCRYPT_ROUNDS | No | 12 | Number of rounds for password hashing |

### Supabase Integration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| SUPABASE_URL | Yes | - | Supabase project URL (https://xxx.supabase.co) |
| SUPABASE_SERVICE_ROLE_KEY | Yes | - | Service role key with admin privileges (NEVER expose to frontend) |
| SUPABASE_ANON_KEY | Yes | - | Anonymous key for public client operations |
| SUPABASE_STORAGE_BUCKET | Yes | print-files | Bucket name for storing print documents |

### Payment Gateway (Future)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| RAZORPAY_KEY_ID | No | - | Razorpay API key ID |
| RAZORPAY_KEY_SECRET | No | - | Razorpay API key secret |
| PAYMENT_WEBHOOK_SECRET | No | - | Secret for verifying payment webhooks |

### Admin & Internal

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| ADMIN_KEY | No | - | Internal key for admin operations |
| RATE_LIMIT_WINDOW_MS | No | 900000 | Rate limiting time window (15 minutes) |
| RATE_LIMIT_MAX_REQUESTS | No | 100 | Maximum requests per window |

### Example Backend .env File

```bash
# Core
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=file:./dev.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_STORAGE_BUCKET=print-files

# Payment (Future)
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=

# Admin
# ADMIN_KEY=
```

---

## Frontend Environment Variables

The frontend Next.js application uses environment variables for API configuration and feature flags. All frontend variables must be prefixed with `NEXT_PUBLIC_` to be exposed to the browser.

### API Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | Yes | http://localhost:4000 | Backend API base URL |
| NEXT_PUBLIC_APP_NAME | No | InstaPrint | Application name displayed in UI |

### Supabase Client

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Yes | - | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_KEY | Yes | - | Supabase anonymous key (safe to expose) |

### Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_ENABLE_PAYMENT | No | false | Enable payment functionality |
| NEXT_PUBLIC_ENABLE_ANALYTICS | No | false | Enable analytics tracking |

### Example Frontend .env.local File

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=InstaPrint

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-anon-key

# Feature Flags
# NEXT_PUBLIC_ENABLE_PAYMENT=false
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## Supabase Configuration

Supabase provides the database, authentication, and file storage services for InstaPrint. Configuration is managed through the Supabase Dashboard.

### Required Supabase Settings

#### Project Settings

| Setting | Value | Notes |
|---------|-------|-------|
| Project URL | https://your-project-id.supabase.co | Used in frontend and backend |
| Region | Select closest to your users | Affects latency |
| Database Password | Strong random password | Used in DATABASE_URL |

#### Authentication Settings

| Setting | Value | Notes |
|---------|-------|-------|
| Site URL | http://localhost:3000 | For development |
| Redirect URLs | http://localhost:3000, https://yourdomain.com | For auth callbacks |
| MFA | Optional | Enhanced security for production |

#### Storage Settings

| Setting | Value | Notes |
|---------|-------|-------|
| Bucket Name | print-files | For storing print documents |
| Public Access | Disabled | Files accessed via signed URLs |
| Max File Size | 10MB | Per-file upload limit |

#### Row Level Security (RLS)

The following policies should be configured in Supabase:

- Users can only access their own print jobs
- Vendors can only access assigned print jobs
- Admin has full access to all records
- Service role bypasses RLS for backend operations

### Example Supabase Connection

```bash
# Backend Database URL (PostgreSQL)
postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# Frontend Supabase Config
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend Service Role Key (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Security Guidelines

### General Rules

1. **Never commit real secrets to version control**
   - Add all .env files to .gitignore
   - Use .env.example with placeholder values only
   - Rotate compromised secrets immediately

2. **Service Role Key Protection**
   - NEVER expose SUPABASE_SERVICE_ROLE_KEY to frontend
   - NEVER include in client-side bundles
   - Only use in backend server-side code

3. **Environment-Specific Configuration**
   - Development and production use different secrets
   - Use platform-managed secrets in production
   - Never use development secrets in production

4. **Secret Rotation**
   - Rotate JWT_SECRET periodically (every 90 days)
   - Rotate Supabase keys if compromised
   - Document rotation procedures

### Variable Classification

| Classification | Examples | Handling |
|---------------|----------|----------|
| Secrets | JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_SECRET | Never commit, use secure storage |
| Sensitive | DATABASE_URL, ADMIN_KEY | Restrict access, rotate regularly |
| Public | NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL | Safe to expose in browser |
| Internal | NODE_ENV, PORT, LOG_LEVEL | Configuration only |

---

## Deployment Checklist

### Pre-Deployment Verification

- [ ] All required environment variables are set
- [ ] Secrets are not committed to version control
- [ ] Production environment variables are configured
- [ ] Supabase project is created and configured
- [ ] Database migrations have been run
- [ ] Storage bucket is created with correct permissions
- [ ] RLS policies are configured

### Environment-Specific Settings

#### Development

```bash
NODE_ENV=development
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Production

```bash
NODE_ENV=production
COOKIE_SECURE=true
COOKIE_SAMESITE=strict
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Verification Commands

Check for missing required variables:

```bash
# Backend
cd backend
node -e "require('dotenv').config(); const required = ['DATABASE_URL', 'JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_STORAGE_BUCKET']; const missing = required.filter(v => !process.env[v]); if (missing.length > 0) { console.log('Missing:', missing.join(', ')); process.exit(1); } else { console.log('All required variables present'); }"
```

---

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify DATABASE_URL is correctly formatted
- Check database server is running
- Ensure network connectivity for remote databases

**JWT Authentication Errors**
- Confirm JWT_SECRET is set and consistent
- Check token expiration settings
- Verify COOKIE settings for production

**Supabase Storage Errors**
- Confirm bucket name matches configuration
- Verify service role key has storage permissions
- Check RLS policies are not blocking operations

**Frontend Cannot Connect to Backend**
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings on backend
- Ensure backend is running and accessible

---

## Related Documentation

- [README.md](../README.md) — Project overview and getting started
- [backend/README.md](../backend/README.md) — Backend-specific documentation
- [frontend/README.md](../frontend/README.md) — Frontend-specific documentation
- [Supabase Documentation](https://supabase.com/docs) — Official Supabase guides
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

