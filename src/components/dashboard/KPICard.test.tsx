// src/components/dashboard/KPICard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Activity } from 'lucide-react';
import { KPICard } from './KPICard';

describe('KPICard', () => {
  describe('basic rendering', () => {
    it('renders title correctly', () => {
      render(<KPICard title="Total Users" value={100} />);
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    it('renders numeric value correctly', () => {
      render(<KPICard title="Count" value={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders string value correctly', () => {
      render(<KPICard title="Status" value="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('has data-testid attribute', () => {
      render(<KPICard title="Test" value={0} />);
      expect(screen.getByTestId('kpi-card')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<KPICard title="Test" value={0} className="custom-class" />);
      const card = screen.getByTestId('kpi-card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('subtitle', () => {
    it('does not render subtitle when not provided', () => {
      render(<KPICard title="Test" value={100} />);
      const paragraphs = document.querySelectorAll('p.text-xs');
      expect(paragraphs).toHaveLength(0);
    });

    it('renders subtitle when provided', () => {
      render(<KPICard title="Test" value={100} subtitle="vs last month" />);
      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });

    it('subtitle has correct styling', () => {
      render(<KPICard title="Test" value={100} subtitle="Description" />);
      const subtitle = screen.getByText('Description');
      expect(subtitle).toHaveClass('text-xs', 'text-muted-foreground');
    });
  });

  describe('icon', () => {
    it('does not render icon when not provided', () => {
      const { container } = render(<KPICard title="Test" value={100} />);
      // CardHeader should only have title, no icon
      const svgs = container.querySelectorAll('svg');
      expect(svgs).toHaveLength(0);
    });

    it('renders icon when provided', () => {
      render(<KPICard title="Test" value={100} icon={Activity} />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('icon has correct size classes', () => {
      render(<KPICard title="Test" value={100} icon={Activity} />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });
  });

  describe('trend', () => {
    it('does not render trend when not provided', () => {
      render(<KPICard title="Test" value={100} />);
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });

    it('renders trend value correctly', () => {
      render(<KPICard title="Test" value={100} trend={{ value: 12, direction: 'up' }} />);
      expect(screen.getByText('12%')).toBeInTheDocument();
    });

    it('applies green color for upward trend', () => {
      render(<KPICard title="Test" value={100} trend={{ value: 5, direction: 'up' }} />);
      // The trend element contains the percentage text directly
      const trendElement = screen.getByText('5%').closest('.flex.items-center.text-xs');
      expect(trendElement).toHaveClass('text-green-600');
    });

    it('applies red color for downward trend', () => {
      render(<KPICard title="Test" value={100} trend={{ value: 3, direction: 'down' }} />);
      const trendElement = screen.getByText('3%').closest('.flex.items-center.text-xs');
      expect(trendElement).toHaveClass('text-red-600');
    });

    it('applies slate color for neutral trend', () => {
      render(<KPICard title="Test" value={100} trend={{ value: 0, direction: 'neutral' }} />);
      const trendElement = screen.getByText('0%').closest('.flex.items-center.text-xs');
      expect(trendElement).toHaveClass('text-slate-500');
    });

    it('shows up arrow for upward trend', () => {
      render(<KPICard title="Test" value={100} trend={{ value: 10, direction: 'up' }} />);
      const trendContainer = screen.getByText('10%').parentElement;
      const svg = trendContainer?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('shows down arrow for downward trend', () => {
      render(<KPICard title="Test" value={100} trend={{ value: 10, direction: 'down' }} />);
      const trendContainer = screen.getByText('10%').parentElement;
      const svg = trendContainer?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('does not show arrow for neutral trend', () => {
      render(<KPICard title="Test" value={100} trend={{ value: 0, direction: 'neutral' }} />);
      const trendContainer = screen.getByText('0%').parentElement;
      const svg = trendContainer?.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });
  });

  describe('onClick', () => {
    it('does not have cursor pointer when onClick not provided', () => {
      render(<KPICard title="Test" value={100} />);
      const card = screen.getByTestId('kpi-card');
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('has cursor pointer when onClick provided', () => {
      render(<KPICard title="Test" value={100} onClick={() => {}} />);
      const card = screen.getByTestId('kpi-card');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<KPICard title="Test" value={100} onClick={onClick} />);

      fireEvent.click(screen.getByTestId('kpi-card'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('applies hover styles when clickable', () => {
      render(<KPICard title="Test" value={100} onClick={() => {}} />);
      const card = screen.getByTestId('kpi-card');
      expect(card).toHaveClass('transition-all', 'hover:shadow-md');
    });
  });

  describe('loading state', () => {
    it('renders skeletons when isLoading is true', () => {
      render(<KPICard title="Test" value={100} isLoading />);
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('does not render title when loading', () => {
      render(<KPICard title="Test Title" value={100} isLoading />);
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('does not render value when loading', () => {
      render(<KPICard title="Test" value={999} isLoading />);
      expect(screen.queryByText('999')).not.toBeInTheDocument();
    });

    it('still has data-testid when loading', () => {
      render(<KPICard title="Test" value={100} isLoading />);
      expect(screen.getByTestId('kpi-card')).toBeInTheDocument();
    });
  });

  describe('value styling', () => {
    it('value has correct styling', () => {
      render(<KPICard title="Test" value="$1,234" />);
      const value = screen.getByText('$1,234');
      expect(value).toHaveClass('text-2xl', 'font-bold');
    });
  });

  describe('title styling', () => {
    it('title has correct styling', () => {
      render(<KPICard title="Metric Name" value={100} />);
      const title = screen.getByText('Metric Name');
      expect(title).toHaveClass('text-sm', 'font-medium', 'text-muted-foreground');
    });
  });

  describe('complete KPI card', () => {
    it('renders all elements together', () => {
      const onClick = vi.fn();
      render(
        <KPICard
          title="Total Revenue"
          value="$50,000"
          subtitle="vs. $45,000 last month"
          icon={Activity}
          trend={{ value: 11, direction: 'up' }}
          onClick={onClick}
        />
      );

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      expect(screen.getByText('vs. $45,000 last month')).toBeInTheDocument();
      expect(screen.getByText('11%')).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });
});
