// src/hooks/index.ts
// Export all hooks

// Capabilities
export {
  useCapabilities,
  useCapability,
  useCreateCapability,
  useUpdateCapability,
  useDeleteCapability,
  capabilityKeys,
} from './useCapabilities';

// Milestones
export {
  useMilestones,
  useMilestone,
  useMilestonesByCapability,
  useTimelineData,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  milestoneKeys,
} from './useMilestones';

// Quick Wins
export {
  useQuickWins,
  useQuickWin,
  useQuickWinsGrouped,
  useQuickWinStats,
  useCreateQuickWin,
  useUpdateQuickWin,
  useDeleteQuickWin,
  useMoveQuickWin,
  quickWinKeys,
} from './useQuickWins';

// User & Auth
export {
  useSession,
  useCurrentUser,
  useSignIn,
  useSignUp,
  useSignOut,
  useResetPassword,
  useUpdateProfile,
  usePermissions,
  useAllUsers,
  useUpdateUserRole,
  userKeys,
} from './useUser';

// Realtime
export {
  useRealtime,
  useRealtimeTable,
  useRealtimeActivity,
  useRealtimeRecord,
  useRealtimeSync,
} from './useRealtime';

// AI Chat
export {
  useAIChat,
  suggestedQueries,
  formatToolResponse,
} from './useAIChat';
export type { ChatMessage } from './useAIChat';

// Voice Input
export {
  useVoiceInput,
  isSpeechRecognitionSupported,
} from './useVoiceInput';
export type { VoiceInputState } from './useVoiceInput';
