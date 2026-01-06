// supabase/functions/mcp-server/tools.ts
// Tool definitions for MCP Server

export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
  requiresConfirmation?: boolean;
}

export const TOOLS: Tool[] = [
  // Read Operations
  {
    name: 'get_capabilities',
    description: 'Get all capabilities or filter by priority',
    parameters: {
      type: 'object',
      properties: {
        priority: {
          type: 'string',
          description: 'Filter by priority level',
          enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
        },
      },
    },
  },
  {
    name: 'get_milestones',
    description: 'Get milestones with optional filters',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['not_started', 'in_progress', 'completed', 'blocked'],
        },
        capability_id: {
          type: 'string',
          description: 'Filter by capability ID',
        },
      },
    },
  },
  {
    name: 'get_quick_wins',
    description: 'Get quick wins with optional filters',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['not_started', 'in_progress', 'completed'],
        },
        category: {
          type: 'string',
          description: 'Filter by category',
        },
      },
    },
  },
  {
    name: 'get_activity_log',
    description: 'Get recent activity log entries',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of entries to return (default: 20)',
        },
      },
    },
  },
  {
    name: 'get_maturity_definitions',
    description: 'Get maturity level definitions (1-5)',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_technology_options',
    description: 'Get technology options for implementation',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by technology category',
        },
      },
    },
  },

  // Analysis Operations
  {
    name: 'analyze_dependencies',
    description: 'Analyze milestone dependencies and find blockers',
    parameters: {
      type: 'object',
      properties: {
        capability_id: {
          type: 'string',
          description: 'Optional capability ID to analyze',
        },
      },
    },
  },
  {
    name: 'calculate_timeline_impact',
    description: 'Calculate impact of delaying a milestone',
    parameters: {
      type: 'object',
      properties: {
        milestone_id: {
          type: 'string',
          description: 'ID of the milestone to analyze',
        },
        delay_months: {
          type: 'number',
          description: 'Number of months delay',
        },
      },
      required: ['milestone_id', 'delay_months'],
    },
  },
  {
    name: 'generate_progress_report',
    description: 'Generate a comprehensive progress report',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_dashboard_kpis',
    description: 'Get key performance indicators for the dashboard',
    parameters: {
      type: 'object',
      properties: {},
    },
  },

  // Write Operations (require confirmation)
  {
    name: 'update_milestone_status',
    description: 'Update the status of a milestone',
    parameters: {
      type: 'object',
      properties: {
        milestone_id: {
          type: 'string',
          description: 'ID of the milestone to update',
        },
        status: {
          type: 'string',
          description: 'New status',
          enum: ['not_started', 'in_progress', 'completed', 'blocked'],
        },
        confirmation: {
          type: 'boolean',
          description: 'Confirm this action',
        },
      },
      required: ['milestone_id', 'status'],
    },
    requiresConfirmation: true,
  },
  {
    name: 'update_capability_level',
    description: 'Update the current maturity level of a capability',
    parameters: {
      type: 'object',
      properties: {
        capability_id: {
          type: 'string',
          description: 'ID of the capability to update',
        },
        current_level: {
          type: 'number',
          description: 'New current level (1-5)',
        },
        confirmation: {
          type: 'boolean',
          description: 'Confirm this action',
        },
      },
      required: ['capability_id', 'current_level'],
    },
    requiresConfirmation: true,
  },
  {
    name: 'update_quick_win',
    description: 'Update a quick win status or progress',
    parameters: {
      type: 'object',
      properties: {
        quick_win_id: {
          type: 'string',
          description: 'ID of the quick win to update',
        },
        status: {
          type: 'string',
          description: 'New status',
          enum: ['not_started', 'in_progress', 'completed'],
        },
        progress_percent: {
          type: 'number',
          description: 'Progress percentage (0-100)',
        },
        confirmation: {
          type: 'boolean',
          description: 'Confirm this action',
        },
      },
      required: ['quick_win_id'],
    },
    requiresConfirmation: true,
  },
  {
    name: 'add_quick_win',
    description: 'Add a new quick win item',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the quick win',
        },
        description: {
          type: 'string',
          description: 'Description of the quick win',
        },
        timeline_months: {
          type: 'number',
          description: 'Expected timeline in months',
        },
        category: {
          type: 'string',
          description: 'Category of the quick win',
        },
        confirmation: {
          type: 'boolean',
          description: 'Confirm this action',
        },
      },
      required: ['name', 'timeline_months'],
    },
    requiresConfirmation: true,
  },
];
