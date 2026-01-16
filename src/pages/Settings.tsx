// src/pages/Settings.tsx
import { useState } from 'react';
import {
  useCurrentUser,
  useUpdateProfile,
  useSignOut,
  usePermissions,
  useAllUsers,
  useUpdateUserRole,
  usePendingInvitations,
  useSendInvitation,
  useResendInvitation,
  useRevokeInvitation,
  getInvitationStatus,
  getTimeUntilExpiration,
} from '@/hooks';
import { usePreferencesStore, Theme, DateFormat, TimeFormat } from '@/stores/preferencesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Calendar,
  Clock,
  LayoutDashboard,
  FileDown,
  RotateCcw,
  Save,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  Eye,
  EyeOff,
  Users,
  UserPlus,
  Mail,
  Shield,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import type { UserRole } from '@/types';

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-700',
};

export default function Settings() {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const signOut = useSignOut();
  const { preferences, updatePreference, resetPreferences } = usePreferencesStore();
  const { isAdmin } = usePermissions();

  // Admin hooks
  const { data: allUsers, isLoading: usersLoading } = useAllUsers();
  const { data: pendingInvitations, isLoading: invitationsLoading } = usePendingInvitations();
  const updateUserRole = useUpdateUserRole();
  const sendInvitation = useSendInvitation();
  const resendInvitation = useResendInvitation();
  const revokeInvitation = useRevokeInvitation();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saved, setSaved] = useState(false);
  const [showWebhookUrl, setShowWebhookUrl] = useState(false);

  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({ full_name: fullName });
    showSavedIndicator();
  };

  const showSavedIndicator = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreferenceChange = <K extends keyof typeof preferences>(key: K, value: typeof preferences[K]) => {
    updatePreference(key, value);
    showSavedIndicator();
  };

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    await sendInvitation.mutateAsync({
      email: inviteEmail,
      role: inviteRole,
      message: inviteMessage || undefined,
    });

    // Reset form
    setInviteEmail('');
    setInviteRole('viewer');
    setInviteMessage('');
  };

  const copyInvitationLink = async (token: string) => {
    const link = `${window.location.origin}/accept-invitation?token=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} lg:w-[${isAdmin ? '500px' : '400px'}]`}>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              Admin
            </TabsTrigger>
          )}
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <Button type="submit" isLoading={updateProfile.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  {themeOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={preferences.theme === option.value ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => handlePreferenceChange('theme', option.value)}
                    >
                      {option.icon}
                      <span className="ml-2">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use smaller spacing and fonts throughout the app
                  </p>
                </div>
                <Switch
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => handlePreferenceChange('compactMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date & Time
              </CardTitle>
              <CardDescription>
                Configure date and time display formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value: DateFormat) => handlePreferenceChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <Select
                    value={preferences.timeFormat}
                    onValueChange={(value: TimeFormat) => handlePreferenceChange('timeFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => handlePreferenceChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </CardTitle>
              <CardDescription>
                Customize your dashboard experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default View</Label>
                <Select
                  value={preferences.defaultDashboardView}
                  onValueChange={(value: 'overview' | 'capabilities' | 'timeline') =>
                    handlePreferenceChange('defaultDashboardView', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="capabilities">Capabilities</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Quick Wins</Label>
                    <p className="text-sm text-muted-foreground">
                      Display quick wins section on dashboard
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showQuickWinsOnDashboard}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('showQuickWinsOnDashboard', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Recent Activity</Label>
                    <p className="text-sm text-muted-foreground">
                      Display activity feed on dashboard
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showRecentActivityOnDashboard}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('showRecentActivityOnDashboard', checked)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Auto-refresh Interval</Label>
                <Select
                  value={String(preferences.dashboardRefreshInterval)}
                  onValueChange={(value) =>
                    handlePreferenceChange('dashboardRefreshInterval', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Manual refresh only</SelectItem>
                    <SelectItem value="30">Every 30 seconds</SelectItem>
                    <SelectItem value="60">Every minute</SelectItem>
                    <SelectItem value="300">Every 5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications - Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure email notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('emailNotifications', checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4 pl-4">
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Milestone completions</Label>
                  <Switch
                    checked={preferences.notifyOnMilestoneComplete}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('notifyOnMilestoneComplete', checked)
                    }
                    disabled={!preferences.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Blocked items</Label>
                  <Switch
                    checked={preferences.notifyOnBlockedItems}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('notifyOnBlockedItems', checked)
                    }
                    disabled={!preferences.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Critical changes</Label>
                  <Switch
                    checked={preferences.notifyOnCriticalChanges}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('notifyOnCriticalChanges', checked)
                    }
                    disabled={!preferences.emailNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications - Microsoft Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Microsoft Teams Notifications
              </CardTitle>
              <CardDescription>
                Send notifications to a Microsoft Teams channel via webhook
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Teams Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send updates to Microsoft Teams
                  </p>
                </div>
                <Switch
                  checked={preferences.teamsNotifications}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('teamsNotifications', checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamsWebhookUrl">Webhook URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="teamsWebhookUrl"
                      type={showWebhookUrl ? 'text' : 'password'}
                      value={preferences.teamsWebhookUrl}
                      onChange={(e) =>
                        handlePreferenceChange('teamsWebhookUrl', e.target.value)
                      }
                      placeholder="https://outlook.office.com/webhook/..."
                      disabled={!preferences.teamsNotifications}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowWebhookUrl(!showWebhookUrl)}
                    disabled={!preferences.teamsNotifications}
                  >
                    {showWebhookUrl ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  <a
                    href="https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Learn how to create a Teams webhook
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>

              <Separator />

              <div className="space-y-4 pl-4">
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Milestone completions</Label>
                  <Switch
                    checked={preferences.teamsNotifyOnMilestoneComplete}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('teamsNotifyOnMilestoneComplete', checked)
                    }
                    disabled={!preferences.teamsNotifications || !preferences.teamsWebhookUrl}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Blocked items</Label>
                  <Switch
                    checked={preferences.teamsNotifyOnBlockedItems}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('teamsNotifyOnBlockedItems', checked)
                    }
                    disabled={!preferences.teamsNotifications || !preferences.teamsWebhookUrl}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Activity changes</Label>
                  <Switch
                    checked={preferences.teamsNotifyOnActivityChanges}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('teamsNotifyOnActivityChanges', checked)
                    }
                    disabled={!preferences.teamsNotifications || !preferences.teamsWebhookUrl}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                Data & Export
              </CardTitle>
              <CardDescription>
                Configure data export preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Export Format</Label>
                <Select
                  value={preferences.defaultExportFormat}
                  onValueChange={(value: 'pdf' | 'csv' | 'xlsx') =>
                    handlePreferenceChange('defaultExportFormat', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Charts in Export</Label>
                  <p className="text-sm text-muted-foreground">
                    Add visualization charts to exported reports
                  </p>
                </div>
                <Switch
                  checked={preferences.includeChartInExport}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange('includeChartInExport', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Reset */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <RotateCcw className="h-5 w-5" />
                Reset Preferences
              </CardTitle>
              <CardDescription>
                Reset all preferences to their default values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => {
                  resetPreferences();
                  showSavedIndicator();
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            {/* Invite Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Invite Users
                </CardTitle>
                <CardDescription>
                  Send email invitations to new team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@setvpc.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inviteRole">Role</Label>
                      <Select
                        value={inviteRole}
                        onValueChange={(value: UserRole) => setInviteRole(value)}
                      >
                        <SelectTrigger id="inviteRole">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                          <SelectItem value="editor">Editor - Can edit content</SelectItem>
                          <SelectItem value="admin">Admin - Full access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteMessage">Personal Message (optional)</Label>
                    <Textarea
                      id="inviteMessage"
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder="Add a personal note to include in the invitation email..."
                      rows={2}
                    />
                  </div>
                  <Button type="submit" disabled={sendInvitation.isPending || !inviteEmail}>
                    {sendInvitation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Send Invitation
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Pending Invitations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Pending Invitations
                </CardTitle>
                <CardDescription>
                  Manage outstanding invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !pendingInvitations || pendingInvitations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No pending invitations
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{invitation.email}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className={roleColors[invitation.role as UserRole]}>
                                {invitation.role}
                              </Badge>
                              <span>•</span>
                              <span>{getTimeUntilExpiration(invitation.expires_at)}</span>
                              {invitation.inviter && (
                                <>
                                  <span>•</span>
                                  <span>by {invitation.inviter.full_name || invitation.inviter.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyInvitationLink(invitation.token)}
                            title="Copy invitation link"
                          >
                            {copiedToken === invitation.token ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => resendInvitation.mutate(invitation.id)}
                            disabled={resendInvitation.isPending}
                            title="Resend invitation"
                          >
                            <RefreshCw className={`h-4 w-4 ${resendInvitation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                title="Revoke invitation"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke the invitation for {invitation.email}?
                                  They will no longer be able to use this invitation link.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => revokeInvitation.mutate(invitation.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Revoke
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage existing user roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !allUsers || allUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No users found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {allUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-set-teal-400 to-set-teal-600 flex items-center justify-center text-white font-medium">
                            {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{u.full_name || 'No name'}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {u.id === user?.id ? (
                            <Badge variant="secondary" className={roleColors[u.role as UserRole]}>
                              {u.role} (you)
                            </Badge>
                          ) : (
                            <Select
                              value={u.role || 'viewer'}
                              onValueChange={(value: UserRole) =>
                                updateUserRole.mutate({ userId: u.id, role: value })
                              }
                              disabled={updateUserRole.isPending}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Role</h4>
                <Badge variant="secondary" className={roleColors[(user?.role as UserRole) || 'viewer']}>
                  {user?.role || 'Viewer'}
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => signOut.mutate()}
                  isLoading={signOut.isPending}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
