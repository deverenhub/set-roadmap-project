# API Reference

Complete API documentation for the SET Interactive Roadmap Platform.

## 📋 Table of Contents

- [Authentication](#authentication)
- [REST API Endpoints](#rest-api-endpoints)
- [Real-time Subscriptions](#real-time-subscriptions)
- [MCP Tools](#mcp-tools)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)

---

## Authentication

All API requests require authentication via Supabase Auth.

### Sign In

```typescript
import { supabase } from '@/lib/supabase';

// Email/Password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Magic Link
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
});

// OAuth (Google)
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});
```

### Session Management

```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});

// Sign out
await supabase.auth.signOut();
```

### Headers

The Supabase client automatically includes authentication headers:

```
Authorization: Bearer <JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
```

---

## REST API Endpoints

Base URL: `https://<project-ref>.supabase.co/rest/v1`

### Capabilities

#### List All Capabilities

```http
GET /capabilities
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `select` | string | Columns to return (default: *) |
| `priority` | string | Filter by priority (eq.CRITICAL) |
| `owner` | string | Filter by owner |
| `order` | string | Sort order (e.g., priority.desc) |
| `limit` | integer | Max results |
| `offset` | integer | Pagination offset |

**Example:**

```typescript
const { data, error } = await supabase
  .from('capabilities')
  .select('*')
  .eq('priority', 'CRITICAL')
  .order('name');
```

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Production Monitoring",
      "current_level": 1,
      "target_level": 4,
      "owner": "Operations",
      "priority": "CRITICAL",
      "qol_impact": "Real-time visibility into vehicle processing"
    }
  ]
}
```

#### Get Single Capability

```http
GET /capabilities?id=eq.<uuid>
```

```typescript
const { data, error } = await supabase
  .from('capabilities')
  .select('*, milestones(*), quick_wins(*)')
  .eq('id', capabilityId)
  .single();
```

#### Create Capability

```http
POST /capabilities
```

```typescript
const { data, error } = await supabase
  .from('capabilities')
  .insert({
    name: 'New Capability',
    current_level: 1,
    target_level: 4,
    priority: 'HIGH'
  })
  .select()
  .single();
```

#### Update Capability

```http
PATCH /capabilities?id=eq.<uuid>
```

```typescript
const { data, error } = await supabase
  .from('capabilities')
  .update({ current_level: 2 })
  .eq('id', capabilityId)
  .select()
  .single();
```

#### Delete Capability

```http
DELETE /capabilities?id=eq.<uuid>
```

```typescript
const { error } = await supabase
  .from('capabilities')
  .delete()
  .eq('id', capabilityId);
```

---

### Milestones

#### List Milestones

```typescript
const { data, error } = await supabase
  .from('milestones')
  .select('*, capabilities(name, priority)')
  .order('from_level');
```

#### Get Milestones by Capability

```typescript
const { data, error } = await supabase
  .from('milestones')
  .select('*')
  .eq('capability_id', capabilityId)
  .order('from_level');
```

#### Update Milestone Status

```typescript
const { data, error } = await supabase
  .from('milestones')
  .update({ 
    status: 'in_progress',
    start_date: new Date().toISOString().split('T')[0],
    notes: 'Started implementation'
  })
  .eq('id', milestoneId)
  .select()
  .single();
```

---

### Quick Wins

#### List Quick Wins by Status

```typescript
const { data, error } = await supabase
  .from('quick_wins')
  .select('*, capabilities(name)')
  .eq('status', 'in_progress')
  .order('order');
```

#### Update Quick Win Progress

```typescript
const { data, error } = await supabase
  .from('quick_wins')
  .update({ 
    progress_percent: 75,
    status: 'in_progress'
  })
  .eq('id', quickWinId)
  .select()
  .single();
```

#### Reorder Quick Wins (Kanban)

```typescript
// Update order for multiple items
const updates = items.map((item, index) => ({
  id: item.id,
  order: index,
  status: item.status
}));

const { error } = await supabase
  .from('quick_wins')
  .upsert(updates);
```

---

### Activity Log

#### Get Recent Activity

```typescript
const { data, error } = await supabase
  .from('activity_log')
  .select('*, users(full_name)')
  .order('created_at', { ascending: false })
  .limit(50);
```

#### Get Activity for Record

```typescript
const { data, error } = await supabase
  .from('activity_log')
  .select('*')
  .eq('table_name', 'capabilities')
  .eq('record_id', capabilityId)
  .order('created_at', { ascending: false });
```

---

## Real-time Subscriptions

### Subscribe to Table Changes

```typescript
// Subscribe to all capability changes
const channel = supabase
  .channel('capabilities-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE, or *
      schema: 'public',
      table: 'capabilities'
    },
    (payload) => {
      console.log('Change received:', payload);
      // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      // payload.new: new record data
      // payload.old: old record data (for UPDATE/DELETE)
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

### Subscribe with Filters

```typescript
// Only critical capabilities
const channel = supabase
  .channel('critical-capabilities')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'capabilities',
      filter: 'priority=eq.CRITICAL'
    },
    (payload) => {
      console.log('Critical capability updated:', payload.new);
    }
  )
  .subscribe();
```

### Subscribe to Multiple Tables

```typescript
const channel = supabase
  .channel('roadmap-updates')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'capabilities' },
    handleCapabilityChange
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'milestones' },
    handleMilestoneChange
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'quick_wins' },
    handleQuickWinChange
  )
  .subscribe();
