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
  useUpdateMilestonePosition,
  useUpdateMilestoneDuration,
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

// Global Search
export { useGlobalSearch } from './useGlobalSearch';
export type { SearchResult } from './useGlobalSearch';

// Activity Log
export {
  useActivityLog,
  useInfiniteActivityLog,
  useRecordActivity,
  useUserActivity,
  useActivityStats,
  useInvalidateActivityLog,
  formatActivityDescription,
  formatTableName,
  getChangedFields,
  activityLogKeys,
} from './useActivityLog';
export type { ActivityLogFilters, ActivityStats } from './useActivityLog';

// Teams Notifications
export {
  useTeamsNotification,
  sendTeamsNotification,
  notifyTeamsBlockedMilestone,
  notifyTeamsMilestoneCompleted,
  notifyTeamsActivity,
} from './useTeamsNotifications';
export type { TeamsNotificationType, TeamsNotificationData } from './useTeamsNotifications';

// File Attachments
export {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  useAttachmentUrl,
  useAttachmentCount,
  getAttachmentUrl,
  formatFileSize,
  getFileIcon,
  isImageType,
  attachmentKeys,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from './useAttachments';

// User Invitations
export {
  useInvitations,
  usePendingInvitations,
  useInvitationByToken,
  useSendInvitation,
  useResendInvitation,
  useRevokeInvitation,
  useAcceptInvitation,
  getInvitationStatus,
  getTimeUntilExpiration,
  invitationKeys,
} from './useInvitations';
