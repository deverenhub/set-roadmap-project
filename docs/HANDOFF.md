# Operations Handoff Guide

This guide is designed for SET administrators to maintain and operate the Interactive Roadmap Platform independently.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Day-to-Day Operations](#day-to-day-operations)
- [Common Maintenance Tasks](#common-maintenance-tasks)
- [Managing Users](#managing-users)
- [Data Management](#data-management)
- [Troubleshooting Guide](#troubleshooting-guide)
- [When to Contact Support](#when-to-contact-support)
- [Vendor Information](#vendor-information)
- [Monthly Checklist](#monthly-checklist)

---

## System Overview

### What is this platform?

The SET Interactive Roadmap Platform is a web application that replaces static Excel spreadsheets with a living, AI-powered digital platform for tracking the VPC Operations Transformation roadmap.

### How does it work?

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   Your Browser  ◄─────────►  Vercel (Website)               │
│        │                          │                          │
│        │                          │                          │
│        └──────────────────────────┼──────────────────────►   │
│                                   │                          │
│                            Supabase (Database)               │
│                                   │                          │
│                                   │                          │
│                            Claude AI (Chat)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | What it does | Who manages it |
|-----------|--------------|----------------|
| **Vercel** | Hosts the website | Automatic |
| **Supabase** | Stores all data | SET Admin |
| **Claude AI** | Powers the chat | Automatic |

### Accessing Admin Dashboards

| Service | URL | Purpose |
|---------|-----|---------|
| Platform | roadmap.set.com | Main application |
| Vercel | vercel.com/dashboard | Website status |
| Supabase | supabase.com/dashboard | Database admin |

---

## Day-to-Day Operations

### Daily Tasks

| Task | Time | How to |
|------|------|--------|
| Check platform is running | 1 min | Visit roadmap.set.com |
| Review any error alerts | 2 min | Check email for Sentry alerts |

### Weekly Tasks

| Task | Time | How to |
|------|------|--------|
| Review activity log | 10 min | Settings → Activity Log |
| Check for stuck items | 5 min | Dashboard → view stale items |
| Respond to user questions | Varies | Check support inbox |

### Monthly Tasks

| Task | Time | How to |
|------|------|--------|
| Generate progress report | 5 min | Ask AI: "Generate monthly report" |
| Review user accounts | 10 min | Settings → Users |
| Check Supabase usage | 5 min | Supabase → Usage |
| Update quick win statuses | 15 min | Quick Wins page |

---

## Common Maintenance Tasks

### Adding a New Capability

**Via the UI:**
1. Go to Capabilities page
2. Click "+ Add Capability"
3. Fill in the form:
   - **Name**: e.g., "New Capability Area"
   - **Description**: What this capability covers
   - **Current Level**: Where we are now (1-5)
   - **Target Level**: Where we want to be (usually 4)
   - **Priority**: CRITICAL, HIGH, MEDIUM, or LOW
   - **Owner**: Who's responsible
4. Click "Save"

**Via AI Chat:**
> "Create a new capability called 'Workforce Management' at Level 1, targeting Level 4, with HIGH priority"

### Updating a Milestone Status

**Via the UI:**
1. Go to Timeline or Capabilities page
2. Find the milestone
3. Click to open details
4. Change status dropdown:
   - Not Started
   - In Progress
   - Completed
   - Blocked
5. Add notes if needed
6. Click "Save"

**Via AI Chat:**
> "Update the MES Foundation milestone to in_progress and add note: Started vendor evaluation"

### Adding a Quick Win

**Via the UI:**
1. Go to Quick Wins page
2. Click "+ Add Quick Win"
3. Fill in:
   - **Name**: Short descriptive title
   - **Description**: What will be done
   - **Related Capability**: Link to capability (optional)
   - **Timeline**: Expected months to complete
   - **Investment**: LOW, MEDIUM, or HIGH
   - **ROI**: Expected return
4. Click "Create"

### Moving Quick Wins (Kanban)

1. Go to Quick Wins page
2. Click and hold a card
3. Drag to new column (Not Started → In Progress → Completed)
4. Release to drop
5. Status updates automatically

### Updating Progress Percentage

1. Click on a Quick Win card
2. Drag the progress slider
3. Add notes about what was completed
4. Click "Save"

---

## Managing Users

### Viewing Current Users

1. Go to Settings → Users
2. See list of all users with roles

### Adding a New User

1. Have the person sign up at roadmap.set.com
2. Go to Settings → Users
3. Find the new user
4. Click "Edit"
5. Set their role:
   - **Viewer**: Can see everything, edit nothing
   - **Editor**: Can view and edit data
   - **Admin**: Full access including user management
6. Click "Save"

### Changing User Roles

1. Settings → Users
2. Find the user
3. Click "Edit"
4. Change role dropdown
5. Click "Save"

### Deactivating a User

1. Settings → Users
2. Find the user
3. Click "Deactivate"
4. Confirm

The user can no longer log in but their history is preserved.

### Password Resets

Users can reset their own passwords:
1. Go to login page
2. Click "Forgot Password"
3. Enter email
4. Check email for reset link

Admins cannot see or reset passwords directly.

---

## Data Management

### Exporting Data

1. Go to Settings → Export
2. Choose format:
   - **Excel**: Full data export
   - **PDF**: Report format
   - **CSV**: Raw data
3. Select what to export:
   - All data
   - Capabilities only
   - Quick wins only
   - Activity log
4. Click "Export"

### Backing Up Data

Supabase creates automatic daily backups (Pro tier).

To manually export:
1. Log into supabase.com/dashboard
2. Go to your project
3. Settings → Database → Backups
4. Click "Create Backup"

### Restoring from Backup

⚠️ **Warning**: This replaces all current data

1. Log into supabase.com/dashboard
2. Settings → Database → Backups
3. Find the backup date
4. Click "Restore"
5. Confirm

### Importing Data

To bulk import from Excel:
1. Contact the development team
2. Provide Excel file in required format
3. They will run the import script

---

## Troubleshooting Guide

### Problem: Page Won't Load

**Symptoms:**
- Blank page
- "Cannot connect" error
- Spinning forever

**Solutions:**
1. Check your internet connection
2. Try refreshing the page (Ctrl+R or ⌘R)
3. Clear browser cache:
   - Chrome: Settings → Privacy → Clear browsing data
4. Try a different browser
5. Check if site is down: downdetector.com

**If still not working:**
- Check Vercel status: vercel.com/status
- Check Supabase status: status.supabase.com

### Problem: Can't Log In

**Symptoms:**
- "Invalid credentials" error
- Password not accepted

**Solutions:**
1. Check caps lock is off
2. Use "Forgot Password" to reset
3. Check email for confirmation (new accounts)
4. Try incognito/private window

### Problem: Data Not Saving

**Symptoms:**
- Changes don't persist
- "Error saving" message

**Solutions:**
1. Check you have Editor/Admin role
2. Refresh the page and try again
3. Check internet connection
4. Look for validation errors (red text)

### Problem: Real-time Not Working

**Symptoms:**
- Changes don't appear for other users
- Need to refresh to see updates

**Solutions:**
1. Refresh the page
2. Check internet connection
3. Disable browser extensions (ad blockers can interfere)
4. Try different browser

### Problem: AI Chat Not Responding

**Symptoms:**
- Chat shows "Thinking..." forever
- No response from AI

**Solutions:**
1. Wait 30 seconds (some queries take time)
2. Refresh the page
3. Try simpler question
4. Check if at API limit (rare)

If persists over 1 hour, contact support.

### Problem: Charts Not Displaying

**Symptoms:**
- Empty chart areas
- "Error loading" on visualizations

**Solutions:**
1. Refresh the page
2. Clear browser cache
3. Try different browser (Chrome works best)
4. Check if data exists for that view

---

## When to Contact Support

### Contact TSVMap Consulting

- New feature requests
- Major data imports
- Architecture changes
- Training needs

**Email**: support@tsvmap.com

### Contact Supabase Support

- Database issues
- Performance problems
- Backup/restore help
- Billing questions

**Portal**: supabase.com/support

### Contact Vercel Support

- Website not loading
- Deployment issues
- Domain problems
- SSL certificate issues

**Portal**: vercel.com/support

### Contact Anthropic (Claude)

- AI not responding (persistent)
- Billing for AI usage
- API issues

**Portal**: support.anthropic.com

---

## Vendor Information

### Account Details

| Service | Account Email | Billing |
|---------|---------------|---------|
| Vercel | admin@set.com | Credit card |
| Supabase | admin@set.com | Credit card |
| Anthropic | admin@set.com | Credit card |
| Domain | admin@set.com | Annual |

### Monthly Costs

| Service | Cost | Billing Date |
|---------|------|--------------|
| Supabase Pro | $25/mo | 1st of month |
| Vercel Pro | $20/mo | 1st of month |
| Claude API | ~$20-50/mo | Usage-based |
| Domain | $12/year | Annual |
| **Total** | **~$70-100/mo** | |

### API Keys Location

API keys are stored in Vercel environment variables.
To view or update:
1. Log into vercel.com
2. Go to your project
3. Settings → Environment Variables

⚠️ **Never share API keys publicly**

---

## Monthly Checklist

Use this checklist for monthly maintenance:

### Week 1
- [ ] Generate and review monthly progress report
- [ ] Update any milestone statuses that changed
- [ ] Review and update quick win progress percentages

### Week 2
- [ ] Review user accounts (deactivate any departed employees)
- [ ] Check activity log for unusual activity
- [ ] Verify backup is running (Supabase dashboard)

### Week 3
- [ ] Review any support tickets or user feedback
- [ ] Check Supabase usage (approaching limits?)
- [ ] Test AI chat is working properly

### Week 4
- [ ] Export monthly report for leadership
- [ ] Review costs (Supabase, Vercel, Anthropic)
- [ ] Plan any updates for next month

---

## Emergency Procedures

### If the Site Goes Down

1. Check status pages:
   - vercel.com/status
   - status.supabase.com
2. If provider is down, wait for resolution
3. If not provider issue, contact TSVMap

### If Data Seems Wrong

1. DO NOT make changes
2. Check activity log for recent changes
3. Contact TSVMap before attempting fixes
4. We can restore from backup if needed

### If You Suspect a Security Breach

1. DO NOT log in again
2. Contact IT security immediately
3. Contact TSVMap
4. We will:
   - Rotate all API keys
   - Review access logs
   - Assess any data exposure

---

## Quick Reference Card

### Common AI Commands

| Say this... | To do this... |
|-------------|---------------|
| "Show CRITICAL capabilities" | View urgent items |
| "What's blocking X?" | Check dependencies |
| "Update X to in_progress" | Change status |
| "Generate monthly report" | Create summary |
| "What happened this week?" | Recent activity |

### Key URLs

| What | URL |
|------|-----|
| Platform | roadmap.set.com |
| Supabase Admin | supabase.com/dashboard |
| Vercel Admin | vercel.com/dashboard |

### Support Contacts

| Who | Email |
|-----|-------|
| TSVMap | support@tsvmap.com |
| SET IT | it-support@set.com |

---

*Document maintained by TSVMap Consulting Services*
*Last updated: January 2026*
