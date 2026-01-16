# Environment Variables Checklist

## REQUIRED (All Environments)

- DATABASE_URL
- JWT_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_STORAGE_BUCKET

## REQUIRED (Production Only)

- NODE_ENV=production
- COOKIE_SECURE=true
- COOKIE_SAMESITE=strict
- PAYMENT_WEBHOOK_SECRET
- ADMIN_KEY

## OPTIONAL / DEFAULTED

- PORT (default: 4000)
- JWT_EXPIRES_IN (default: 7d)

## NOTES

- `SUPABASE_SERVICE_ROLE_KEY` MUST NEVER be exposed to frontend
- `.env` is NEVER committed
- Production uses platform secrets, not `.env`