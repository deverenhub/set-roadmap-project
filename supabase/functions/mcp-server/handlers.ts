// supabase/functions/mcp-server/handlers.ts
// Tool handlers for MCP Server
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { TOOLS } from './tools.ts';

export function getToolsList() {
  return { tools: TOOLS };
}

export async function handleToolCall(
  supabase: SupabaseClient,
  toolName: string,
  args: Record<string, any>,
  userId: string
) {
  const tool = TOOLS.find((t) => t.name === toolName);
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  // Check if tool requires confirmation for write operations
  if (tool.requiresConfirmation && !args.confirmation) {
    return {
      requiresConfirmation: true,
      message: `This action requires confirmation. Please confirm to proceed with ${toolName}.`,
    };
  }

  switch (toolName) {
    case 'get_capabilities':
      return await getCapabilities(supabase, args);

    case 'get_milestones':
      return await getMilestones(supabase, args);

    case 'get_quick_wins':
      return await getQuickWins(supabase, args);

    case 'get_activity_log':
      return await getActivityLog(supabase, args);

    case 'get_maturity_definitions':
      return await getMaturityDefinitions(supabase);

    case 'get_technology_options':
      return await getTechnologyOptions(supabase, args);

    case 'analyze_dependencies':
      return await analyzeDependencies(supabase, args);

    case 'calculate_timeline_impact':
      return await calculateTimelineImpact(supabase, args);

    case 'generate_progress_report':
      return await generateProgressReport(supabase);

    case 'get_dashboard_kpis':
      return await getDashboardKPIs(supabase);

    case 'update_milestone_status':
      return await updateMilestoneStatus(supabase, args, userId);

    case 'update_capability_level':
      return await updateCapabilityLevel(supabase, args, userId);

    case 'update_quick_win':
      return await updateQuickWin(supabase, args, userId);

    case 'add_quick_win':
      return await addQuickWin(supabase, args, userId);

    default:
      throw new Error(`Handler not implemented for tool: ${toolName}`);
  }
}

