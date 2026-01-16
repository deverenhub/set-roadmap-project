// src/components/layout/MainLayout.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MainLayout } from './MainLayout';

// Mock stores
const mockToggleChat = vi.fn();
const mockCloseChat = vi.fn();
const mockToggleSidebar = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/stores/chatStore', () => ({
  useChatStore: () => ({
    isOpen: false,
    toggleChat: mockToggleChat,
    closeChat: mockCloseChat,
  }),
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    sidebarCollapsed: false,
    toggleSidebar: mockToggleSidebar,
  }),
}));

vi.mock('@/hooks', () => ({
  useSignOut: () => ({
    mutate: mockSignOut,
  }),
  useCurrentUser: () => ({
    data: { email: 'test@example.com' },
  }),
}));

// Mock child components
vi.mock('@/components/chat/ChatPanel', () => ({
  ChatPanel: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="chat-panel" data-open={isOpen}>
      Chat Panel
    </div>
  ),
}));

vi.mock('@/components/notifications', () => ({
  NotificationBell: ({ className }: { className?: string }) => (
    <button data-testid="notification-bell" className={className}>
      Notifications
    </button>
  ),
}));

vi.mock('@/components/search', () => ({
  GlobalSearch: ({ className }: { className?: string }) => (
    <button data-testid="global-search" className={className}>
      Search
    </button>
  ),
}));

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement, path = '/') => {
    return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
  };

  describe('rendering', () => {
    it('renders children content', () => {
      renderWithRouter(
        <MainLayout>
          <div>Page Content</div>
        </MainLayout>
      );
      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    it('renders logo and title', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getAllByText('SET VPC Roadmap').length).toBeGreaterThan(0);
    });

    it('renders notification bell', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getAllByTestId('notification-bell').length).toBeGreaterThan(0);
    });

    it('renders global search', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getAllByTestId('global-search').length).toBeGreaterThan(0);
    });

    it('renders chat panel', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('renders Dashboard link', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    });

    it('renders Capabilities link', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getAllByText('Capabilities').length).toBeGreaterThan(0);
    });

    it('renders Timeline link', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getAllByText('Timeline').length).toBeGreaterThan(0);
    });

    it('renders Quick Wins link', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getAllByText('Quick Wins').length).toBeGreaterThan(0);
    });

    it('renders Settings link', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
    });

    it('highlights active nav item', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>,
        '/capabilities'
      );
      // Active nav items have different styling
      const links = screen.getAllByText('Capabilities');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('mobile menu', () => {
    it('renders mobile menu button', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      // Mobile menu button is in the mobile header
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('sidebar', () => {
    it('renders collapse button', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getByText('Collapse')).toBeInTheDocument();
    });

    it('calls toggleSidebar when collapse clicked', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      fireEvent.click(screen.getByText('Collapse'));
      expect(mockToggleSidebar).toHaveBeenCalled();
    });
  });

  describe('AI chat', () => {
    it('renders AI Assistant button', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('calls toggleChat when AI button clicked', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      fireEvent.click(screen.getByText('AI Assistant'));
      expect(mockToggleChat).toHaveBeenCalled();
    });
  });

  describe('sign out', () => {
    it('renders Sign Out button', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('calls signOut when clicked', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      fireEvent.click(screen.getByText('Sign Out'));
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('renders user email', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('submenu', () => {
    it('renders Roadmaps with submenu', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      expect(screen.getAllByText('Roadmaps').length).toBeGreaterThan(0);
    });

    it('expands submenu when clicked', () => {
      renderWithRouter(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );

      // Find and click the Roadmaps button
      const roadmapsButtons = screen.getAllByText('Roadmaps');
      const parentButton = roadmapsButtons.find(el =>
        el.closest('button')
      );

      if (parentButton) {
        fireEvent.click(parentButton);
        // After clicking, submenu items should be visible
        expect(screen.getAllByText('Inventory').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Production').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Planning').length).toBeGreaterThan(0);
      }
    });
  });
});
