// src/hooks/useAIChat.ts
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from './useUser';
import { useChatStore } from '@/stores/chatStore';
import { generateId } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    tool: string;
    result?: any;
  }>;
}

interface MCPToolCall {
  tool: string;
  arguments: Record<string, any>;
  confirmation?: boolean;
}

interface MCPResponse {
  success: boolean;
  result?: any;
  error?: string;
}

// Suggested queries for the AI assistant
export const suggestedQueries = [
  'What is our overall progress?',
  'Which capabilities are critical?',
  'Show me blocked milestones',
  'What quick wins are in progress?',
  'Generate a progress report',
  'Analyze dependencies',
];

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: session } = useSession();
  const { sessionId, setSessionId } = useChatStore();

  // Call tool directly (client-side implementation)
  const callTool = useCallback(async (
    toolCall: MCPToolCall
  ): Promise<MCPResponse> => {
    try {
      const result = await handleToolCallClient(toolCall.tool, toolCall.arguments);
      return { success: true, result };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }, []);

  // Send message to AI
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Create new session if needed
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateId();
      setSessionId(currentSessionId);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Determine which tool to call based on message content
      const toolCall = parseUserIntent(content);

      if (toolCall) {
        const response = await callTool(toolCall);

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: formatToolResponse(toolCall.tool, response),
          timestamp: new Date(),
          toolCalls: [{ tool: toolCall.tool, result: response.result }],
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Save to database
        await saveChatHistory(currentSessionId, userMessage, assistantMessage);
      } else {
        // Generic response for unrecognized queries
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: "I can help you with roadmap queries. Try asking about:\n\n• Overall progress and status\n• Specific capabilities or milestones\n• Quick wins and their status\n• Dependencies between items\n• Progress reports\n\nWhat would you like to know?",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, sessionId, setSessionId, callTool]);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Start new session
  const newSession = useCallback(() => {
    clearChat();
    setSessionId(generateId());
  }, [clearChat, setSessionId]);

  // Save chat to database
  const saveChatHistory = async (
    chatSessionId: string,
    userMsg: ChatMessage,
    assistantMsg: ChatMessage
  ) => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) return;

    const records = [
      {
        user_id: currentSession.user.id,
        session_id: chatSessionId,
        role: userMsg.role,
        content: userMsg.content,
        created_at: userMsg.timestamp.toISOString(),
      },
      {
        user_id: currentSession.user.id,
        session_id: chatSessionId,
        role: assistantMsg.role,
        content: assistantMsg.content,
        metadata: assistantMsg.toolCalls ? { toolCalls: assistantMsg.toolCalls } : null,
        created_at: assistantMsg.timestamp.toISOString(),
      },
    ];

    await supabase.from('chat_history').insert(records);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    clearChat,
    newSession,
    callTool,
  };
}

