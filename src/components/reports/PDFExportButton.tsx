// src/components/reports/PDFExportButton.tsx
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Download, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ExecutiveSummaryPDF } from './ExecutiveSummaryPDF';
import { useCapabilities, useMilestones, useQuickWins } from '@/hooks';

type ReportType = 'executive' | 'capabilities' | 'timeline';

interface PDFExportButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showDropdown?: boolean;
  defaultReport?: ReportType;
}

export function PDFExportButton({
  variant = 'outline',
  size = 'sm',
  showDropdown = true,
  defaultReport = 'executive',
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: capabilities = [] } = useCapabilities();
  const { data: milestones = [] } = useMilestones();
  const { data: quickWins = [] } = useQuickWins();

  const generatePDF = async (reportType: ReportType) => {
    setIsGenerating(true);

    try {
      let document;
      let filename;
      const now = new Date();
      const dateStr = format(now, 'yyyy-MM-dd');

      switch (reportType) {
        case 'executive':
          document = (
            <ExecutiveSummaryPDF
              capabilities={capabilities}
              milestones={milestones}
              quickWins={quickWins}
              generatedDate={now}
            />
          );
          filename = `SET-Executive-Summary-${dateStr}.pdf`;
          break;

        case 'capabilities':
          // Using Executive Summary for now, can create dedicated report later
          document = (
            <ExecutiveSummaryPDF
              capabilities={capabilities}
              milestones={milestones}
              quickWins={quickWins}
              generatedDate={now}
            />
          );
          filename = `SET-Capability-Progress-${dateStr}.pdf`;
          break;

        case 'timeline':
          // Using Executive Summary for now, can create dedicated report later
          document = (
            <ExecutiveSummaryPDF
              capabilities={capabilities}
              milestones={milestones}
              quickWins={quickWins}
              generatedDate={now}
            />
          );
          filename = `SET-Timeline-Report-${dateStr}.pdf`;
          break;

        default:
          throw new Error('Unknown report type');
      }

      const blob = await pdf(document).toBlob();
      saveAs(blob, filename);
      toast.success(`${getReportName(reportType)} exported successfully`);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportName = (type: ReportType): string => {
    switch (type) {
      case 'executive':
        return 'Executive Summary';
      case 'capabilities':
        return 'Capability Progress';
      case 'timeline':
        return 'Timeline Report';
      default:
        return 'Report';
    }
  };

  if (!showDropdown) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => generatePDF(defaultReport)}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Export PDF
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => generatePDF('executive')}>
          <FileText className="mr-2 h-4 w-4" />
          Executive Summary
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF('capabilities')}>
          <FileText className="mr-2 h-4 w-4" />
          Capability Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF('timeline')}>
          <FileText className="mr-2 h-4 w-4" />
          Timeline Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
