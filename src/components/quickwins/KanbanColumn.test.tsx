// src/components/quickwins/KanbanColumn.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanColumn } from './KanbanColumn';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const mockItems = [
  { id: 'qw-1', name: 'Quick Win 1', status: 'not_started' },
  { id: 'qw-2', name: 'Quick Win 2', status: 'not_started' },
];

describe('KanbanColumn', () => {
  describe('rendering', () => {
    it('renders column title', () => {
      render(
        <KanbanColumn
          id="not_started"
          title="Not Started"
          color="bg-slate-100"
          items={mockItems}
        />
      );
      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });

    it('renders item count badge', () => {
      render(
        <KanbanColumn
          id="not_started"
          title="Not Started"
          color="bg-slate-100"
          items={mockItems}
        />
      );
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders all items', () => {
      render(
        <KanbanColumn
          id="not_started"
          title="Not Started"
          color="bg-slate-100"
          items={mockItems}
        />
      );
      expect(screen.getByText('Quick Win 1')).toBeInTheDocument();
      expect(screen.getByText('Quick Win 2')).toBeInTheDocument();
    });

    it('applies color class', () => {
      const { container } = render(
        <KanbanColumn
          id="not_started"
          title="Not Started"
          color="bg-blue-100"
          items={mockItems}
        />
      );
      expect(container.querySelector('.bg-blue-100')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows "Drop items here" when empty and not readOnly', () => {
      render(
        <KanbanColumn
          id="not_started"
          title="Not Started"
          color="bg-slate-100"
          items={[]}
        />
      );
      expect(screen.getByText('Drop items here')).toBeInTheDocument();
    });

    it('shows "No items" when empty and readOnly', () => {
      render(
        <KanbanColumn
          id="not_started"
          title="Not Started"
          color="bg-slate-100"
          items={[]}
          readOnly
        />
      );
      expect(screen.getByText('No items')).toBeInTheDocument();
    });

    it('shows count of 0 when empty', () => {
      render(
        <KanbanColumn
          id="not_started"
          title="Not Started"
          color="bg-slate-100"
          items={[]}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onItemClick when item is clicked', () => {
      const onItemClick = vi.fn();
      render(
        <KanbanColumn
          id="not_started"
          title="Not Started"
          color="bg-slate-100"
          items={mockItems}
          onItemClick={onItemClick}
        />
      );
      fireEvent.click(screen.getByText('Quick Win 1'));
      expect(onItemClick).toHaveBeenCalledWith('qw-1');
    });
  });

  describe('readOnly mode', () => {
    it('passes readOnly to QuickWinCard', () => {
      const { container } = render(
        <KanbanColumn
          id="not_started"
          title="Not Started"
          color="bg-slate-100"
          items={mockItems}
          readOnly
        />
      );
      // In readOnly mode, there should be no drag handles (buttons)
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });
  });
});
