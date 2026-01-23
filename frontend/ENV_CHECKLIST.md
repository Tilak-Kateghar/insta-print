# Frontend Environment Variables Checklist

This document outlines all environment variables required by the InstaPrint Next.js frontend application.

---

## Quick Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | Yes | http://localhost:4000 | Backend API base URL |
| NEXT_PUBLIC_SUPABASE_URL | Yes | - | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_KEY | Yes | - | Supabase anonymous key |
| NEXT_PUBLIC_APP_NAME | No | InstaPrint | Application name |

---

## Required Variables

### API Configuration

**NEXT_PUBLIC_API_URL**
- Description: Base URL for the backend API server
- Development: `http://localhost:4000`
- Production: `https://api.yourdomain.com`
- Type: Public (safe to expose in browser)

### Supabase Configuration

**NEXT_PUBLIC_SUPABASE_URL**
- Description: Supabase project URL
- Format: `https://[project-id].supabase.co`
- Type: Public (safe to expose in browser)

**NEXT_PUBLIC_SUPABASE_KEY**
- Description: Supabase anonymous key for client-side operations
- Format: JWT token starting with `eyJ...`
- Type: Public (safe to expose in browser)
- Note: This is the anon key, NOT the service role key

---

## Optional Variables

### Application Settings

**NEXT_PUBLIC_APP_NAME**
- Description: Display name for the application
- Default: `InstaPrint`
- Used in: Browser title, headers, metadata

### Feature Flags

**NEXT_PUBLIC_ENABLE_PAYMENT**
- Description: Enable payment-related UI and functionality
- Default: `false`
- Type: Boolean

**NEXT_PUBLIC_ENABLE_ANALYTICS**
- Description: Enable analytics and tracking
- Default: `false`
- Type: Boolean

---

## Environment-Specific Configuration

### Development (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_NAME=InstaPrint (Dev)
# NEXT_PUBLIC_ENABLE_PAYMENT=false
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Production (.env.production)

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_NAME=InstaPrint
# NEXT_PUBLIC_ENABLE_PAYMENT=true
# NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## Setup Instructions

1. Copy the example environment file:

```bash
cd frontend
cp .env.example .env.local
```

2. Edit `.env.local` with your configuration:

```bash
nano .env.local
```

3. Start the development server:

```bash
npm run dev
```

---

## Security Notes

- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Only use the Supabase anon key (safe to expose)
- Never put the Supabase service role key here
- Never put backend secrets in frontend environment files

---

## Related Files

- [Root ENV_CHECKLIST.md](../ENV_CHECKLIST.md) — Complete project environment overview
- [backend/ENV_CHECKLIST.md](../backend/ENV_CHECKLIST.md) — Backend environment variables
- [supabase/config.toml](../supabase/config.toml) — Supabase CLI configuration

