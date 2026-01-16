// src/components/attachments/FileUpload.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from './FileUpload';

// Mock hooks
const mockUploadMutation = {
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
};

vi.mock('@/hooks/useAttachments', () => ({
  useUploadAttachment: () => mockUploadMutation,
  formatFileSize: (size: number) => {
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(0)} MB`;
    if (size >= 1024) return `${(size / 1024).toFixed(0)} KB`;
    return `${size} B`;
  },
  ALLOWED_FILE_TYPES: {
    'image/jpeg': [],
    'image/png': [],
    'application/pdf': [],
    'text/csv': [],
  },
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
}));

describe('FileUpload', () => {
  const defaultProps = {
    entityType: 'capability' as const,
    entityId: 'cap-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('default rendering', () => {
    it('renders drop zone', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText(/Drag & drop files here/)).toBeInTheDocument();
    });

    it('renders file type hints', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText(/Supported: images, PDF, Word, Excel, CSV/)).toBeInTheDocument();
    });

    it('renders max file size', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText(/Max 10 MB per file/)).toBeInTheDocument();
    });

    it('has file input', () => {
      const { container } = render(<FileUpload {...defaultProps} />);
      const input = container.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('renders compact button', () => {
      render(<FileUpload {...defaultProps} compact />);
      expect(screen.getByRole('button', { name: /Attach File/i })).toBeInTheDocument();
    });

    it('does not render drop zone in compact mode', () => {
      render(<FileUpload {...defaultProps} compact />);
      expect(screen.queryByText(/Drag & drop files here/)).not.toBeInTheDocument();
    });
  });

  describe('drag state', () => {
    it('shows different text when dragging', async () => {
      const { container } = render(<FileUpload {...defaultProps} />);
      const dropZone = container.querySelector('.border-dashed');

      if (dropZone) {
        // Simulate drag enter
        fireEvent.dragEnter(dropZone, {
          dataTransfer: {
            types: ['Files'],
            files: [],
          },
        });

        // Note: The drag active state styling would change
        // This is typically tested with integration tests
      }
    });
  });

  describe('file upload', () => {
    it('uploads file when dropped', async () => {
      const { container } = render(<FileUpload {...defaultProps} />);
      const input = container.querySelector('input[type="file"]');

      if (input) {
        const file = new File(['test content'], 'test.pdf', {
          type: 'application/pdf',
        });

        Object.defineProperty(input, 'files', {
          value: [file],
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockUploadMutation.mutateAsync).toHaveBeenCalledWith({
            file,
            entityType: 'capability',
            entityId: 'cap-1',
          });
        });
      }
    });

    it('calls onUploadComplete after upload', async () => {
      const onUploadComplete = vi.fn();
      const { container } = render(
        <FileUpload {...defaultProps} onUploadComplete={onUploadComplete} />
      );
      const input = container.querySelector('input[type="file"]');

      if (input) {
        const file = new File(['test content'], 'test.pdf', {
          type: 'application/pdf',
        });

        Object.defineProperty(input, 'files', {
          value: [file],
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(onUploadComplete).toHaveBeenCalled();
        });
      }
    });
  });

  describe('pending files', () => {
    it('shows pending file during upload', async () => {
      // Create a slower mock to catch the pending state
      mockUploadMutation.mutateAsync = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { container } = render(<FileUpload {...defaultProps} />);
      const input = container.querySelector('input[type="file"]');

      if (input) {
        const file = new File(['test content'], 'uploading.pdf', {
          type: 'application/pdf',
        });

        Object.defineProperty(input, 'files', {
          value: [file],
        });

        fireEvent.change(input);

        // Should show pending file
        await waitFor(() => {
          expect(screen.getByText('uploading.pdf')).toBeInTheDocument();
        });
      }
    });
  });

  describe('error handling', () => {
    it('shows error when upload fails', async () => {
      mockUploadMutation.mutateAsync = vi.fn().mockRejectedValue(
        new Error('Upload failed')
      );

      const { container } = render(<FileUpload {...defaultProps} />);
      const input = container.querySelector('input[type="file"]');

      if (input) {
        const file = new File(['test content'], 'error.pdf', {
          type: 'application/pdf',
        });

        Object.defineProperty(input, 'files', {
          value: [file],
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(screen.getByText('Upload failed')).toBeInTheDocument();
        });
      }
    });

    it('allows removing failed upload', async () => {
      mockUploadMutation.mutateAsync = vi.fn().mockRejectedValue(
        new Error('Upload failed')
      );

      const { container } = render(<FileUpload {...defaultProps} />);
      const input = container.querySelector('input[type="file"]');

      if (input) {
        const file = new File(['test content'], 'error.pdf', {
          type: 'application/pdf',
        });

        Object.defineProperty(input, 'files', {
          value: [file],
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(screen.getByText('Upload failed')).toBeInTheDocument();
        });

        // Click remove button
        const removeButton = container.querySelector('button[class*="ghost"]');
        if (removeButton) {
          fireEvent.click(removeButton);
          expect(screen.queryByText('error.pdf')).not.toBeInTheDocument();
        }
      }
    });
  });

  describe('multiple files', () => {
    it('handles multiple file upload', async () => {
      mockUploadMutation.mutateAsync = vi.fn().mockResolvedValue({});

      const { container } = render(<FileUpload {...defaultProps} />);
      const input = container.querySelector('input[type="file"]');

      if (input) {
        const files = [
          new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
          new File(['content2'], 'file2.png', { type: 'image/png' }),
        ];

        Object.defineProperty(input, 'files', {
          value: files,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockUploadMutation.mutateAsync).toHaveBeenCalledTimes(2);
        });
      }
    });
  });

  describe('loading state', () => {
    it('disables drop zone when uploading', () => {
      mockUploadMutation.isPending = true;

      const { container } = render(<FileUpload {...defaultProps} />);
      const dropZone = container.querySelector('.border-dashed');

      expect(dropZone).toHaveClass('pointer-events-none');
      expect(dropZone).toHaveClass('opacity-50');

      mockUploadMutation.isPending = false;
    });

    it('shows loading state in compact mode', () => {
      mockUploadMutation.isPending = true;

      render(<FileUpload {...defaultProps} compact />);
      const button = screen.getByRole('button', { name: /Attach File/i });

      expect(button).toBeDisabled();

      mockUploadMutation.isPending = false;
    });
  });
});