// Client-side tool handler (replaces Edge Function)
async function handleToolCallClient(toolName: string, args: Record<string, any>): Promise<any> {
  switch (toolName) {
    case 'get_capabilities':
      return await getCapabilities(args);
    case 'get_milestones':
      return await getMilestones(args);
    case 'get_quick_wins':
      return await getQuickWins(args);
    case 'get_activity_log':
      return await getActivityLog(args);
    case 'get_maturity_definitions':
      return await getMaturityDefinitions();
    case 'get_technology_options':
      return await getTechnologyOptions(args);
    case 'analyze_dependencies':
      return await analyzeDependencies(args);
    case 'generate_progress_report':
      return await generateProgressReport();
    case 'get_dashboard_kpis':
      return await getDashboardKPIs();
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Database query functions
async function getCapabilities(args: { priority?: string }) {
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

async function getMilestones(args: { status?: string; capability_id?: string }) {
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

async function getQuickWins(args: { status?: string; category?: string }) {
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

async function getActivityLog(args: { limit?: number }) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*, user:users(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(args.limit || 20);

  if (error) throw error;
  return data;
}

async function getMaturityDefinitions() {
  const { data, error } = await supabase
    .from('maturity_definitions')
    .select('*')
    .order('level');

  if (error) throw error;
  return data;
}

async function getTechnologyOptions(args: { category?: string }) {
  let query = supabase.from('technology_options').select('*');

  if (args.category) {
    query = query.eq('category', args.category);
  }

  const { data, error } = await query.order('name');
  if (error) throw error;
  return data;
}

async function analyzeDependencies(args: { capability_id?: string }) {
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

async function generateProgressReport() {
  const [capsRes, msRes, qwRes] = await Promise.all([
    supabase.from('capabilities').select('*'),
    supabase.from('milestones').select('*'),
    supabase.from('quick_wins').select('*'),
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

async function getDashboardKPIs() {
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

// Parse user intent and map to tool calls
function parseUserIntent(content: string): MCPToolCall | null {
  const lowerContent = content.toLowerCase();

  // Quick win queries (check before general "progress" to avoid false matches)
  if (lowerContent.includes('quick win')) {
    if (lowerContent.includes('progress') || lowerContent.includes('active')) {
      return { tool: 'get_quick_wins', arguments: { status: 'in_progress' } };
    }
    if (lowerContent.includes('complete')) {
      return { tool: 'get_quick_wins', arguments: { status: 'completed' } };
    }
    return { tool: 'get_quick_wins', arguments: {} };
  }

  // Milestone queries (check before general "progress" to avoid false matches)
  if (lowerContent.includes('milestone')) {
    if (lowerContent.includes('block')) {
      return { tool: 'get_milestones', arguments: { status: 'blocked' } };
    }
    if (lowerContent.includes('progress') || lowerContent.includes('active')) {
      return { tool: 'get_milestones', arguments: { status: 'in_progress' } };
    }
    return { tool: 'get_milestones', arguments: {} };
  }

  // Capability queries
  if (lowerContent.includes('capabilit')) {
    if (lowerContent.includes('critical') || lowerContent.includes('high priority')) {
      return { tool: 'get_capabilities', arguments: { priority: 'CRITICAL' } };
    }
    return { tool: 'get_capabilities', arguments: {} };
  }

  // Report generation (check before general "progress" to avoid false matches)
  if (lowerContent.includes('report')) {
    return { tool: 'generate_progress_report', arguments: {} };
  }

  // Progress/status queries (general dashboard KPIs)
  if (lowerContent.includes('progress') || lowerContent.includes('status') || lowerContent.includes('overall')) {
    return { tool: 'get_dashboard_kpis', arguments: {} };
  }

  // Dependency analysis
  if (lowerContent.includes('dependen')) {
    return { tool: 'analyze_dependencies', arguments: {} };
  }

  // Activity log
  if (lowerContent.includes('activity') || lowerContent.includes('recent') || lowerContent.includes('change')) {
    return { tool: 'get_activity_log', arguments: { limit: 10 } };
  }

  // Maturity definitions
  if (lowerContent.includes('maturity') || lowerContent.includes('level')) {
    return { tool: 'get_maturity_definitions', arguments: {} };
  }

  return null;
}

// Format tool response for display
export function formatToolResponse(tool: string, response: MCPResponse): string {
  if (!response.success) {
    return `Sorry, I encountered an error: ${response.error}`;
  }

  const result = response.result;

  switch (tool) {
    case 'get_dashboard_kpis':
      return `Here's the current status:\n\n` +
        `• Overall Progress: ${result.overallProgress}%\n` +
        `• Active Milestones: ${result.activeMilestones}\n` +
        `• Quick Wins: ${result.completedQuickWins}/${result.totalQuickWins} completed\n` +
        `• Blocked Items: ${result.blockedMilestones}`;

    case 'get_capabilities':
      if (!result?.length) return 'No capabilities found.';
      return `Found ${result.length} capabilities:\n\n` +
        result.slice(0, 5).map((c: any) =>
          `• **${c.name}** (${c.priority}) - Level ${c.current_level}→${c.target_level}`
        ).join('\n');

    case 'get_milestones':
      if (!result?.length) return 'No milestones found with that criteria.';
      return `Found ${result.length} milestones:\n\n` +
        result.slice(0, 5).map((m: any) =>
          `• **${m.name}** - ${m.status.replace('_', ' ')}`
        ).join('\n');

    case 'get_quick_wins':
      if (!result?.length) return 'No quick wins found with that criteria.';
      return `Found ${result.length} quick wins:\n\n` +
        result.slice(0, 5).map((q: any) =>
          `• **${q.name}** - ${q.status.replace('_', ' ')}`
        ).join('\n');

    case 'generate_progress_report':
      return `**Progress Report**\n\n${result.summary}\n\n` +
        `**Capabilities:** ${result.capabilities.total} total (${result.capabilities.critical} critical)\n` +
        `**Milestones:** ${result.milestones.completed}/${result.milestones.total} completed (${result.milestones.completionRate}%)\n` +
        `**Quick Wins:** ${result.quickWins.completed}/${result.quickWins.total} completed (${result.quickWins.completionRate}%)`;

    case 'analyze_dependencies':
      return `**Dependency Analysis**\n\n${result.summary}\n\n` +
        `Total Milestones: ${result.totalMilestones}\n` +
        `Blocked: ${result.blockedCount}`;

    case 'get_activity_log':
      if (!result?.length) return 'No recent activity found.';
      return `Recent activity:\n\n` +
        result.slice(0, 5).map((a: any) =>
          `• ${a.action} on ${a.table_name}`
        ).join('\n');

    case 'get_maturity_definitions':
      if (!result?.length) return 'Maturity definitions not found.';
      return `**Maturity Levels:**\n\n` +
        result.map((d: any) =>
          `**Level ${d.level}: ${d.name}**\n${d.description}`
        ).join('\n\n');

    default:
      return JSON.stringify(result, null, 2);
  }
}