// Read Operations
async function getCapabilities(supabase: SupabaseClient, args: { priority?: string }) {
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

async function getMilestones(supabase: SupabaseClient, args: { status?: string; capability_id?: string }) {
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

async function getQuickWins(supabase: SupabaseClient, args: { status?: string; category?: string }) {
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

async function getActivityLog(supabase: SupabaseClient, args: { limit?: number }) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*, user:users(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(args.limit || 20);

  if (error) throw error;
  return data;
}

async function getMaturityDefinitions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('maturity_definitions')
    .select('*')
    .order('level');

  if (error) throw error;
  return data;
}

async function getTechnologyOptions(supabase: SupabaseClient, args: { category?: string }) {
  let query = supabase.from('technology_options').select('*');

  if (args.category) {
    query = query.eq('category', args.category);
  }

  const { data, error } = await query.order('name');
  if (error) throw error;
  return data;
}

// Analysis Operations
async function analyzeDependencies(supabase: SupabaseClient, args: { capability_id?: string }) {
  const { data: milestones, error } = await supabase
    .from('milestones')
    .select('id, name, status, dependencies, capability_id, capability:capabilities(name)');

  if (error) throw error;

  // Build dependency graph
  const dependencyMap = new Map<string, string[]>();
  const statusMap = new Map<string, string>();

  milestones?.forEach((ms: any) => {
    dependencyMap.set(ms.id, ms.dependencies || []);
    statusMap.set(ms.id, ms.status);
  });

  // Find blocked chains
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

async function calculateTimelineImpact(supabase: SupabaseClient, args: { milestone_id: string; delay_months: number }) {
  const { data: milestone, error } = await supabase
    .from('milestones')
    .select('*, capability:capabilities(name)')
    .eq('id', args.milestone_id)
    .single();

  if (error) throw error;

  // Find dependent milestones
  const { data: dependents } = await supabase
    .from('milestones')
    .select('id, name, capability:capabilities(name)')
    .contains('dependencies', [args.milestone_id]);

  return {
    affectedMilestone: milestone?.name,
    capability: milestone?.capability?.name,
    delayMonths: args.delay_months,
    impactedItems: dependents?.length || 0,
    impactedMilestones: dependents?.map((d: any) => ({
      name: d.name,
      capability: d.capability?.name,
    })),
    summary: `Delaying "${milestone?.name}" by ${args.delay_months} months will impact ${dependents?.length || 0} dependent milestones.`,
  };
}

async function generateProgressReport(supabase: SupabaseClient) {
  const [capsRes, msRes, qwRes] = await Promise.all([
    supabase.from('capabilities').select('*'),
    supabase.from('milestones').select('*'),
    supabase.from('quick_wins').select('*'),
  ]);

  const capabilities = capsRes.data || [];
  const milestones = msRes.data || [];
  const quickWins = qwRes.data || [];

  // Calculate progress metrics
  const overallProgress = capabilities.reduce((sum, c) => {
    const progress = c.target_level > 1
      ? ((c.current_level - 1) / (c.target_level - 1)) * 100
      : 100;
    return sum + progress;
  }, 0) / (capabilities.length || 1);

  const msCompleted = milestones.filter((m) => m.status === 'completed').length;
  const msInProgress = milestones.filter((m) => m.status === 'in_progress').length;
  const msBlocked = milestones.filter((m) => m.status === 'blocked').length;

  const qwCompleted = quickWins.filter((q) => q.status === 'completed').length;
  const qwInProgress = quickWins.filter((q) => q.status === 'in_progress').length;

  return {
    generatedAt: new Date().toISOString(),
    summary: `Overall transformation is ${Math.round(overallProgress)}% complete.`,
    capabilities: {
      total: capabilities.length,
      critical: capabilities.filter((c) => c.priority === 'CRITICAL').length,
      averageProgress: Math.round(overallProgress),
    },
    milestones: {
      total: milestones.length,
      completed: msCompleted,
      inProgress: msInProgress,
      blocked: msBlocked,
      completionRate: Math.round((msCompleted / (milestones.length || 1)) * 100),
    },
    quickWins: {
      total: quickWins.length,
      completed: qwCompleted,
      inProgress: qwInProgress,
      completionRate: Math.round((qwCompleted / (quickWins.length || 1)) * 100),
    },
  };
}

async function getDashboardKPIs(supabase: SupabaseClient) {
  const [capsRes, msRes, qwRes] = await Promise.all([
    supabase.from('capabilities').select('current_level, target_level, priority'),
    supabase.from('milestones').select('status'),
    supabase.from('quick_wins').select('status'),
  ]);

  const capabilities = capsRes.data || [];
  const milestones = msRes.data || [];
  const quickWins = qwRes.data || [];

  const overallProgress = capabilities.reduce((sum, c) => {
    const progress = c.target_level > 1
      ? ((c.current_level - 1) / (c.target_level - 1)) * 100
      : 100;
    return sum + progress;
  }, 0) / (capabilities.length || 1);

  return {
    overallProgress: Math.round(overallProgress),
    activeMilestones: milestones.filter((m) => m.status === 'in_progress').length,
    completedQuickWins: quickWins.filter((q) => q.status === 'completed').length,
    totalQuickWins: quickWins.length,
    criticalCapabilities: capabilities.filter((c) => c.priority === 'CRITICAL').length,
    blockedMilestones: milestones.filter((m) => m.status === 'blocked').length,
  };
}

// Write Operations (require confirmation)
async function updateMilestoneStatus(
  supabase: SupabaseClient,
  args: { milestone_id: string; status: string },
  userId: string
) {
  const updates: any = { status: args.status };

  // Auto-set dates based on status
  if (args.status === 'in_progress' && !updates.start_date) {
    updates.start_date = new Date().toISOString().split('T')[0];
  }
  if (args.status === 'completed' && !updates.end_date) {
    updates.end_date = new Date().toISOString().split('T')[0];
  }

  const { data, error } = await supabase
    .from('milestones')
    .update(updates)
    .eq('id', args.milestone_id)
    .select()
    .single();

  if (error) throw error;
  return { success: true, milestone: data };
}

async function updateCapabilityLevel(
  supabase: SupabaseClient,
  args: { capability_id: string; current_level: number },
  userId: string
) {
  const { data, error } = await supabase
    .from('capabilities')
    .update({ current_level: args.current_level })
    .eq('id', args.capability_id)
    .select()
    .single();

  if (error) throw error;
  return { success: true, capability: data };
}

async function updateQuickWin(
  supabase: SupabaseClient,
  args: { quick_win_id: string; status?: string; progress_percent?: number },
  userId: string
) {
  const updates: any = {};
  if (args.status) updates.status = args.status;
  if (args.progress_percent !== undefined) updates.progress_percent = args.progress_percent;

  const { data, error } = await supabase
    .from('quick_wins')
    .update(updates)
    .eq('id', args.quick_win_id)
    .select()
    .single();

  if (error) throw error;
  return { success: true, quickWin: data };
}

async function addQuickWin(
  supabase: SupabaseClient,
  args: { name: string; description?: string; timeline_months: number; category?: string },
  userId: string
) {
  const { data, error } = await supabase
    .from('quick_wins')
    .insert({
      name: args.name,
      description: args.description,
      timeline_months: args.timeline_months,
      category: args.category,
      status: 'not_started',
    })
    .select()
    .single();

  if (error) throw error;
  return { success: true, quickWin: data };
}