```

---

## MCP Tools

The AI chat interface uses Model Context Protocol (MCP) tools to interact with the database.

### Tool: get_capabilities

Retrieve capabilities with optional filtering.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "priority": {
      "type": "string",
      "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      "description": "Filter by priority level"
    },
    "owner": {
      "type": "string",
      "description": "Filter by owner"
    },
    "include_milestones": {
      "type": "boolean",
      "default": false,
      "description": "Include related milestones"
    },
    "include_quick_wins": {
      "type": "boolean",
      "default": false,
      "description": "Include related quick wins"
    }
  }
}
```

**Example Request:**

```
User: "Show me all CRITICAL capabilities with their milestones"
```

**Tool Call:**

```json
{
  "tool": "get_capabilities",
  "parameters": {
    "priority": "CRITICAL",
    "include_milestones": true
  }
}
```

**Response:**

```json
{
  "capabilities": [
    {
      "id": "...",
      "name": "Production Monitoring",
      "current_level": 1,
      "target_level": 4,
      "priority": "CRITICAL",
      "milestones": [
        {
          "name": "Basic Visibility",
          "from_level": 1,
          "to_level": 2,
          "status": "in_progress"
        }
      ]
    }
  ],
  "count": 2
}
```

---

### Tool: get_milestones

Retrieve milestones with timeline information.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "capability_id": {
      "type": "string",
      "format": "uuid",
      "description": "Filter by capability"
    },
    "status": {
      "type": "string",
      "enum": ["not_started", "in_progress", "completed", "blocked"],
      "description": "Filter by status"
    },
    "path": {
      "type": "string",
      "enum": ["A", "B", "C"],
      "description": "Timeline path to calculate dates"
    }
  }
}
```

---

### Tool: update_milestone_status

Update the status of a milestone.

**Input Schema:**

```json
{
  "type": "object",
  "required": ["milestone_id", "status"],
  "properties": {
    "milestone_id": {
      "type": "string",
      "format": "uuid"
    },
    "status": {
      "type": "string",
      "enum": ["not_started", "in_progress", "completed", "blocked"]
    },
    "notes": {
      "type": "string",
      "description": "Optional progress notes"
    }
  }
}
```

**Example Request:**

```
User: "Mark the MES Foundation milestone as in progress"
```

**Tool Call:**

```json
{
  "tool": "update_milestone_status",
  "parameters": {
    "milestone_id": "abc-123",
    "status": "in_progress",
    "notes": "Started implementation phase"
  }
}
```

---

### Tool: analyze_dependencies

Analyze dependency relationships for a capability or milestone.

**Input Schema:**

```json
{
  "type": "object",
  "required": ["target_id"],
  "properties": {
    "target_id": {
      "type": "string",
      "format": "uuid",
      "description": "Capability or milestone ID"
    },
    "target_type": {
      "type": "string",
      "enum": ["capability", "milestone"],
      "default": "capability"
    },
    "direction": {
      "type": "string",
      "enum": ["upstream", "downstream", "both"],
      "default": "both",
      "description": "upstream = what this depends on, downstream = what depends on this"
    }
  }
}
```

**Example Response:**

```json
{
  "target": {
    "id": "...",
    "name": "Production Monitoring"
  },
  "upstream": [
    {
      "id": "...",
      "name": "Drive 1.0",
      "type": "prerequisite"
    }
  ],
  "downstream": [
    {
      "id": "...",
      "name": "Planning & Scheduling",
      "relationship": "blocked_by"
    }
  ]
}
```

---

### Tool: calculate_timeline_impact

Run what-if scenario for timeline changes.

**Input Schema:**

```json
{
  "type": "object",
  "required": ["milestone_id", "delay_months"],
  "properties": {
    "milestone_id": {
      "type": "string",
      "format": "uuid"
    },
    "delay_months": {
      "type": "integer",
      "minimum": 1,
      "description": "Months to delay"
    },
    "path": {
      "type": "string",
      "enum": ["A", "B", "C"],
      "default": "B"
    }
  }
}
```

**Example Request:**

```
User: "What happens if Drive 1.0 is delayed by 3 months?"
```

**Response:**

```json
{
  "scenario": {
    "milestone": "Drive 1.0 Implementation",
    "original_end": "2026-06-01",
    "delayed_end": "2026-09-01",
    "delay_months": 3
  },
  "impact": [
    {
      "milestone": "Production Monitoring L2→L3",
      "original_start": "2026-06-01",
      "new_start": "2026-09-01",
      "delay_months": 3
    },
    {
      "milestone": "Planning & Scheduling L1→L2",
      "original_start": "2026-06-01",
      "new_start": "2026-09-01",
      "delay_months": 3
    }
  ],
  "summary": "Delaying Drive 1.0 by 3 months would cascade to 4 downstream milestones, pushing the final ETA target from Q4 2027 to Q1 2028."
}
```

---

### Tool: generate_progress_report

Generate a summary report of roadmap progress.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "format": {
      "type": "string",
      "enum": ["summary", "detailed"],
      "default": "summary"
    },
    "include_quick_wins": {
      "type": "boolean",
      "default": true
    },
    "time_period": {
      "type": "string",
      "enum": ["week", "month", "quarter", "all"],
      "default": "month"
    }
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "PGRST301",
    "message": "JWT expired",
    "details": null,
    "hint": null
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PGRST301` | 401 | JWT expired or invalid |
| `PGRST302` | 403 | RLS policy violation |
| `PGRST116` | 406 | No rows returned |
| `23505` | 409 | Unique constraint violation |
| `23503` | 409 | Foreign key violation |

