// src/pages/Settings.tsx
import { useState } from 'react';
import { useCurrentUser, useUpdateProfile, useSignOut } from '@/hooks';
import { usePreferencesStore, Theme, DateFormat, TimeFormat } from '@/stores/preferencesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  CheckCircle2
} from 'lucide-react';

export default function Settings() {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const signOut = useSignOut();
  const { preferences, updatePreference, resetPreferences } = usePreferencesStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saved, setSaved] = useState(false);

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
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
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

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive updates
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
                <p className="text-sm text-muted-foreground capitalize">
                  {user?.role || 'Viewer'}
                </p>
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
