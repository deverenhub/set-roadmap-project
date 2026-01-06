// src/pages/Login.tsx
import { useState } from 'react';
import { useSignIn, useSignUp } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SETLogo } from '@/components/ui/SETLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const signIn = useSignIn();
  const signUp = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUp.mutateAsync({ email, password });
    } else {
      await signIn.mutateAsync({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-set-dark to-set-teal-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SETLogo size="lg" />
          </div>
          <CardTitle className="text-2xl">SET VPC Roadmap</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create an account to get started' : 'Sign in to access your transformation dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              isLoading={signIn.isPending || signUp.isPending}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
