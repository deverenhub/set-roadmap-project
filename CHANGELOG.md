# Changelog

All notable changes to the SET Roadmap Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Timeline Page** - New interactive Gantt chart with drag-and-drop milestone scheduling
- **Timeline Components** - TimelineHeader and TimelineChart with dnd-kit integration
- Export Report button downloads text file with executive summary
- Copy Summary button copies health summary to clipboard
- Path selector (A/B/C) for different timeline scenarios

### Changed
- Executive Dashboard now uses real calculated data instead of hardcoded mock values
- Timeline data is dynamically grouped by quarter from actual milestones
- Phase cards show real capability progress grouped by owner
- Impact simulation calculates estimates from actual workload data
- Dashboard layout improvements with better responsive design

### Fixed
- Export Report and Copy Summary buttons now work with proper error handling
- Clipboard API fallback for browsers that block direct clipboard access
- Download link cleanup timing issue that prevented file downloads
- Empty state handling for pie chart when no milestones exist
- Maturity progress calculation edge case when avgCurrentLevel < 1
- Dark mode support across all Executive Dashboard components

## [1.0.0] - 2025-01-06

### Added

#### Core Features
- **Dashboard** - Main operational dashboard with KPI metrics, status charts, and quick actions
- **Executive Dashboard** - Leadership view with program health, strategic narrative, and impact analysis
- **Capabilities Management** - Full CRUD for operational capabilities with maturity tracking
- **Milestones** - Milestone tracking with status, priority, and path duration estimates
- **Quick Wins** - Fast-track initiative management with effort/impact scoring
- **Dependencies** - Inter-capability dependency visualization using ReactFlow
- **Timeline** - Interactive Gantt chart with drag-and-drop milestone scheduling
- **Settings** - User preferences for theme, compact mode, and application behavior

#### AI Integration
- Claude AI chat assistant with voice input support
- Conversational interface for roadmap queries and recommendations
- Supabase Edge Function backend for secure API communication

#### User Experience
- SET/JM Family brand theme with custom colors and Toyota logo
- Role-based access control (RBAC) for UI components
- Dark mode support throughout the application
- Responsive design for desktop and tablet devices
- Toast notifications for user feedback

#### Data Visualization
- Quality of Life (QoL) impact chart on Dashboard
- Milestone status distribution pie charts
- Quarterly progress bar charts
- Timeline area charts with planned vs completed metrics
- Maturity level progress indicators

#### Technical Infrastructure
- React 18 with TypeScript for type safety
- Vite for fast development and optimized builds
- TanStack Query for server state management
- Zustand for client state management
- Supabase for authentication and PostgreSQL database
- Tailwind CSS with custom design tokens
- Radix UI primitives for accessible components
- Recharts for data visualization
- ReactFlow for dependency graphs
- dnd-kit for drag-and-drop interactions

### Fixed
- TypeScript build errors for Vercel deployment
- AI chat authentication using service role key with getUser(token)
- Empty value error in capability select for quick wins
- Theme and compact mode settings persistence

### Security
- Environment variables for sensitive configuration
- Supabase Row Level Security (RLS) policies
- Service role authentication for Edge Functions

---

## Version History

### Pre-release Development

#### Alpha Phase
- Initial project scaffolding with Vite + React + TypeScript
- Supabase database schema design
- Core component library setup with shadcn/ui patterns
- Authentication flow implementation

#### Beta Phase
- All 16 pages implemented with real Supabase queries
- React Query hooks for data fetching
- Form validation and error handling
- Loading states and skeleton screens

---

## Migration Notes

### From 0.x to 1.0.0
This is the initial stable release. No migration required.

### Database Schema
The application requires the following Supabase tables:
- `capabilities` - Operational capabilities with maturity levels
- `milestones` - Project milestones with path estimates
- `quick_wins` - Quick win initiatives
- `dependencies` - Capability relationships

### Environment Variables
Required environment variables:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-claude-api-key (for Edge Functions)
```

---

## Links

- [Repository](https://github.com/your-org/set-roadmap-project)
- [Documentation](./docs/)
- [Issue Tracker](https://github.com/your-org/set-roadmap-project/issues)

[Unreleased]: https://github.com/your-org/set-roadmap-project/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/set-roadmap-project/releases/tag/v1.0.0