### Handling Errors

```typescript
const { data, error } = await supabase
  .from('capabilities')
  .insert(newCapability)
  .select()
  .single();

if (error) {
  if (error.code === 'PGRST301') {
    // Redirect to login
    router.push('/login');
  } else if (error.code === '23505') {
    // Duplicate entry
    toast.error('A capability with this name already exists');
  } else {
    // Generic error
    toast.error('An error occurred');
    console.error(error);
  }
  return;
}

// Success
toast.success('Capability created');
```

---

## Rate Limits

### Supabase Limits (Pro Tier)

| Resource | Limit |
|----------|-------|
| API requests | 1,000/second |
| Realtime connections | 500 concurrent |
| Database size | 8 GB |
| Edge Function invocations | 500K/month |

### Claude API Limits

| Resource | Limit |
|----------|-------|
| Requests per minute | 50 |
| Tokens per minute | 40,000 |
| Tokens per day | 1,000,000 |

### Best Practices

1. **Use caching** - TanStack Query caches responses automatically
2. **Batch operations** - Use `.upsert()` for multiple updates
3. **Optimize subscriptions** - Subscribe only to needed tables/filters
4. **Implement retry logic** - Use exponential backoff for failed requests

```typescript
// Example retry logic
async function fetchWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
}
```

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md)
- [Database Schema](./DATABASE.md)
- [MCP Tools Spec](../specs/MCP_TOOLS_SPEC.md)
