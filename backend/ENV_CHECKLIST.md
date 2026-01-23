# Backend Environment Variables Checklist

This document outlines all environment variables required by the InstaPrint Express.js backend server.

---

## Quick Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | development | Application environment |
| PORT | No | 4000 | Server port number |
| DATABASE_URL | Yes | - | Database connection string |
| JWT_SECRET | Yes | - | JWT signing secret (32+ chars) |
| JWT_EXPIRES_IN | No | 7d | Token expiration time |
| SUPABASE_URL | Yes | - | Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Yes | - | Supabase service role key |
| SUPABASE_ANON_KEY | No | - | Supabase anonymous key |
| SUPABASE_STORAGE_BUCKET | Yes | print-files | Storage bucket name |
| COOKIE_SECURE | Yes (prod) | false | HTTPS cookies only |
| COOKIE_SAMESITE | Yes (prod) | lax | Cookie same-site policy |

---

## Core Configuration

### NODE_ENV
- **Required:** Yes
- **Values:** `development`, `production`, `test`
- **Default:** `development`
- **Notes:** Controls logging level, error handling, and debug features

### PORT
- **Required:** No
- **Default:** `4000`
- **Notes:** Change in production to `80` or `443` with reverse proxy

### LOG_LEVEL
- **Required:** No
- **Default:** `info`
- **Values:** `debug`, `info`, `warn`, `error`
- **Notes:** Controls logging verbosity

---

## Database Configuration

### DATABASE_URL
- **Required:** Yes
- **Format:** 
  - SQLite: `file:./dev.db`
  - PostgreSQL: `postgresql://user:password@host:5432/database`
- **Notes:** 
  - Use SQLite for local development
  - Use PostgreSQL for production
  - Ensure file path is relative to backend directory

---

## Authentication & Security

### JWT_SECRET
- **Required:** Yes
- **Minimum Length:** 32 characters
- **Generation:** `openssl rand -base64 32`
- **Security:** 
  - NEVER commit to version control
  - Rotate every 90 days
  - Use different secrets per environment

### JWT_EXPIRES_IN
- **Required:** No
- **Default:** `7d` (7 days)
- **Format:** 
  - Seconds: `3600`
  - Minutes: `60m`
  - Hours: `24h`
  - Days: `7d`

### COOKIE_SECURE
- **Required:** Yes (Production)
- **Development:** `false`
- **Production:** `true`
- **Notes:** Only set to true when using HTTPS

### COOKIE_SAMESITE
- **Required:** Yes (Production)
- **Development:** `lax`
- **Production:** `strict`
- **Values:** `strict`, `lax`, `none`

### BCRYPT_ROUNDS
- **Required:** No
- **Default:** `12`
- **Notes:** Higher = more secure but slower

---

## Supabase Integration

### SUPABASE_URL
- **Required:** Yes
- **Format:** `https://[project-id].supabase.co`
- **Example:** `https://abc123.supabase.co`

### SUPABASE_SERVICE_ROLE_KEY
- **Required:** Yes
- **Format:** JWT token starting with `eyJ...`
- **Security:** 
  - NEVER expose to frontend
  - NEVER commit to version control
  - Only used in server-side code

### SUPABASE_ANON_KEY
- **Required:** No
- **Format:** JWT token
- **Notes:** Public key, safe for client-side use

### SUPABASE_STORAGE_BUCKET
- **Required:** Yes
- **Default:** `print-files`
- **Notes:** Must match bucket name in Supabase dashboard

---

## Payment Gateway (Future)

### RAZORPAY_KEY_ID
- **Required:** No
- **Notes:** Razorpay API key for payments
- **Format:** `rzp_test_...` or `rzp_live_...`

### RAZORPAY_KEY_SECRET
- **Required:** No
- **Security:** Never commit to version control
- **Notes:** Used for payment processing

### PAYMENT_WEBHOOK_SECRET
- **Required:** No
- **Notes:** Secret for verifying payment webhooks
- **Format:** Webhook signing secret from payment provider

---

## Admin & Internal

### ADMIN_KEY
- **Required:** No
- **Notes:** Internal key for admin API operations
- **Format:** Random string, minimum 32 characters

### RATE_LIMIT_WINDOW_MS
- **Required:** No
- **Default:** `900000` (15 minutes)
- **Notes:** Time window for rate limiting

### RATE_LIMIT_MAX_REQUESTS
- **Required:** No
- **Default:** `100`
- **Notes:** Maximum requests per window

---

## Environment-Specific Configuration

### Development (.env)

```bash
# Core
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug

# Database
DATABASE_URL=file:./dev.db

# Authentication
JWT_SECRET=dev-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
BCRYPT_ROUNDS=4

# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJ...
# SUPABASE_ANON_KEY=
SUPABASE_STORAGE_BUCKET=print-files

# Admin
# ADMIN_KEY=
```

### Production (.env)

```bash
# Core
NODE_ENV=production
PORT=4000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=prod-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
COOKIE_SECURE=true
COOKIE_SAMESITE=strict
BCRYPT_ROUNDS=12

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_STORAGE_BUCKET=print-files

# Payment (Future)
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=
# PAYMENT_WEBHOOK_SECRET=

# Admin
# ADMIN_KEY=
```

---

## Setup Instructions

1. Navigate to backend directory:

```bash
cd backend
```

2. Copy example environment file:

```bash
cp .env.example .env
```

3. Edit with your configuration:

```bash
nano .env
```

4. Install dependencies:

```bash
npm install
```

5. Initialize database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. Start development server:

```bash
npm run dev
```

---

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters
- [ ] COOKIE_SECURE is `true` in production
- [ ] COOKIE_SAMESITE is `strict` in production
- [ ] Service role key is never committed to git
- [ ] .env file is in .gitignore
- [ ] Secrets are rotated every 90 days
- [ ] BCRYPT_ROUNDS is at least 10 in production
- [ ] Rate limiting is configured
- [ ] CORS is configured for allowed origins

---

## Related Files

- [Root ENV_CHECKLIST.md](../ENV_CHECKLIST.md) — Complete project environment overview
- [frontend/ENV_CHECKLIST.md](../frontend/ENV_CHECKLIST.md) — Frontend environment variables
- [supabase/ENV_CHECKLIST.md](../supabase/ENV_CHECKLIST.md) — Supabase configuration
- [README.md](../README.md) — Project overview
- [package.json](./package.json) — Backend dependencies
- [prisma/schema.prisma](./prisma/schema.prisma) — Database schema

