# MCP Tools Specification

Technical specification for Model Context Protocol (MCP) tools in the SET Interactive Roadmap Platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Tool Architecture](#tool-architecture)
- [Read Tools](#read-tools)
- [Write Tools](#write-tools)
- [Analysis Tools](#analysis-tools)
- [Error Handling](#error-handling)
- [Testing](#testing)

---

## Overview

### What is MCP?

Model Context Protocol (MCP) is an open standard by Anthropic for connecting AI models to external tools and data sources. It provides a standardized way to:

- Define available tools
- Handle tool invocations
- Manage conversation context
- Return structured results

### Our Implementation

The SET Roadmap Platform uses MCP to allow Claude to:
- Query roadmap data
- Update milestone statuses
- Analyze dependencies
- Generate reports

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chat Interface                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  User: "What capabilities are at Level 1?"          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server (Edge Function)                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  1. Parse user message                               │    │
│  │  2. Send to Claude with tool definitions            │    │
│  │  3. Claude decides to use: get_capabilities         │    │
│  │  4. Execute tool against database                   │    │
│  │  5. Return results to Claude                        │    │
│  │  6. Claude formats response                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Response                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  "There are 2 capabilities at Level 1:              │    │
│  │   - Production Monitoring (CRITICAL)                │    │
│  │   - Planning & Scheduling (CRITICAL)"              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tool Architecture

### Tool Definition Schema

Each tool follows this structure:

```typescript
interface ToolDefinition {
  name: string;           // Unique tool identifier
  description: string;    // What the tool does (for Claude)
  input_schema: {         // JSON Schema for parameters
    type: 'object';
    properties: Record<string, PropertySchema>;
    required?: string[];
  };
}

interface PropertySchema {
  type: string;           // 'string', 'number', 'boolean', 'array'
  description: string;    // Parameter description
  enum?: string[];        // Allowed values
  default?: any;          // Default value
  format?: string;        // 'uuid', 'date', etc.
}
```

### Tool Response Schema

```typescript
interface ToolResponse {
  success: boolean;
  data?: any;             // Tool-specific result
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    execution_time_ms: number;
    record_count?: number;
  };
}
```

---

## Read Tools

### get_capabilities

Retrieve capabilities with optional filtering.

```typescript
{
  name: "get_capabilities",
  description: "Retrieve roadmap capabilities. Can filter by priority, owner, or level. Optionally include related milestones and quick wins.",
  input_schema: {
    type: "object",
    properties: {
      priority: {
        type: "string",
        enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
        description: "Filter by priority level"
      },
      owner: {
        type: "string",
        description: "Filter by owner/department"
      },
      current_level: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        description: "Filter by current maturity level"
      },
      include_milestones: {
        type: "boolean",
        default: false,
        description: "Include related milestones in response"
      },
      include_quick_wins: {
        type: "boolean",
        default: false,
        description: "Include related quick wins in response"
      }
    }
  }
}
```

**Example Usage:**

```
User: "Show me all CRITICAL capabilities with their milestones"

Tool Call:
{
  "tool": "get_capabilities",
  "parameters": {
    "priority": "CRITICAL",
    "include_milestones": true
  }
}

Response:
{
  "success": true,
  "data": {
    "capabilities": [
      {
        "id": "uuid-1",
        "name": "Production Monitoring",
        "current_level": 1,
        "target_level": 4,
        "priority": "CRITICAL",
        "milestones": [
          {
            "id": "ms-1",
            "name": "Basic Visibility",
            "from_level": 1,
            "to_level": 2,
            "status": "in_progress"
          }
        ]
      }
    ]
  },
  "metadata": {
    "record_count": 2
  }
}
```

---

### get_milestones

Retrieve milestones with timeline information.

```typescript
{
  name: "get_milestones",
  description: "Retrieve milestones with timeline paths. Can filter by capability, status, or calculate projected dates.",
  input_schema: {
    type: "object",
    properties: {
      capability_id: {
        type: "string",
        format: "uuid",
        description: "Filter by specific capability"
      },
      capability_name: {
        type: "string",
        description: "Filter by capability name (partial match)"
      },
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "completed", "blocked"],
        description: "Filter by status"
      },
      path: {
        type: "string",
        enum: ["A", "B", "C"],
        description: "Timeline path for date calculations"
      },
      include_dependencies: {
        type: "boolean",
        default: false,
        description: "Include dependency information"
      }
    }
  }
}
```

---

### get_quick_wins

Retrieve quick win initiatives.

```typescript
{
  name: "get_quick_wins",
  description: "Retrieve 6-month quick win initiatives. Can filter by status, capability, or ROI.",
  input_schema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "completed"],
        description: "Filter by status"
      },
      capability_id: {
        type: "string",
        format: "uuid",
        description: "Filter by related capability"
      },
      roi: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH"],
        description: "Filter by expected ROI"
      },
      investment: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH"],
        description: "Filter by investment level"
      }
    }
  }
}
```

---

### get_activity_log

Retrieve recent activity.

```typescript
{
  name: "get_activity_log",
  description: "Retrieve recent changes and activity. Useful for understanding what happened recently.",
  input_schema: {
    type: "object",
    properties: {
      table_name: {
        type: "string",
        enum: ["capabilities", "milestones", "quick_wins"],
        description: "Filter by affected table"
      },
      record_id: {
        type: "string",
        format: "uuid",
        description: "Filter by specific record"
      },
      limit: {
        type: "integer",
        default: 20,
        maximum: 100,
        description: "Maximum records to return"
      },
      days: {
        type: "integer",
        default: 7,
        description: "Look back N days"
      }
    }
  }
}
```

---

## Write Tools

### update_milestone_status

Update a milestone's status and notes.

```typescript
{
  name: "update_milestone_status",
  description: "Update the status of a milestone. Can also add progress notes.",
  input_schema: {
    type: "object",
    required: ["milestone_id", "status"],
    properties: {
      milestone_id: {
        type: "string",
        format: "uuid",
        description: "The milestone to update"
      },
      milestone_name: {
        type: "string",
        description: "Alternative: find milestone by name"
      },
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "completed", "blocked"],
        description: "New status"
      },
      notes: {
        type: "string",
        description: "Progress notes to add"
      },
      start_date: {
        type: "string",
        format: "date",
        description: "When work started (YYYY-MM-DD)"
      },
      end_date: {
        type: "string",
        format: "date",
        description: "When work completed (YYYY-MM-DD)"
      }
    }
  }
}
```

**Confirmation Required:**
Before executing, Claude should confirm:
> "I'll update the MES Foundation milestone to 'in_progress'. Is that correct?"

---

### update_capability_level

Update a capability's current maturity level.

```typescript
{
  name: "update_capability_level",
  description: "Update a capability's current maturity level. Used to record progress.",
  input_schema: {
    type: "object",
    required: ["capability_id", "new_level"],
    properties: {
      capability_id: {
        type: "string",
        format: "uuid",
        description: "The capability to update"
      },
      capability_name: {
        type: "string",
        description: "Alternative: find capability by name"
      },
      new_level: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        description: "New maturity level"
      },
      notes: {
        type: "string",
        description: "Reason for level change"
      }
    }
  }
}
```

---

### update_quick_win

Update a quick win's progress.

```typescript
{
  name: "update_quick_win",
  description: "Update a quick win's status or progress percentage.",
  input_schema: {
    type: "object",
    required: ["quick_win_id"],
    properties: {
      quick_win_id: {
        type: "string",
        format: "uuid",
        description: "The quick win to update"
      },
      quick_win_name: {
        type: "string",
        description: "Alternative: find by name"
      },
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "completed"],
        description: "New status"
      },
      progress_percent: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description: "Progress percentage"
      },
      notes: {
        type: "string",
        description: "Progress notes"
      }
    }
  }
}
```

---

### add_quick_win

Create a new quick win initiative.

```typescript
{
  name: "add_quick_win",
  description: "Create a new quick win initiative.",
  input_schema: {
    type: "object",
    required: ["name", "timeline_months"],
    properties: {
      name: {
        type: "string",
        description: "Quick win title"
      },
      description: {
        type: "string",
        description: "Detailed description"
      },
      capability_name: {
        type: "string",
        description: "Related capability (by name)"
      },
      timeline_months: {
        type: "integer",
        minimum: 1,
        maximum: 12,
        description: "Expected duration in months"
      },
      investment: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH"],
        description: "Investment level required"
      },
      roi: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH"],
        description: "Expected return on investment"
      },
      assigned_to: {
        type: "string",
        description: "Person/team responsible"
      }
    }
  }
}
```

---

## Analysis Tools

### analyze_dependencies

Analyze dependency relationships.

```typescript
{
  name: "analyze_dependencies",
  description: "Analyze what a capability depends on and what depends on it.",
  input_schema: {
    type: "object",
    required: ["target_id"],
    properties: {
      target_id: {
        type: "string",
        format: "uuid",
        description: "Capability or milestone ID"
      },
      target_name: {
        type: "string",
        description: "Alternative: find by name"
      },
      target_type: {
        type: "string",
        enum: ["capability", "milestone"],
        default: "capability"
      },
      direction: {
        type: "string",
        enum: ["upstream", "downstream", "both"],
        default: "both",
        description: "upstream = dependencies, downstream = dependents"
      },
      depth: {
        type: "integer",
        default: 3,
        maximum: 5,
        description: "How many levels deep to analyze"
      }
    }
  }
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "target": {
      "id": "uuid",
      "name": "Production Monitoring",
      "type": "capability"
    },
    "upstream": [
      {
        "id": "uuid",
        "name": "Drive 1.0",
        "relationship": "prerequisite",
        "depth": 1
      }
    ],
    "downstream": [
      {
        "id": "uuid",
        "name": "Planning & Scheduling",
        "relationship": "blocks",
        "depth": 1
      },
      {
        "id": "uuid",
        "name": "ETA Operations",
        "relationship": "blocks",
        "depth": 2
      }
    ],
    "critical_path": true
  }
}
```

---

### calculate_timeline_impact

What-if scenario analysis.

```typescript
{
  name: "calculate_timeline_impact",
  description: "Calculate the impact of delaying a milestone on the overall roadmap.",
  input_schema: {
    type: "object",
    required: ["milestone_id", "delay_months"],
    properties: {
      milestone_id: {
        type: "string",
        format: "uuid",
        description: "Milestone to delay"
      },
      milestone_name: {
        type: "string",
        description: "Alternative: find by name"
      },
      delay_months: {
        type: "integer",
        minimum: 1,
        maximum: 24,
        description: "Number of months to delay"
      },
      path: {
        type: "string",
        enum: ["A", "B", "C"],
        default: "B",
        description: "Timeline path to use for calculations"
      }
    }
  }
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "scenario": {
      "milestone": "Drive 1.0 Implementation",
      "original_end": "2026-06-01",
      "delayed_end": "2026-09-01",
      "delay_months": 3
    },
    "impact": [
      {
        "milestone": "Production Monitoring L2→L3",
        "capability": "Production Monitoring",
        "original_start": "2026-06-01",
        "new_start": "2026-09-01",
        "delay_months": 3
      },
      {
        "milestone": "MES Foundation",
        "capability": "Production Monitoring",
        "original_start": "2026-07-01",
        "new_start": "2026-10-01",
        "delay_months": 3
      }
    ],
    "summary": {
      "total_affected": 4,
      "original_completion": "2027-12-01",
      "new_completion": "2028-03-01",
      "overall_delay_months": 3
    }
  }
}
```

---

### generate_progress_report

Generate a summary report.

```typescript
{
  name: "generate_progress_report",
  description: "Generate a progress report summarizing roadmap status.",
  input_schema: {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: ["summary", "detailed"],
        default: "summary",
        description: "Report detail level"
      },
      time_period: {
        type: "string",
        enum: ["week", "month", "quarter", "all"],
        default: "month",
        description: "Time period to report on"
      },
      include_quick_wins: {
        type: "boolean",
        default: true
      },
      include_blockers: {
        type: "boolean",
        default: true
      },
      include_recommendations: {
        type: "boolean",
        default: true
      }
    }
  }
}
```

---

## Error Handling

### Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `NOT_FOUND` | Record not found | Check ID or name |
| `PERMISSION_DENIED` | User lacks permission | Need Editor/Admin role |
| `VALIDATION_ERROR` | Invalid parameters | Check parameter types |
| `AMBIGUOUS_MATCH` | Multiple matches for name | Be more specific |
| `DATABASE_ERROR` | Database operation failed | Retry or contact support |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "No capability found with name 'Production'",
    "details": {
      "searched_name": "Production",
      "suggestions": ["Production Monitoring", "Production Planning"]
    }
  }
}
```

### Graceful Degradation

When a tool fails, Claude should:
1. Explain what went wrong
2. Suggest alternatives
3. Offer to try different parameters

---

## Testing

### Unit Tests

Each tool should have tests for:
- Valid parameter combinations
- Missing required parameters
- Invalid parameter types
- Empty results
- Permission checks

### Integration Tests

Test full flow:
1. User message → Claude
2. Claude → Tool selection
3. Tool → Database
4. Response → Claude
5. Claude → User-friendly message

### Test Data

Use dedicated test capabilities:
- `TEST_Capability_001`
- `TEST_Capability_002`

Clean up test data after each run.

---

## Related Documentation

- [API Reference](../docs/API.md)
- [Database Schema](../docs/DATABASE.md)
- [Data Model Spec](./DATA_MODEL_SPEC.md)
