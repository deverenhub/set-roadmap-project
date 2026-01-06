// supabase/functions/ai-chat/index.ts
// Claude AI Chat Integration with Tool Use
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tool definitions for Claude
const CLAUDE_TOOLS = [
  {
    name: 'get_capabilities',
    description: 'Get all capabilities or filter by priority. Capabilities are the main areas of transformation in the SET VPC Roadmap.',
    input_schema: {
      type: 'object',
      properties: {
        priority: {
          type: 'string',
          description: 'Filter by priority level (CRITICAL, HIGH, MEDIUM, LOW)',
          enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
        },
      },
    },
  },
  {
    name: 'get_milestones',
    description: 'Get milestones with optional filters. Milestones are specific deliverables within capabilities.',
    input_schema: {
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
    description: 'Get quick wins with optional filters. Quick wins are short-term achievable items.',
    input_schema: {
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
    name: 'get_dashboard_kpis',
    description: 'Get key performance indicators for the dashboard including overall progress, active milestones, and completed quick wins.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'analyze_dependencies',
    description: 'Analyze milestone dependencies and find blockers in the roadmap.',
    input_schema: {
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
    name: 'generate_progress_report',
    description: 'Generate a comprehensive progress report with capability, milestone, and quick win statistics.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_maturity_definitions',
    description: 'Get maturity level definitions (1-5) that describe the progression scale.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_technology_options',
    description: 'Get technology options available for implementation.',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by technology category',
        },
      },
    },
  },
  {
    name: 'get_activity_log',
    description: 'Get recent activity log entries showing changes made to the roadmap.',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of entries to return (default: 10)',
        },
      },
    },
  },
];

