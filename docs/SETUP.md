# Development Setup Guide

Complete guide to setting up your local development environment for the SET Interactive Roadmap Platform.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Clone Repository](#step-1-clone-repository)
- [Step 2: Install Dependencies](#step-2-install-dependencies)
- [Step 3: Supabase Setup](#step-3-supabase-setup)
- [Step 4: Environment Variables](#step-4-environment-variables)
- [Step 5: Initialize Database](#step-5-initialize-database)
- [Step 6: Start Development Server](#step-6-start-development-server)
- [Optional: Local Supabase](#optional-local-supabase)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| **Node.js** | 18+ LTS | [nodejs.org](https://nodejs.org) or use nvm |
| **pnpm** | 8+ | `npm install -g pnpm` |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com) |

### Verify Installation

```bash
node --version    # Should output v18.x.x or higher
pnpm --version    # Should output 8.x.x or higher
git --version     # Should output 2.30.x or higher
```

### Optional Software

| Software | Purpose | Installation |
|----------|---------|--------------|
| **Supabase CLI** | Local development | `npm install -g supabase` |
| **Docker Desktop** | Local Supabase | [docker.com](https://docker.com) |
| **VS Code** | Recommended IDE | [code.visualstudio.com](https://code.visualstudio.com) |

### Recommended VS Code Extensions

- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Supabase

---

## Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/set-roadmap.git

# Navigate to project directory
cd set-roadmap
```

---

## Step 2: Install Dependencies

```bash
# Install all dependencies
pnpm install
```

This will install:
- React and TypeScript
- Tailwind CSS
- Supabase client
- React Flow and Recharts
- Testing libraries
- Development tools

---

## Step 3: Supabase Setup

### Option A: Use Cloud Supabase (Recommended for Quick Start)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name:** `set-roadmap`
   - **Database Password:** Generate a strong password (save this!)
   - **Region:** Choose closest to your users
4. Wait for project to be created (~2 minutes)
5. Go to **Settings > API**
6. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Option B: Use Local Supabase (For Offline Development)

See [Optional: Local Supabase](#optional-local-supabase) section below.

---

## Step 4: Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```bash
# Required - Supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Required - Anthropic (for AI features)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional - Application settings
VITE_APP_URL=http://localhost:5173
VITE_APP_ENV=development
VITE_DEBUG=true
```

### Getting an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key to your `.env.local`

---

## Step 5: Initialize Database

### Push Database Schema

```bash
# Link to your Supabase project (first time only)
supabase link --project-ref your-project-ref

# Push migrations to create tables
pnpm db:push
# Or directly: supabase db push
```

### Seed Initial Data

```bash
# Populate database with SET roadmap data
pnpm db:seed
```

This creates:
- 7 capability areas
- Maturity level definitions
- Quick win initiatives
- Technology options

### Verify Database Setup

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. You should see tables: `capabilities`, `milestones`, `quick_wins`, etc.
4. Check that data has been seeded

---

## Step 6: Start Development Server

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Default Login Credentials

For development, you can create a test user:

1. Click "Sign Up" on the login page
2. Enter any email and password
3. Check Supabase Dashboard > Authentication for the user

---

## Optional: Local Supabase

Running Supabase locally allows offline development and testing.

### Prerequisites

- Docker Desktop installed and running

### Setup Local Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (creates supabase/ folder)
supabase init

# Start local Supabase
supabase start
```

This outputs local credentials:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Update `.env.local`:

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJ...local-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...local-service-key
```

### Local Supabase Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Reset database (clears all data)
supabase db reset

# View logs
supabase logs

# Open Studio (database GUI)
# Visit http://localhost:54323
```

---

## Troubleshooting

### "Cannot connect to Supabase"

**Symptoms:** API calls fail, authentication doesn't work

**Solutions:**
1. Verify `VITE_SUPABASE_URL` is correct (no trailing slash)
2. Verify `VITE_SUPABASE_ANON_KEY` is the anon key, not service role
3. Check Supabase project is running (not paused)
4. For local: ensure Docker is running and `supabase start` completed

### "RLS policy error" / "Permission denied"

**Symptoms:** Can read data but can't create/update

**Solutions:**
1. Run migrations: `supabase db push`
2. Check user has correct role in database
3. Verify RLS policies in Supabase Dashboard > Auth > Policies

### "Module not found" errors

**Symptoms:** Import errors, missing dependencies

**Solutions:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "Port 5173 already in use"

**Solutions:**
```bash
# Find process using port
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or use a different port
pnpm dev --port 3000
```

### "TypeScript errors in IDE but build works"

**Solutions:**
1. Restart VS Code / TypeScript server
2. Run: `pnpm typecheck` to verify
3. Delete `.vite` cache: `rm -rf node_modules/.vite`

### Local Supabase Issues

**"Docker not running"**
- Ensure Docker Desktop is installed and started

**"Port already in use"**
```bash
# Stop any existing Supabase containers
supabase stop

# Start fresh
supabase start
```

**"Database connection refused"**
```bash
# Reset local Supabase
supabase stop
supabase start
supabase db reset
```

---

## Next Steps

Once your development environment is set up:

1. Read the [Architecture Guide](./ARCHITECTURE.md) to understand the system
2. Review the [Database Schema](./DATABASE.md) to understand data structure
3. Check the [API Reference](./API.md) for available endpoints
4. Start developing! 🚀

---

## Getting Help

- Check [GitHub Issues](https://github.com/your-org/set-roadmap/issues)
- Review [Supabase Docs](https://supabase.com/docs)
- Contact the development team
