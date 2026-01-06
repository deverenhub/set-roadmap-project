// src/components/layout/MainLayout.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  GitBranch,
  Zap,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
  LogOut,
  Target,
  Cpu,
  Heart,
  Package,
  Factory,
  CalendarDays,
  Map,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { useSignOut, useCurrentUser } from '@/hooks';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Capabilities', href: '/capabilities', icon: Layers },
  { name: 'Maturity Definitions', href: '/maturity-definitions', icon: Target },
  {
    name: 'Roadmaps',
    href: '/roadmap',
    icon: Map,
    children: [
      { name: 'Inventory', href: '/roadmap/inventory', icon: Package },
      { name: 'Production', href: '/roadmap/production', icon: Factory },
      { name: 'Planning', href: '/roadmap/planning', icon: CalendarDays },
    ],
  },
  { name: 'Technology Options', href: '/technology-options', icon: Cpu },
  { name: 'QoL Impact', href: '/qol-impact', icon: Heart },
  { name: 'Timeline', href: '/timeline', icon: Calendar },
  { name: 'Dependencies', href: '/dependencies', icon: GitBranch },
  { name: 'Quick Wins', href: '/quick-wins', icon: Zap },
];

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { isOpen: isChatOpen, toggleChat, closeChat } = useChatStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: user } = useCurrentUser();
  const signOut = useSignOut();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(
    location.pathname.startsWith('/roadmap') ? 'Roadmaps' : null
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-set-teal-800 bg-set-dark px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-set-teal-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-set-teal-400" />
            <span className="font-semibold text-white">SET VPC Roadmap</span>
          </div>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="text-set-teal-400 hover:text-white hover:bg-set-teal-900"
              onClick={toggleChat}
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 transform bg-set-dark border-r border-set-teal-800 transition-transform lg:hidden',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 items-center gap-2 px-4 border-b border-set-teal-800">
            <Sparkles className="h-6 w-6 text-set-teal-400" />
            <span className="font-semibold text-white">SET VPC Roadmap</span>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/' && location.pathname.startsWith(item.href));

              if (item.children) {
                const isExpanded = expandedMenu === item.name;
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setExpandedMenu(isExpanded ? null : item.name)}
                      className={cn(
                        'flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-set-teal-800 text-set-teal-400'
                          : 'text-gray-400 hover:bg-set-teal-900 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown
                        className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isChildActive
                                  ? 'bg-set-teal-500 text-white'
                                  : 'text-gray-400 hover:bg-set-teal-900 hover:text-white'
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-set-teal-500 text-white'
                      : 'text-gray-400 hover:bg-set-teal-900 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Desktop sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 hidden border-r border-set-teal-800 bg-set-dark transition-all lg:flex lg:flex-col',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          {/* Logo */}
          <div className={cn(
            'flex h-16 items-center border-b border-set-teal-800 px-4',
            sidebarCollapsed ? 'justify-center' : 'gap-2'
          )}>
            <Sparkles className="h-6 w-6 text-set-teal-400 shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-semibold truncate text-white">SET VPC Roadmap</span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/' && location.pathname.startsWith(item.href));

              // Handle submenu items
              if (item.children) {
                const isExpanded = expandedMenu === item.name;

                if (sidebarCollapsed) {
                  // Show tooltip with submenu when collapsed
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            'flex items-center justify-center w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-set-teal-800 text-set-teal-400'
                              : 'text-gray-400 hover:bg-set-teal-900 hover:text-white'
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="p-0">
                        <div className="p-2 space-y-1">
                          <p className="px-2 py-1 font-medium text-sm">{item.name}</p>
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={cn(
                                'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                                location.pathname === child.href
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted'
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setExpandedMenu(isExpanded ? null : item.name)}
                      className={cn(
                        'flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-set-teal-800 text-set-teal-400'
                          : 'text-gray-400 hover:bg-set-teal-900 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </div>
                      <ChevronDown
                        className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isChildActive
                                  ? 'bg-set-teal-500 text-white'
                                  : 'text-gray-400 hover:bg-set-teal-900 hover:text-white'
                              )}
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const link = (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    sidebarCollapsed ? 'justify-center' : 'gap-3',
                    isActive
                      ? 'bg-set-teal-500 text-white'
                      : 'text-gray-400 hover:bg-set-teal-900 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && item.name}
                </Link>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  </Tooltip>
                );
              }

              return link;
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-set-teal-800 p-2 space-y-1">
            {/* AI Chat button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isChatOpen ? 'default' : 'ghost'}
                  className={cn(
                    'w-full',
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3',
                    isChatOpen
                      ? 'bg-set-teal-500 text-white hover:bg-set-teal-600'
                      : 'text-gray-400 hover:bg-set-teal-900 hover:text-white'
                  )}
                  onClick={toggleChat}
                >
                  <Sparkles className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && 'AI Assistant'}
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">AI Assistant</TooltipContent>
              )}
            </Tooltip>

            {/* Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    sidebarCollapsed ? 'justify-center' : 'gap-3',
                    location.pathname === '/settings'
                      ? 'bg-set-teal-800 text-set-teal-400'
                      : 'text-gray-400 hover:bg-set-teal-900 hover:text-white'
                  )}
                >
                  <Settings className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && 'Settings'}
                </Link>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">Settings</TooltipContent>
              )}
            </Tooltip>

            {/* User info & sign out */}
            {!sidebarCollapsed && user && (
              <div className="px-3 py-2 text-xs text-gray-500 truncate">
                {user.email}
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full text-gray-400 hover:bg-set-teal-900 hover:text-white',
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                  )}
                  onClick={() => signOut.mutate()}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && 'Sign Out'}
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">Sign Out</TooltipContent>
              )}
            </Tooltip>

            {/* Collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full text-gray-400 hover:bg-set-teal-900 hover:text-white',
                sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
              )}
              onClick={toggleSidebar}
            >
              <ChevronLeft
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform',
                  sidebarCollapsed && 'rotate-180'
                )}
              />
              {!sidebarCollapsed && 'Collapse'}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={cn(
            'min-h-screen transition-all',
            sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
          )}
        >
          <div className="p-4 lg:p-8">{children}</div>
        </main>

        {/* Chat panel */}
        <ChatPanel isOpen={isChatOpen} onClose={closeChat} />
      </div>
    </TooltipProvider>
  );
}
