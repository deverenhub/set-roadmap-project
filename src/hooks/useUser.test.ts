// src/hooks/useUser.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  userKeys,
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
} from './useUser';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Supabase
const mockGetSession = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      signInWithPassword: (data: any) => mockSignInWithPassword(data),
      signUp: (data: any) => mockSignUp(data),
      signOut: () => mockSignOut(),
      resetPasswordForEmail: (email: string, options: any) => mockResetPasswordForEmail(email, options),
    },
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
    })),
  },
}));

// Create a wrapper for react-query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default chain
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
      eq: mockEq,
      select: mockSelect,
    });
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
  });

  describe('userKeys', () => {
    it('creates base key', () => {
      expect(userKeys.all).toEqual(['users']);
    });

    it('creates session key', () => {
      expect(userKeys.session()).toEqual(['users', 'session']);
    });

    it('creates current key', () => {
      expect(userKeys.current()).toEqual(['users', 'current']);
    });

    it('creates list key', () => {
      expect(userKeys.list()).toEqual(['users', 'list']);
    });

    it('creates detail key with id', () => {
      expect(userKeys.detail('user-123')).toEqual(['users', 'detail', 'user-123']);
    });
  });

  describe('useSession hook', () => {
    it('returns session when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };
      mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });

      const { result } = renderHook(() => useSession(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSession);
    });

    it('returns null when not authenticated', async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });

      const { result } = renderHook(() => useSession(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('handles error', async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: new Error('Auth error') });

      const { result } = renderHook(() => useSession(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useCurrentUser hook', () => {
    it('returns null when no session', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.fetchStatus).toBe('idle');
      });
    });

    it('fetches user profile when session exists', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };
      const mockUser = { id: 'user-123', email: 'test@example.com', full_name: 'Test User' };

      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      mockSingle.mockResolvedValueOnce({ data: mockUser, error: null });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
    });
  });

  describe('useSignIn mutation', () => {
    it('signs in user', async () => {
      const mockData = {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token-123' },
      };
      mockSignInWithPassword.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useSignIn(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ email: 'test@example.com', password: 'password123' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('handles sign in error', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ data: null, error: new Error('Invalid credentials') });

      const { result } = renderHook(() => useSignIn(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ email: 'test@example.com', password: 'wrong' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useSignUp mutation', () => {
    it('signs up user', async () => {
      const mockData = {
        user: { id: 'new-user', email: 'new@example.com' },
        session: null,
      };
      mockSignUp.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useSignUp(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({
          email: 'new@example.com',
          password: 'password123',
          fullName: 'New User',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: { full_name: 'New User' },
        },
      });
    });

    it('handles sign up error', async () => {
      mockSignUp.mockResolvedValueOnce({ data: null, error: new Error('Email already exists') });

      const { result } = renderHook(() => useSignUp(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ email: 'test@example.com', password: 'password123' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useSignOut mutation', () => {
    it('signs out user', async () => {
      mockSignOut.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useSignOut(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('handles sign out error', async () => {
      mockSignOut.mockResolvedValueOnce({ error: new Error('Sign out failed') });

      const { result } = renderHook(() => useSignOut(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useResetPassword mutation', () => {
    it('sends reset password email', async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('test@example.com');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password'),
        })
      );
    });

    it('handles reset password error', async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({ error: new Error('User not found') });

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('notfound@example.com');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateProfile mutation', () => {
    it('throws error when not authenticated', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ full_name: 'Updated Name' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('provides mutate function', () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.mutate).toBe('function');
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('usePermissions hook', () => {
    it('returns default permissions when no user', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.role).toBeUndefined();
        expect(result.current.canEdit).toBe(false);
        expect(result.current.canDelete).toBe(false);
        expect(result.current.canManageUsers).toBe(false);
      });
    });

    it('returns permission functions', () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.canEdit).toBe('boolean');
      expect(typeof result.current.canDelete).toBe('boolean');
      expect(typeof result.current.canManageUsers).toBe('boolean');
      expect(typeof result.current.isAdmin).toBe('boolean');
      expect(typeof result.current.isEditor).toBe('boolean');
      expect(typeof result.current.isViewer).toBe('boolean');
    });
  });

  describe('useAllUsers hook', () => {
    it('is disabled when user cannot manage users', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => useAllUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.fetchStatus).toBe('idle');
      });
    });

    it('returns the query object', () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => useAllUsers(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isError');
    });
  });

  describe('useUpdateUserRole mutation', () => {
    it('updates user role', async () => {
      const mockUpdated = { id: 'user-123', role: 'editor' };
      mockEq.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockUpdated, error: null }),
        }),
      });

      const { result } = renderHook(() => useUpdateUserRole(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ userId: 'user-123', role: 'editor' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('handles update role error', async () => {
      mockEq.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: null, error: new Error('Update failed') }),
        }),
      });

      const { result } = renderHook(() => useUpdateUserRole(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ userId: 'user-123', role: 'viewer' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
