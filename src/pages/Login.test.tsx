// src/pages/Login.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';

// Mock hooks
const mockSignIn = {
  mutateAsync: vi.fn(),
  isPending: false,
};
const mockSignUp = {
  mutateAsync: vi.fn(),
  isPending: false,
};

vi.mock('@/hooks', () => ({
  useSignIn: () => mockSignIn,
  useSignUp: () => mockSignUp,
}));

// Mock SETLogo component
vi.mock('@/components/ui/SETLogo', () => ({
  SETLogo: ({ size }: { size: string }) => (
    <div data-testid="set-logo" data-size={size}>Logo</div>
  ),
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.isPending = false;
    mockSignUp.isPending = false;
  });

  describe('rendering', () => {
    it('renders logo', () => {
      render(<Login />);
      expect(screen.getByTestId('set-logo')).toBeInTheDocument();
    });

    it('renders logo with large size', () => {
      render(<Login />);
      expect(screen.getByTestId('set-logo')).toHaveAttribute('data-size', 'lg');
    });

    it('renders page title', () => {
      render(<Login />);
      expect(screen.getByText('SET VPC Roadmap')).toBeInTheDocument();
    });

    it('renders sign in description by default', () => {
      render(<Login />);
      expect(screen.getByText('Sign in to access your transformation dashboard')).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<Login />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders password input', () => {
      render(<Login />);
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders sign in button by default', () => {
      render(<Login />);
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('renders toggle to sign up', () => {
      render(<Login />);
      expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument();
    });
  });

  describe('form inputs', () => {
    it('email input has correct type', () => {
      render(<Login />);
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    });

    it('password input has correct type', () => {
      render(<Login />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('email input has placeholder', () => {
      render(<Login />);
      expect(screen.getByLabelText('Email')).toHaveAttribute('placeholder', 'you@example.com');
    });

    it('password input has min length validation', () => {
      render(<Login />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('minLength', '6');
    });

    it('updates email value on change', async () => {
      render(<Login />);
      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'test@example.com');
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password value on change', async () => {
      render(<Login />);
      const passwordInput = screen.getByLabelText('Password');
      await userEvent.type(passwordInput, 'password123');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('mode toggle', () => {
    it('switches to sign up mode when toggle is clicked', async () => {
      render(<Login />);
      fireEvent.click(screen.getByText("Don't have an account? Sign up"));
      expect(screen.getByText('Create an account to get started')).toBeInTheDocument();
    });

    it('shows sign up button in sign up mode', async () => {
      render(<Login />);
      fireEvent.click(screen.getByText("Don't have an account? Sign up"));
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('shows toggle to sign in in sign up mode', async () => {
      render(<Login />);
      fireEvent.click(screen.getByText("Don't have an account? Sign up"));
      expect(screen.getByText('Already have an account? Sign in')).toBeInTheDocument();
    });

    it('switches back to sign in mode', async () => {
      render(<Login />);
      fireEvent.click(screen.getByText("Don't have an account? Sign up"));
      fireEvent.click(screen.getByText('Already have an account? Sign in'));
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls signIn when form is submitted in sign in mode', async () => {
      render(<Login />);

      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'password123');

      fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form')!);

      await waitFor(() => {
        expect(mockSignIn.mutateAsync).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('calls signUp when form is submitted in sign up mode', async () => {
      render(<Login />);

      fireEvent.click(screen.getByText("Don't have an account? Sign up"));

      await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'newpassword');

      fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }).closest('form')!);

      await waitFor(() => {
        expect(mockSignUp.mutateAsync).toHaveBeenCalledWith({
          email: 'new@example.com',
          password: 'newpassword',
        });
      });
    });

    it('does not call signUp when in sign in mode', async () => {
      render(<Login />);

      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'password123');

      fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form')!);

      await waitFor(() => {
        expect(mockSignIn.mutateAsync).toHaveBeenCalled();
      });
      expect(mockSignUp.mutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('disables button when sign in is pending', () => {
      mockSignIn.isPending = true;
      render(<Login />);

      const button = screen.getByRole('button', { name: /Sign In/i });
      expect(button).toBeDisabled();
    });

    it('disables button when sign up is pending', () => {
      mockSignUp.isPending = true;
      render(<Login />);

      fireEvent.click(screen.getByText("Don't have an account? Sign up"));

      const button = screen.getByRole('button', { name: /Sign Up/i });
      expect(button).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('form inputs are required', () => {
      render(<Login />);
      expect(screen.getByLabelText('Email')).toBeRequired();
      expect(screen.getByLabelText('Password')).toBeRequired();
    });

    it('has proper label associations', () => {
      render(<Login />);
      expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email');
      expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'password');
    });
  });
});
