# User Guide

Welcome to the SET Interactive Roadmap Platform! This guide will help you get started and make the most of the platform's features.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [Using AI Chat](#using-ai-chat)
- [Viewing Capabilities](#viewing-capabilities)
- [Managing Quick Wins](#managing-quick-wins)
- [Understanding the Timeline](#understanding-the-timeline)
- [Dependency Diagram](#dependency-diagram)
- [Generating Reports](#generating-reports)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [FAQ](#faq)

---

## Getting Started

### Logging In

1. Navigate to the platform URL
2. Enter your email address
3. Enter your password
4. Click "Sign In"

If you don't have an account, contact your administrator.

### First-Time Setup

After logging in for the first time:

1. **Update your profile** - Click your avatar in the top right
2. **Set your preferences** - Choose light/dark mode
3. **Explore the dashboard** - Familiarize yourself with the layout

### Navigation

The main navigation is on the left sidebar:

| Icon | Section | Description |
|------|---------|-------------|
| 📊 | Dashboard | Overview and KPIs |
| 🎯 | Capabilities | All capability areas |
| 📅 | Timeline | Gantt chart view |
| 🔗 | Dependencies | Flow diagram |
| ✅ | Quick Wins | 6-month initiatives |
| ⚙️ | Settings | User preferences |

---

## Dashboard Overview

The dashboard provides a real-time snapshot of the roadmap progress.

### Key Performance Indicators (KPIs)

| KPI | Description |
|-----|-------------|
| **Overall Progress** | Percentage of target maturity achieved |
| **Active Milestones** | Number of milestones in progress |
| **Quick Wins Completed** | Completed vs. total quick wins |
| **Days to Next Milestone** | Countdown to nearest milestone |

### Widgets

1. **Progress Overview** - Ring chart showing completion by priority
2. **Recent Activity** - Latest changes made to the roadmap
3. **Critical Items** - Capabilities needing immediate attention
4. **Quick Actions** - Common tasks (add quick win, update status)

### Real-Time Updates

The dashboard updates automatically when changes are made. You'll see:
- 🔵 Blue dot on new items
- Toast notifications for major changes
- Live progress bar updates

---

## Using AI Chat

The AI assistant helps you query and update the roadmap using natural language.

### Opening Chat

- Click the 💬 icon in the bottom-right corner
- Or press `Ctrl+/` (Windows) or `⌘/` (Mac)

### Example Questions

**Getting Information:**

> "What capabilities are at Level 1?"

> "Show me all CRITICAL priorities"

> "What's the current status of Production Monitoring?"

> "Which quick wins are in progress?"

**Understanding Dependencies:**

> "What capabilities depend on Production Monitoring?"

> "What's blocking Planning & Scheduling?"

> "Show me the dependency chain for ETA operations"

**Updating Data:**

> "Mark the MES Foundation milestone as in progress"

> "Update Production Monitoring to Level 2"

> "Add a note to Drive 1.0: Waiting on vendor confirmation"

> "Create a new quick win: Staff training program"

**Analysis & Planning:**

> "What happens if Drive 1.0 is delayed by 3 months?"

> "Which capabilities have the most dependencies?"

> "What's our progress this month?"

> "Generate a summary report for leadership"

### Tips for Better Results

1. **Be specific** - "Production Monitoring" not "that capability"
2. **Use full names** - Match names exactly as shown in the UI
3. **One request at a time** - Break complex requests into steps
4. **Confirm changes** - AI will ask before making updates

### Chat History

Your conversations are saved. Access previous chats:
1. Click the chat icon
2. Click "History" in the chat header
3. Select a previous conversation

---

## Viewing Capabilities

### Capability List

Access via the "Capabilities" menu item.

Each capability card shows:
- **Name** and description
- **Current Level** (1-5) with visual indicator
- **Target Level** with progress bar
- **Priority** badge (CRITICAL, HIGH, MEDIUM, LOW)
- **Owner** responsible for the capability

### Filtering Capabilities

Use the filter bar to narrow results:
- **Priority**: Show only CRITICAL items
- **Owner**: Filter by responsible person
- **Level**: Show items at specific maturity
- **Status**: In progress, not started, etc.

### Capability Detail View

Click a capability card to see:
- Full description and QoL impact
- All related milestones
- Linked quick wins
- Activity history
- Dependency information

### Editing Capabilities

*Requires Editor or Admin role*

1. Click the capability card
2. Click "Edit" button
3. Make your changes
4. Click "Save"

Changes are logged in the activity history.

---

## Managing Quick Wins

Quick wins are tracked using a Kanban board.

### Board Columns

| Column | Description |
|--------|-------------|
| **Not Started** | Planned but not begun |
| **In Progress** | Currently being worked on |
| **Completed** | Finished initiatives |

### Moving Cards

1. Click and hold a card
2. Drag to the desired column
3. Release to drop

The status updates automatically.

### Card Information

Each card displays:
- Initiative name
- Related capability (if any)
- Timeline (months)
- Investment level (LOW/MEDIUM/HIGH)
- ROI indicator
- Progress percentage

### Adding a Quick Win

1. Click "+ Add Quick Win" button
2. Fill in the form:
   - Name (required)
   - Description
   - Related capability
   - Timeline in months
   - Investment level
   - Expected ROI
3. Click "Create"

### Updating Progress

1. Click a card to open detail view
2. Adjust the progress slider (0-100%)
3. Add notes if needed
4. Click "Save"

---

## Understanding the Timeline

The Timeline view shows milestones on a Gantt chart.

### Reading the Chart

- **Horizontal axis**: Time (months/quarters)
- **Vertical axis**: Capabilities
- **Bars**: Milestone duration
- **Colors**: Status (gray=not started, blue=in progress, green=done)

### Timeline Paths

The roadmap includes three timeline scenarios:

| Path | Description | Risk Level |
|------|-------------|------------|
| **Path A** | Aggressive timeline | High |
| **Path B** | Moderate timeline | Medium |
| **Path C** | Conservative timeline | Low |

Use the dropdown to switch between paths.

### Key Dates

- **Red vertical line**: Today
- **Orange line**: Drive 1.0 deadline (June 2026)
- **Green diamond**: Major milestones

### Interactions

- **Hover** over a bar for details
- **Click** to open milestone detail
- **Zoom** with scroll wheel
- **Pan** by clicking and dragging

---

## Dependency Diagram

The dependency diagram shows relationships between capabilities.

### Understanding the Diagram

- **Nodes**: Capabilities (colored by current level)
- **Arrows**: Dependencies (A → B means B depends on A)
- **Colors**:
  - 🔴 Red: Level 1 (critical gap)
  - 🟠 Orange: Level 2
  - 🟡 Yellow: Level 3
  - 🟢 Green: Level 4-5 (target achieved)

### Interacting with the Diagram

- **Click a node** to highlight its dependencies
- **Zoom** with scroll wheel or buttons
- **Pan** by dragging the background
- **Reset view** with the home button

### Reading Dependencies

When you click a node:
- **Upstream** (blue highlight): What this capability depends on
- **Downstream** (orange highlight): What depends on this capability

---

## Generating Reports

### Quick Report (AI)

Ask the AI assistant:

> "Generate a progress report for this month"

The AI will create a summary including:
- Overall progress metrics
- Completed milestones
- Active quick wins
- Blockers and risks

### Export Options

1. Go to Settings → Export
2. Choose format:
   - **PDF**: For sharing and printing
   - **Excel**: For further analysis
   - **PowerPoint**: For presentations
3. Select date range
4. Click "Generate"

### Scheduled Reports

*Admin only*

Set up automatic report generation:
1. Settings → Scheduled Reports
2. Configure frequency (weekly, monthly)
3. Add recipients
4. Enable

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘/` / `Ctrl+/` | Toggle AI chat |
| `⌘S` / `Ctrl+S` | Save current changes |
| `Escape` | Close modal/panel |
| `?` | Show keyboard shortcuts |
| `G D` | Go to Dashboard |
| `G C` | Go to Capabilities |
| `G T` | Go to Timeline |
| `G Q` | Go to Quick Wins |

---

## FAQ

### General

**Q: How often does data update?**
A: Data syncs in real-time. Changes appear instantly for all users.

**Q: Can I undo a change?**
A: View the activity log for history. Contact an admin for rollbacks.

**Q: Who can see my changes?**
A: All logged-in users can see changes. The activity log shows who made each change.

### Permissions

**Q: Why can't I edit data?**
A: You may have a "Viewer" role. Contact your admin for Editor access.

**Q: What's the difference between roles?**
| Role | Can View | Can Edit | Can Delete | Can Admin |
|------|----------|----------|------------|-----------|
| Viewer | ✅ | ❌ | ❌ | ❌ |
| Editor | ✅ | ✅ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |

### AI Chat

**Q: Is the AI always accurate?**
A: The AI is very capable but may occasionally misunderstand. Always verify important changes.

**Q: Are my conversations private?**
A: Conversations are stored for your account only. Admins cannot see your chats.

**Q: What can the AI do?**
A: Query data, update statuses, analyze dependencies, and generate reports. It cannot delete data.

### Technical

**Q: Why isn't real-time working?**
A: Check your internet connection. If issues persist, refresh the page.

**Q: The page is slow. What can I do?**
A: Try clearing your browser cache or using Chrome/Edge for best performance.

**Q: How do I report a bug?**
A: Use the feedback button in the bottom-right, or contact support.

---

## Getting Help

- **In-app help**: Click the ? icon in the header
- **AI assistant**: Ask "help" or "what can you do?"
- **Documentation**: This guide and others in /docs
- **Support**: Contact your administrator

---

## Related Documentation

- [Security](./SECURITY.md)
- [Operations Handoff](./HANDOFF.md)