// System prompt for Claude
const SYSTEM_PROMPT = `You are an AI assistant for the SET (Southeast Toyota) VPC (Vehicle Processing Center) Roadmap platform. You help users understand their digital transformation progress, capabilities, milestones, and quick wins.

Key concepts:
- **Capabilities**: Main transformation areas with maturity levels from 1-5
- **Milestones**: Specific deliverables within capabilities
- **Quick Wins**: Short-term achievable items to demonstrate progress
- **Maturity Levels**: Scale from 1 (Initial) to 5 (Optimized)

When users ask questions:
1. Use the available tools to fetch real data
2. Provide clear, concise answers with specific numbers and details
3. Highlight blocked items or areas needing attention
4. Suggest actionable next steps when appropriate

Be professional, helpful, and focused on providing actionable insights about the roadmap progress.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Anthropic API key
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract and verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    console.log('Auth check - User:', user?.id, 'Error:', userError?.message);
    if (userError || !user) {
      console.error('Auth failed:', userError?.message);
      return new Response(
        JSON.stringify({ error: `Unauthorized: ${userError?.message || 'No user found'}` }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { messages, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Claude API
    let response = await callClaude(anthropicApiKey, messages, CLAUDE_TOOLS);

    // Process tool calls if any
    const toolResults: any[] = [];
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter((block: any) => block.type === 'tool_use');

      for (const toolUse of toolUseBlocks) {
        const result = await executeToolCall(supabase, toolUse.name, toolUse.input);
        toolResults.push({
          tool: toolUse.name,
          result,
        });
      }

      // Continue conversation with tool results
      const toolResultMessages = toolUseBlocks.map((toolUse: any, index: number) => ({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(toolResults[index].result),
      }));

      // Add assistant response and tool results to messages
      const newMessages = [
        ...messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResultMessages },
      ];

      response = await callClaude(anthropicApiKey, newMessages, CLAUDE_TOOLS);
    }

    // Extract text response
    const textBlocks = response.content.filter((block: any) => block.type === 'text');
    const assistantMessage = textBlocks.map((block: any) => block.text).join('\n');

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        toolCalls: toolResults,
        usage: response.usage,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Chat Error:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Call Claude API
async function callClaude(apiKey: string, messages: any[], tools: any[]) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API Error Response:', response.status, errorText);
    let errorMessage = 'Claude API error';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(`Claude API (${response.status}): ${errorMessage}`);
  }

  return await response.json();
}

// Execute tool calls
async function executeToolCall(supabase: any, toolName: string, args: any) {
  switch (toolName) {
    case 'get_capabilities':
      return await getCapabilities(supabase, args);
    case 'get_milestones':
      return await getMilestones(supabase, args);
    case 'get_quick_wins':
      return await getQuickWins(supabase, args);
    case 'get_dashboard_kpis':
      return await getDashboardKPIs(supabase);
    case 'analyze_dependencies':
      return await analyzeDependencies(supabase, args);
    case 'generate_progress_report':
      return await generateProgressReport(supabase);
    case 'get_maturity_definitions':
      return await getMaturityDefinitions(supabase);
    case 'get_technology_options':
      return await getTechnologyOptions(supabase, args);
    case 'get_activity_log':
      return await getActivityLog(supabase, args);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Database query functions
async function getCapabilities(supabase: any, args: { priority?: string }) {
  let query = supabase
    .from('capabilities')
    .select('*, milestones(id, status), quick_wins(id, status)')
    .order('priority');

  if (args.priority) {
    query = query.eq('priority', args.priority);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getMilestones(supabase: any, args: { status?: string; capability_id?: string }) {
  let query = supabase
    .from('milestones')
    .select('*, capability:capabilities(id, name, priority)')
    .order('created_at');

  if (args.status) {
    query = query.eq('status', args.status);
  }
  if (args.capability_id) {
    query = query.eq('capability_id', args.capability_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getQuickWins(supabase: any, args: { status?: string; category?: string }) {
  let query = supabase
    .from('quick_wins')
    .select('*, capability:capabilities(id, name)')
    .order('order');

  if (args.status) {
    query = query.eq('status', args.status);
  }
  if (args.category) {
    query = query.eq('category', args.category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getDashboardKPIs(supabase: any) {
  const [capsRes, msRes, qwRes] = await Promise.all([
    supabase.from('capabilities').select('current_level, target_level, priority'),
    supabase.from('milestones').select('status'),
    supabase.from('quick_wins').select('status'),
  ]);

  const capabilities = capsRes.data || [];
  const milestones = msRes.data || [];
  const quickWins = qwRes.data || [];

  const overallProgress = capabilities.reduce((sum: number, c: any) => {
    const progress = c.target_level > 1
      ? ((c.current_level - 1) / (c.target_level - 1)) * 100
      : 100;
    return sum + progress;
  }, 0) / (capabilities.length || 1);

  return {
    overallProgress: Math.round(overallProgress),
    totalCapabilities: capabilities.length,
    activeMilestones: milestones.filter((m: any) => m.status === 'in_progress').length,
    completedMilestones: milestones.filter((m: any) => m.status === 'completed').length,
    totalMilestones: milestones.length,
    completedQuickWins: quickWins.filter((q: any) => q.status === 'completed').length,
    totalQuickWins: quickWins.length,
    criticalCapabilities: capabilities.filter((c: any) => c.priority === 'CRITICAL').length,
    blockedMilestones: milestones.filter((m: any) => m.status === 'blocked').length,
  };
}

async function analyzeDependencies(supabase: any, args: { capability_id?: string }) {
  const { data: milestones, error } = await supabase
    .from('milestones')
    .select('id, name, status, dependencies, capability_id, capability:capabilities(name)');

  if (error) throw error;

  const statusMap = new Map<string, string>();
  milestones?.forEach((ms: any) => {
    statusMap.set(ms.id, ms.status);
  });

  const blockedChains: any[] = [];
  milestones?.forEach((ms: any) => {
    if (ms.status === 'blocked') {
      const chain = {
        milestone: ms.name,
        capability: ms.capability?.name,
        blockedDependencies: (ms.dependencies || []).filter(
          (depId: string) => statusMap.get(depId) !== 'completed'
        ),
      };
      if (chain.blockedDependencies.length > 0) {
        blockedChains.push(chain);
      }
    }
  });

  return {
    totalMilestones: milestones?.length || 0,
    blockedCount: milestones?.filter((m: any) => m.status === 'blocked').length || 0,
    blockedChains,
    summary: `Found ${blockedChains.length} milestones with unresolved dependencies.`,
  };
}

async function generateProgressReport(supabase: any) {
  const [capsRes, msRes, qwRes] = await Promise.all([
    supabase.from('capabilities').select('*'),
    supabase.from('milestones').select('*'),
    supabase.from('quick_wins').select('*'),
  ]);

  const capabilities = capsRes.data || [];
  const milestones = msRes.data || [];
  const quickWins = qwRes.data || [];

  const overallProgress = capabilities.reduce((sum: number, c: any) => {
    const progress = c.target_level > 1
      ? ((c.current_level - 1) / (c.target_level - 1)) * 100
      : 100;
    return sum + progress;
  }, 0) / (capabilities.length || 1);

  return {
    generatedAt: new Date().toISOString(),
    summary: `Overall transformation is ${Math.round(overallProgress)}% complete.`,
    capabilities: {
      total: capabilities.length,
      critical: capabilities.filter((c: any) => c.priority === 'CRITICAL').length,
      averageProgress: Math.round(overallProgress),
      byPriority: {
        CRITICAL: capabilities.filter((c: any) => c.priority === 'CRITICAL').length,
        HIGH: capabilities.filter((c: any) => c.priority === 'HIGH').length,
        MEDIUM: capabilities.filter((c: any) => c.priority === 'MEDIUM').length,
        LOW: capabilities.filter((c: any) => c.priority === 'LOW').length,
      },
    },
    milestones: {
      total: milestones.length,
      completed: milestones.filter((m: any) => m.status === 'completed').length,
      inProgress: milestones.filter((m: any) => m.status === 'in_progress').length,
      blocked: milestones.filter((m: any) => m.status === 'blocked').length,
      notStarted: milestones.filter((m: any) => m.status === 'not_started').length,
    },
    quickWins: {
      total: quickWins.length,
      completed: quickWins.filter((q: any) => q.status === 'completed').length,
      inProgress: quickWins.filter((q: any) => q.status === 'in_progress').length,
      notStarted: quickWins.filter((q: any) => q.status === 'not_started').length,
    },
  };
}

async function getMaturityDefinitions(supabase: any) {
  const { data, error } = await supabase
    .from('maturity_definitions')
    .select('*')
    .order('level');

  if (error) throw error;
  return data;
}

async function getTechnologyOptions(supabase: any, args: { category?: string }) {
  let query = supabase.from('technology_options').select('*');

  if (args.category) {
    query = query.eq('category', args.category);
  }

  const { data, error } = await query.order('name');
  if (error) throw error;
  return data;
}

async function getActivityLog(supabase: any, args: { limit?: number }) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*, user:users(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(args.limit || 10);

  if (error) throw error;
  return data;
}
