# Component Specification

React component hierarchy and specifications for the SET Interactive Roadmap Platform.

## 📋 Table of Contents

- [Component Architecture](#component-architecture)
- [Layout Components](#layout-components)
- [Dashboard Components](#dashboard-components)
- [Capability Components](#capability-components)
- [Diagram Components](#diagram-components)
- [Quick Win Components](#quick-win-components)
- [Chat Components](#chat-components)
- [UI Components](#ui-components)
- [Styling Guidelines](#styling-guidelines)
- [Accessibility Requirements](#accessibility-requirements)

---

## Component Architecture

### Directory Structure

```
src/components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Dialog.tsx
│   ├── DropdownMenu.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Skeleton.tsx
│   ├── Toast.tsx
│   └── ...
│
├── layout/                # Layout and navigation
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── MainLayout.tsx
│   └── PageContainer.tsx
│
├── dashboard/             # Dashboard widgets
│   ├── KPICard.tsx
│   ├── ProgressRing.tsx
│   ├── RecentActivity.tsx
│   ├── QuickActions.tsx
│   └── CriticalItems.tsx
│
├── capabilities/          # Capability management
│   ├── CapabilityCard.tsx
│   ├── CapabilityList.tsx
│   ├── CapabilityDetail.tsx
│   ├── CapabilityForm.tsx
│   └── MaturityIndicator.tsx
│
├── diagrams/              # Visualizations
│   ├── DependencyFlow.tsx
│   ├── TimelineGantt.tsx
│   ├── MaturityChart.tsx
│   ├── ProgressChart.tsx
│   └── nodes/
│       ├── CapabilityNode.tsx
│       └── MilestoneNode.tsx
│
├── quickwins/             # Quick wins Kanban
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   ├── QuickWinCard.tsx
│   └── QuickWinForm.tsx
│
├── chat/                  # AI interface
│   ├── ChatPanel.tsx
│   ├── ChatToggle.tsx
│   ├── MessageList.tsx
│   ├── MessageBubble.tsx
│   ├── MessageInput.tsx
│   └── SuggestionChips.tsx
│
└── shared/                # Shared components
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    ├── EmptyState.tsx
    └── ConfirmDialog.tsx
```

### Component Naming Conventions

- **PascalCase** for component names: `CapabilityCard.tsx`
- **camelCase** for hooks: `useCapabilities.ts`
- **kebab-case** for CSS modules: `capability-card.module.css`
- One component per file
- Index files for public exports

---

## Layout Components

### MainLayout

The root layout wrapper for authenticated pages.

```tsx
// src/components/layout/MainLayout.tsx

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout with sidebar and header
 * 
 * @example
 * <MainLayout>
 *   <DashboardPage />
 * </MainLayout>
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      <ChatPanel />
    </div>
  );
}
```

### Sidebar

Navigation sidebar with collapsible state.

```tsx
// src/components/layout/Sidebar.tsx

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Target, label: 'Capabilities', href: '/capabilities' },
  { icon: Calendar, label: 'Timeline', href: '/timeline' },
  { icon: GitBranch, label: 'Dependencies', href: '/dependencies' },
  { icon: Zap, label: 'Quick Wins', href: '/quick-wins' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];
```

### Header

Top header with user menu and actions.

```tsx
// src/components/layout/Header.tsx

interface HeaderProps {
  title?: string;
}

/**
 * Features:
 * - Breadcrumb navigation
 * - Search (Cmd+K)
 * - Notifications
 * - User avatar/menu
 */
```

---

## Dashboard Components

### KPICard

Display a single KPI metric.

```tsx
// src/components/dashboard/KPICard.tsx

interface KPICardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Trend indicator */
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  /** Loading state */
  isLoading?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * @example
 * <KPICard
 *   title="Active Milestones"
 *   value={12}
 *   icon={Milestone}
 *   trend={{ value: 2, direction: 'up' }}
 * />
 */
```

### ProgressRing

Circular progress indicator.

```tsx
// src/components/dashboard/ProgressRing.tsx

interface ProgressRingProps {
  /** Progress value (0-100) */
  value: number;
  /** Ring size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Color theme */
  color?: 'primary' | 'success' | 'warning' | 'danger';
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label */
  label?: string;
}
```

### RecentActivity

Activity feed widget.

```tsx
// src/components/dashboard/RecentActivity.tsx

interface RecentActivityProps {
  /** Maximum items to show */
  limit?: number;
  /** Filter by table */
  table?: string;
  /** Show "View All" link */
  showViewAll?: boolean;
}

/**
 * Displays recent changes with:
 * - User avatar
 * - Action description
 * - Relative timestamp
 * - Link to affected record
 */
```

---

## Capability Components

### CapabilityCard

Card display for a single capability.

```tsx
// src/components/capabilities/CapabilityCard.tsx

interface CapabilityCardProps {
  /** Capability data */
  capability: Capability;
  /** Include milestone count */
  showMilestones?: boolean;
  /** Card click handler */
  onClick?: (capability: Capability) => void;
  /** Edit handler */
  onEdit?: (capability: Capability) => void;
  /** Compact mode for lists */
  compact?: boolean;
}

/**
 * Card displays:
 * - Name and description
 * - Priority badge (color-coded)
 * - Maturity level indicator (current → target)
 * - Owner
 * - Progress bar
 * - Milestone count (optional)
 * 
 * @example
 * <CapabilityCard
 *   capability={capability}
 *   showMilestones
 *   onClick={handleSelect}
 * />
 */
```

### MaturityIndicator

Visual indicator for maturity levels.

```tsx
// src/components/capabilities/MaturityIndicator.tsx

interface MaturityIndicatorProps {
  /** Current level (1-5) */
  current: number;
  /** Target level (1-5) */
  target: number;
  /** Display size */
  size?: 'sm' | 'md' | 'lg';
  /** Show level labels */
  showLabels?: boolean;
  /** Interactive (clickable levels) */
  interactive?: boolean;
  /** Level click handler */
  onLevelClick?: (level: number) => void;
}

/**
 * Displays:
 * - 5 level dots/segments
 * - Current level highlighted
 * - Target level indicated
 * - Progress animation
 */
```

### CapabilityForm

Form for creating/editing capabilities.

```tsx
// src/components/capabilities/CapabilityForm.tsx

interface CapabilityFormProps {
  /** Existing capability (for edit mode) */
  capability?: Capability;
  /** Form submission handler */
  onSubmit: (data: CapabilityInput) => void;
  /** Cancel handler */
  onCancel: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Form fields:
 * - Name (required)
 * - Description (textarea)
 * - Current Level (1-5 selector)
 * - Target Level (1-5 selector)
 * - Priority (dropdown)
 * - Owner (text input)
 * - QoL Impact (textarea)
 */
```

---

## Diagram Components

### DependencyFlow

Interactive dependency diagram using React Flow.

```tsx
// src/components/diagrams/DependencyFlow.tsx

interface DependencyFlowProps {
  /** Capabilities to display */
  capabilities: CapabilityWithRelations[];
  /** Selected node ID */
  selectedId?: string;
  /** Node selection handler */
  onNodeSelect?: (id: string) => void;
  /** Layout direction */
  direction?: 'TB' | 'LR';
  /** Show minimap */
  showMinimap?: boolean;
  /** Show controls */
  showControls?: boolean;
}

/**
 * Features:
 * - Auto-layout with dagre
 * - Color by maturity level
 * - Highlight dependencies on select
 * - Zoom and pan
 * - Minimap navigation
 * - Node tooltips
 */
```

### TimelineGantt

Gantt chart for timeline visualization.

```tsx
// src/components/diagrams/TimelineGantt.tsx

interface TimelineGanttProps {
  /** Milestones to display */
  milestones: MilestoneWithCapability[];
  /** Timeline path (A/B/C) */
  path: TimelinePath;
  /** Start date for timeline */
  startDate?: Date;
  /** Zoom level */
  zoom?: 'month' | 'quarter' | 'year';
  /** Milestone click handler */
  onMilestoneClick?: (milestone: Milestone) => void;
  /** Today marker */
  showToday?: boolean;
}

/**
 * Features:
 * - Horizontal bars by capability
 * - Status color coding
 * - Dependency arrows
 * - Today line
 * - Key date markers
 * - Hover tooltips
 */
```

### Custom Nodes

```tsx
// src/components/diagrams/nodes/CapabilityNode.tsx

interface CapabilityNodeProps {
  data: {
    label: string;
    level: MaturityLevel;
    priority: Priority;
    isSelected: boolean;
    isHighlighted: boolean;
  };
}

/**
 * Custom React Flow node for capabilities
 * 
 * Visual elements:
 * - Rounded rectangle shape
 * - Priority-based border color
 * - Level indicator dot
 * - Selection ring
 * - Highlight glow for dependencies
 */
```

---

## Quick Win Components

### KanbanBoard

Drag-and-drop Kanban board.

```tsx
// src/components/quickwins/KanbanBoard.tsx

interface KanbanBoardProps {
  /** Quick wins data */
  quickWins: QuickWin[];
  /** Card move handler */
  onMove: (id: string, newStatus: Status, newOrder: number) => void;
  /** Card click handler */
  onCardClick?: (quickWin: QuickWin) => void;
  /** Add new handler */
  onAdd?: (status: Status) => void;
}

/**
 * Uses @dnd-kit for drag and drop
 * 
 * Columns:
 * - Not Started
 * - In Progress
 * - Completed
 * 
 * Features:
 * - Drag between columns
 * - Reorder within column
 * - Add card button per column
 * - Column card counts
 */
```

### QuickWinCard

Draggable card for Kanban board.

```tsx
// src/components/quickwins/QuickWinCard.tsx

interface QuickWinCardProps {
  /** Quick win data */
  quickWin: QuickWin;
  /** Is currently being dragged */
  isDragging?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Card displays:
 * - Name
 * - Related capability tag
 * - Timeline badge
 * - Investment/ROI indicators
 * - Progress bar
 * - Assigned user avatar
 */
```

---

## Chat Components

### ChatPanel

Sliding chat panel for AI interaction.

```tsx
// src/components/chat/ChatPanel.tsx

interface ChatPanelProps {
  /** Panel open state */
  isOpen: boolean;
  /** Toggle handler */
  onToggle: () => void;
  /** Panel width */
  width?: number;
}

/**
 * Features:
 * - Slide-in from right
 * - Resizable width
 * - Message history
 * - Typing indicator
 * - Suggestion chips
 * - Session management
 */
```

### MessageBubble

Individual chat message.

```tsx
// src/components/chat/MessageBubble.tsx

interface MessageBubbleProps {
  /** Message data */
  message: ChatMessage;
  /** Show avatar */
  showAvatar?: boolean;
  /** Show timestamp */
  showTimestamp?: boolean;
}

/**
 * Renders:
 * - User messages (right-aligned, blue)
 * - Assistant messages (left-aligned, gray)
 * - Tool call indicators
 * - Markdown content
 * - Code blocks with syntax highlighting
 */
```

### SuggestionChips

Quick action suggestions.

```tsx
// src/components/chat/SuggestionChips.tsx

interface SuggestionChipsProps {
  /** Suggestion strings */
  suggestions: string[];
  /** Chip click handler */
  onSelect: (suggestion: string) => void;
  /** Max chips to show */
  maxVisible?: number;
}

/**
 * Default suggestions:
 * - "Show CRITICAL capabilities"
 * - "What's in progress?"
 * - "Generate monthly report"
 * - "What's blocking us?"
 */
```

---

## UI Components

Base UI components from shadcn/ui with customizations.

### Button

```tsx
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}
```

### Card

```tsx
interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}
```

### Badge

```tsx
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  // Priority variants
  priority?: Priority;
  // Status variants  
  status?: Status;
}
```

---

## Styling Guidelines

### Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Priority colors
        critical: '#ef4444',
        high: '#f97316',
        medium: '#eab308',
        low: '#22c55e',
        
        // Maturity level colors
        level1: '#ef4444',
        level2: '#f97316',
        level3: '#eab308',
        level4: '#22c55e',
        level5: '#10b981',
      },
    },
  },
};
```

### Component Patterns

```tsx
// Use cn() for conditional classes
import { cn } from '@/lib/utils';

function Component({ className, variant }) {
  return (
    <div
      className={cn(
        'base-styles',
        variant === 'primary' && 'primary-styles',
        className
      )}
    />
  );
}
```

### Animation Guidelines

- Use `transition-all duration-200` for hover states
- Use `animate-spin` for loading spinners
- Use Framer Motion for complex animations
- Respect `prefers-reduced-motion`

---

## Accessibility Requirements

### Required for All Components

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Enter/Space activation

2. **Screen Reader Support**
   - Semantic HTML elements
   - ARIA labels where needed
   - Live regions for updates

3. **Visual Accessibility**
   - 4.5:1 contrast ratio minimum
   - Focus indicators visible
   - Don't rely on color alone

### Component-Specific Requirements

```tsx
// Button with loading state
<Button isLoading aria-busy="true" aria-label="Saving...">
  Save
</Button>

// Icon-only button
<Button size="icon" aria-label="Close dialog">
  <X />
</Button>

// Progress indicator
<ProgressRing
  value={75}
  aria-label="75% complete"
  role="progressbar"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
/>

// Live region for updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Testing Accessibility

```bash
# Run accessibility audit
pnpm test:a11y

# Tools used:
# - @axe-core/react
# - eslint-plugin-jsx-a11y
# - Lighthouse
```

---

## Related Documentation

- [Architecture](../docs/ARCHITECTURE.md)
- [Data Model Spec](./DATA_MODEL_SPEC.md)
- [User Guide](../docs/USER_GUIDE.md)
