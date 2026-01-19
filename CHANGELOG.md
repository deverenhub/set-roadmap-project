# Changelog

All notable changes to the SET Roadmap Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Multi-Facility Support** - Enterprise platform supporting multiple SET facilities
  - Database migration with facilities, user_facilities, capability_templates, and capability_facility_progress tables
  - Added facility_id and mission columns to capabilities, milestones, quick_wins, and notifications
  - Seeded three facilities: Westlake FL (WLK, maturity 4.0), Commerce GA (CMR), Blount Island FL (BLI)
  - 11 capability templates organized by three strategic missions from original TSVMap proposals
  - Row Level Security (RLS) policies for facility-scoped data access
  - FacilityStore (Zustand) for client-side facility state management with persistence
  - useFacilities, useFacility, useFacilityByCode hooks for data fetching
  - FacilitySelector component in header for switching between facilities
  - FacilitySelectorCompact for collapsed sidebar view
  - FacilityBadge component showing current facility in sidebar
  - Support for viewer, editor, and facility_admin roles per facility
  - FacilityProvider context wrapper for facility initialization
  - /facilities admin page for facility management (admin only)
  - FacilityForm component for creating/editing facilities
  - FacilityCard component with facility stats and status display
  - FacilityOnboarding wizard with 4 steps (Facility Info, Select Missions, Configure Templates, Review & Launch)
  - Admin-only navigation filter for sidebar links
  - MissionFilter component for filtering capabilities by strategic mission
  - MissionBadge component for displaying mission labels
  - Mission filtering in Capabilities list view with three missions:
    - Mission I: Setting the Standard (VSM, Production Monitoring, Quality, AutoCAD, Simio)
    - Mission II: Flexible, Resilient Operations (Vehicle Movement, Work Management, Digital Twin)
    - Mission III: Evolving our Workforce (Workforce Training, Knowledge Management, Additive Manufacturing)
  - Auto-facility assignment for new capabilities, milestones, and quick wins
  - All data hooks now support facility filtering with auto-fallback to current facility
  - useCapabilityTemplates hook for template CRUD operations and instantiation
  - instantiate_capability_templates database function for creating capabilities from templates
- **AutoCAD & Simio Integration** (from TSVMap Proposals 1 & 2)
  - Facility Design & Layout Management capability (AutoCAD) with 4 milestones
  - Process Simulation & Optimization capability (Simio) with 4 milestones
  - Digital Twin Evolution capability with 4 milestones for AutoCAD/Simio integration
  - Dependencies between AutoCAD, Simio, and Digital Twin milestones
  - All 11 strategic capabilities created for Westlake facility with appropriate mission assignments
- **Enterprise Dashboard** - Cross-facility comparison view for admins
  - CrossFacilityView component with enterprise-wide metrics
  - Facility comparison cards with maturity, milestone progress, and health status
  - Maturity level comparison bar chart across facilities
  - Mission progress radar chart comparing all facilities
  - Mission progress table with detailed breakdown by facility
  - Enterprise tab in Executive Dashboard (admin only)
- **Code Splitting** - React.lazy() and Suspense for route-based code splitting
- **Comments System** - Threaded comments on capabilities, milestones, and quick wins with @mentions support
- **Notifications System** - Real-time in-app notifications with bell icon in header
- **Milestone Detail Modal** - Full milestone view with status change buttons and comments
- **Quick Win Detail Modal** - Full quick win view with comments integration
- **Real-time Updates** - Supabase subscriptions for live comment and notification updates
- **Blocked Milestone Alerts** - Automatic notifications to admins/editors when milestones are blocked
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

### Performance
- **Bundle Size Reduction** - Initial bundle reduced from 3.2MB to 248KB (92% reduction)
- **Vite Manual Chunks** - Vendor splitting for react, supabase, recharts, reactflow, react-pdf, date-fns, dnd-kit
- **Preconnect Hints** - Added preconnect/dns-prefetch for Supabase API and Google Fonts
- **Async Font Loading** - Non-render-blocking font loading with media="print" onload pattern
- **Font Optimization** - Removed unused font-weight 300, reduced font file downloads

### Accessibility
- **VisuallyHidden Component** - New utility component for screen reader accessible text
- **Dialog Accessibility** - Added DialogTitle and DialogDescription to all dialogs for screen readers
- Fixed CommandDialog missing accessible title and description
- Fixed CapabilityDetail, CapabilityList, AttachmentsList, and QuickWins dialog accessibility

### Fixed
- QuickWinForm test hanging issues with simplified mock setup
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
- `comments` - Threaded comments with @mentions (added in 1.1.0)
- `notifications` - In-app notifications with real-time support (added in 1.1.0)

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
