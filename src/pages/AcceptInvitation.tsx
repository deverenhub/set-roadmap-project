// src/pages/AcceptInvitation.tsx
// Page for users to accept their invitation and create an account

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInvitationByToken, useAcceptInvitation, getInvitationStatus } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SETLogo } from '@/components/ui/SETLogo';
import { FullPageLoader } from '@/components/shared/LoadingSpinner';
import {
  Mail,
  Shield,
  User,
  Lock,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

const roleDescriptions: Record<string, string> = {
  admin: 'Full access to manage users, capabilities, milestones, and all settings',
  editor: 'Create and edit capabilities, milestones, quick wins, and add comments',
  viewer: 'View roadmap data, dashboards, and reports',
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-5 w-5 text-red-500" />,
  editor: <User className="h-5 w-5 text-blue-500" />,
  viewer: <User className="h-5 w-5 text-gray-500" />,
};

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: invitation, isLoading, error } = useInvitationByToken(token);
  const acceptInvitation = useAcceptInvitation();

  // Validate passwords match
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else if (password && password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordError(null);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !invitation || passwordError) return;

    try {
      await acceptInvitation.mutateAsync({
        token,
        password,
        fullName,
      });
      setSuccess(true);
    } catch {
      // Error is handled by the mutation
    }
  };

  // Loading state
  if (isLoading) {
    return <FullPageLoader text="Loading invitation..." />;
  }

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-set-dark to-set-teal-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <SETLogo size="lg" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Invalid Link
            </CardTitle>
            <CardDescription>
              This invitation link is invalid. Please check that you have the correct URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/login')} variant="outline">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error loading invitation
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-set-dark to-set-teal-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <SETLogo size="lg" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Error
            </CardTitle>
            <CardDescription>
              There was an error loading your invitation. Please try again or contact your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invitation not found
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-set-dark to-set-teal-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <SETLogo size="lg" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              Invitation Not Found
            </CardTitle>
            <CardDescription>
              This invitation link is invalid or has been revoked. Please contact your administrator for a new invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/login')} variant="outline">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check invitation status
  const status = getInvitationStatus(invitation);

  // Already accepted
  if (status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-set-dark to-set-teal-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <SETLogo size="lg" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Check className="h-6 w-6 text-green-500" />
              Already Accepted
            </CardTitle>
            <CardDescription>
              This invitation has already been accepted. You can sign in with your existing account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/login')}>
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired
  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-set-dark to-set-teal-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <SETLogo size="lg" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Clock className="h-6 w-6 text-amber-500" />
              Invitation Expired
            </CardTitle>
            <CardDescription>
              This invitation has expired. Please contact your administrator to request a new invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/login')} variant="outline">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-set-dark to-set-teal-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Account Created!</CardTitle>
            <CardDescription>
              Your account has been created successfully. Please check your email to verify your account, then you can sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/login')}>
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show acceptance form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-set-dark to-set-teal-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SETLogo size="lg" />
          </div>
          <CardTitle className="text-2xl">Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join the SET VPC Roadmap platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Invitation details */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{invitation.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {roleIcons[invitation.role]}
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {invitation.role}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {roleDescriptions[invitation.role]}
            </p>
          </div>

          {/* Account creation form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  className="pl-9"
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`pl-9 ${passwordError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!!passwordError || !password || !confirmPassword || !fullName}
              isLoading={acceptInvitation.isPending}
            >
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
