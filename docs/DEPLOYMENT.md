# Deployment Guide

Complete guide to deploying the SET Interactive Roadmap Platform to production.

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Vercel Deployment](#vercel-deployment)
- [Supabase Production Setup](#supabase-production-setup)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [Database Migrations](#database-migrations)
- [Post-Deployment Verification](#post-deployment-verification)
- [Monitoring and Alerts](#monitoring-and-alerts)
- [Rollback Procedures](#rollback-procedures)
- [Maintenance Windows](#maintenance-windows)

---

## Pre-Deployment Checklist

Complete these items before deploying to production:

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Code reviewed and approved
- [ ] Build succeeds locally (`pnpm build`)

### Security
- [ ] Environment variables configured (not in code)
- [ ] API keys rotated for production
- [ ] RLS policies verified
- [ ] CORS configured for production domain

### Database
- [ ] Migrations tested on staging
- [ ] Seed data appropriate for production
- [ ] Backups configured
- [ ] Connection pool sized correctly

### Documentation
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] User guide ready

---

## Vercel Deployment

### First-Time Setup

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   
   | Setting | Value |
   |---------|-------|
   | Framework Preset | Vite |
   | Root Directory | ./ |
   | Build Command | pnpm build |
   | Output Directory | dist |
   | Install Command | pnpm install |

4. **Add Environment Variables**
   
   Go to Settings → Environment Variables and add:
   
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ANTHROPIC_API_KEY=sk-ant-...
   VITE_APP_URL=https://your-domain.com
   VITE_APP_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Automatic Deployments

Once configured, Vercel automatically deploys:

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | your-domain.com |
| `develop` | Preview | develop-xxx.vercel.app |
| Pull Requests | Preview | pr-xxx.vercel.app |

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Deploy preview
vercel
```

---

## Supabase Production Setup

### Upgrade to Pro (Recommended)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → Billing
4. Upgrade to Pro ($25/month)

### Pro Tier Benefits

| Feature | Free | Pro |
|---------|------|-----|
| Database size | 500 MB | 8 GB |
| Bandwidth | 2 GB | 50 GB |
| Realtime connections | 200 | 500 |
| Edge Function invocations | 500K | 2M |
| Daily backups | ❌ | ✅ |
| Point-in-time recovery | ❌ | ✅ |
| Email support | ❌ | ✅ |

### Production Configuration

1. **Enable Daily Backups**
   - Settings → Database → Backups
   - Enable automatic backups

2. **Configure Connection Pooling**
   - Settings → Database → Connection Pooling
   - Enable PgBouncer (Transaction mode)

3. **Set Realtime Quotas**
   - Settings → Realtime
   - Review and adjust if needed

4. **Enable Logging**
   - Settings → Logs
   - Configure log retention

---

## Environment Variables

### Production Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase admin key (Edge Functions only) |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `VITE_APP_URL` | ✅ | Production URL |
| `VITE_APP_ENV` | ✅ | Set to "production" |
| `VITE_SENTRY_DSN` | ❌ | Error tracking |

### Setting Variables in Vercel

1. Go to Project → Settings → Environment Variables
2. Add each variable
3. Set scope: Production, Preview, or both
4. Click Save

### Vercel CLI Method

```bash
# Add variable
vercel env add ANTHROPIC_API_KEY production

# List variables
vercel env ls

# Pull to local
vercel env pull .env.local
```

---

## Custom Domain Setup

### Add Domain in Vercel

1. Go to Project → Settings → Domains
2. Enter your domain (e.g., `roadmap.set.com`)
3. Click "Add"

### Configure DNS

Add these DNS records at your registrar:

**For apex domain (set-roadmap.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For subdomain (roadmap.set.com):**
```
Type: CNAME
Name: roadmap
Value: cname.vercel-dns.com
```

### SSL Certificate

- Vercel automatically provisions SSL
- Certificate issued within ~10 minutes
- Automatic renewal

### Update Supabase CORS

1. Go to Supabase → Settings → API
2. Add your domain to allowed origins:
   ```
   https://roadmap.set.com
   https://www.roadmap.set.com
   ```

### Update Environment Variables

```
VITE_APP_URL=https://roadmap.set.com
```

---

## Database Migrations

### Running Migrations

```bash
# Link to production project
supabase link --project-ref <production-ref>

# Review pending migrations
supabase db diff

# Apply migrations
supabase db push

# Verify
supabase db remote list
```

### Migration Best Practices

1. **Test First**: Always test migrations on staging
2. **Backup Before**: Create backup before major migrations
3. **Small Changes**: Prefer small, incremental migrations
4. **Reversible**: Write migrations that can be rolled back

### Creating Rollback Scripts

```sql
-- Migration: 20240115_add_column.sql
ALTER TABLE capabilities ADD COLUMN new_field TEXT;

-- Rollback: 20240115_add_column_rollback.sql
ALTER TABLE capabilities DROP COLUMN new_field;
```

---

## Post-Deployment Verification

### Automated Checks

```bash
# Health check endpoint
curl https://roadmap.set.com/api/health

# Expected response
{"status": "ok", "database": "connected", "version": "1.0.0"}
```

### Manual Verification Checklist

- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard displays data
- [ ] Real-time updates working
- [ ] AI chat responds
- [ ] Can create/edit capabilities
- [ ] Activity log recording

### Smoke Tests

```bash
# Run e2e tests against production
PLAYWRIGHT_BASE_URL=https://roadmap.set.com pnpm test:e2e
```

---

## Monitoring and Alerts

### Vercel Analytics

Built-in analytics available at:
- Project → Analytics

Monitors:
- Page views
- Web Vitals (LCP, FID, CLS)
- Error rates
- Geographic distribution

### Error Tracking (Sentry)

1. Create project at [sentry.io](https://sentry.io)
2. Add DSN to environment variables
3. Install SDK:
   ```bash
   pnpm add @sentry/react
   ```
4. Initialize in `main.tsx`:
   ```typescript
   import * as Sentry from '@sentry/react';
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.VITE_APP_ENV,
   });
   ```

### Supabase Monitoring

- Dashboard → Reports → API
- Dashboard → Logs → Postgres
- Dashboard → Logs → Edge Functions

### Uptime Monitoring

Recommended services:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://pingdom.com)
- [Better Uptime](https://betteruptime.com)

Configure to check:
- `https://roadmap.set.com` (homepage)
- `https://roadmap.set.com/api/health` (API)

---

## Rollback Procedures

### Application Rollback (Vercel)

**Via Dashboard:**
1. Go to Project → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

**Via CLI:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Database Rollback

**From Backup (Pro tier):**
1. Go to Supabase → Settings → Database → Backups
2. Select backup point
3. Click "Restore"

**Manual Rollback:**
```bash
# Run rollback migration
supabase db reset --db-url <production-url> < rollback.sql
```

### Emergency Procedures

1. **App Down**: Rollback via Vercel immediately
2. **Database Corruption**: Restore from backup
3. **Security Breach**: Rotate all API keys, revoke sessions

---

## Maintenance Windows

### Planned Maintenance

1. **Announce**: Notify users 24+ hours in advance
2. **Schedule**: Off-peak hours (e.g., Sunday 2-4 AM)
3. **Duration**: Keep under 2 hours

### Maintenance Mode

Enable maintenance page in Vercel:

1. Create `public/maintenance.html`
2. Configure redirect in `vercel.json`:
   ```json
   {
     "redirects": [
       {
         "source": "/((?!maintenance.html).*)",
         "destination": "/maintenance.html",
         "permanent": false
       }
     ]
   }
   ```
3. Deploy
4. Remove redirect when done

### Zero-Downtime Deployments

Vercel provides zero-downtime by default:
- New version built in parallel
- Traffic switched atomically
- Old version kept available for rollback

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md)
- [Security](./SECURITY.md)
- [Setup Guide](./SETUP.md)
