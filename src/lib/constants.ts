// src/lib/constants.ts

// Route paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  CAPABILITIES: '/capabilities',
  CAPABILITY_DETAIL: '/capabilities/:id',
  TIMELINE: '/timeline',
  DEPENDENCIES: '/dependencies',
  QUICK_WINS: '/quick-wins',
  SETTINGS: '/settings',
  LOGIN: '/login',
} as const;

// Priority configuration
export const PRIORITIES = {
  CRITICAL: { label: 'Critical', color: '#ef4444', bgColor: 'bg-red-500' },
  HIGH: { label: 'High', color: '#f97316', bgColor: 'bg-orange-500' },
  MEDIUM: { label: 'Medium', color: '#eab308', bgColor: 'bg-yellow-500' },
  LOW: { label: 'Low', color: '#22c55e', bgColor: 'bg-green-500' },
} as const;

// Status configuration
export const STATUSES = {
  not_started: { label: 'Not Started', color: '#94a3b8', bgColor: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bgColor: 'bg-blue-500' },
  completed: { label: 'Completed', color: '#22c55e', bgColor: 'bg-green-500' },
  blocked: { label: 'Blocked', color: '#ef4444', bgColor: 'bg-red-500' },
} as const;

// Maturity levels
export const MATURITY_LEVELS = {
  1: { name: 'Initial', description: 'Ad-hoc processes', color: '#ef4444' },
  2: { name: 'Managed', description: 'Defined processes', color: '#f97316' },
  3: { name: 'Standardized', description: 'Integrated systems', color: '#eab308' },
  4: { name: 'Predictive', description: 'Analytics-driven', color: '#3b82f6' },
  5: { name: 'Autonomous', description: 'AI-powered', color: '#10b981' },
} as const;

// Quick win categories
export const QUICK_WIN_CATEGORIES = [
  'Operations', 'Safety', 'HR', 'Technology', 'Process', 'Training',
] as const;
