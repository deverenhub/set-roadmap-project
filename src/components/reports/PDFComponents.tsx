// src/components/reports/PDFComponents.tsx
import { Document, Page, Text, View, Svg, Ellipse } from '@react-pdf/renderer';
import { styles, colors, getStatusColor, getPriorityColor } from './PDFStyles';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

// SET Logo component for PDF
export function PDFLogo({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Outer ellipse */}
      <Ellipse
        cx="50"
        cy="50"
        rx="47"
        ry="32"
        stroke={colors.red}
        strokeWidth={4}
      />
      {/* Inner horizontal ellipse */}
      <Ellipse
        cx="50"
        cy="35"
        rx="24"
        ry="15"
        stroke={colors.red}
        strokeWidth={4}
      />
      {/* Inner vertical ellipse */}
      <Ellipse
        cx="50"
        cy="55"
        rx="10"
        ry="27"
        stroke={colors.red}
        strokeWidth={4}
      />
    </Svg>
  );
}

// Page header with logo
export function PDFHeader({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerLogo}>
        <PDFLogo size={35} />
        <View>
          <Text style={styles.headerTitle}>SET VPC Roadmap</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Text style={styles.headerSubtitle}>{title}</Text>
    </View>
  );
}

// Page footer with page numbers
export function PDFFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        Southeast Toyota Distributors, LLC | Confidential
      </Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

// Title page component
interface TitlePageProps {
  title: string;
  subtitle?: string;
  date?: string;
}

export function PDFTitlePage({ title, subtitle, date }: TitlePageProps) {
  return (
    <Page size="A4" style={styles.pageTitlePage}>
      <View style={styles.titlePage}>
        <View style={styles.titleLogo}>
          <PDFLogo size={80} />
        </View>
        <Text style={styles.mainTitle}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.date}>
          {date || new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>
    </Page>
  );
}

// Content page wrapper
interface ContentPageProps {
  children: React.ReactNode;
  title?: string;
}

export function PDFContentPage({ children, title }: ContentPageProps) {
  return (
    <Page size="A4" style={styles.pageWithHeader} wrap>
      <PDFHeader title={title || ''} />
      <View style={{ flex: 1 }} wrap>
        {children}
      </View>
      <PDFFooter />
    </Page>
  );
}

// Stat box component
interface StatBoxProps {
  value: string | number;
  label: string;
  color?: string;
}

export function PDFStatBox({ value, label, color }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Stats row component - wrap={false} keeps all stats on same page
export function PDFStatsRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.statsRow} wrap={false}>{children}</View>;
}

// Progress bar component
interface ProgressBarProps {
  value: number;
  color?: string;
}

export function PDFProgressBar({ value, color }: ProgressBarProps) {
  return (
    <View style={styles.progressContainer}>
      <View
        style={[
          styles.progressBar,
          { width: `${Math.min(100, Math.max(0, value))}%` },
          color ? { backgroundColor: color } : {},
        ]}
      />
    </View>
  );
}

// Badge component
interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export function PDFBadge({ text, variant = 'default' }: BadgeProps) {
  const variantStyles = {
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    error: styles.badgeError,
    info: styles.badgeInfo,
    default: styles.badgeDefault,
  };

  return (
    <Text style={[styles.badge, variantStyles[variant]]}>
      {text.toUpperCase()}
    </Text>
  );
}

// Status badge helper
export function PDFStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps['variant']> = {
    completed: 'success',
    in_progress: 'info',
    active: 'info',
    blocked: 'error',
    at_risk: 'warning',
    planned: 'default',
    pending: 'default',
  };

  const displayText = status.replace(/_/g, ' ');
  return <PDFBadge text={displayText} variant={variantMap[status] || 'default'} />;
}

// Priority badge helper
export function PDFPriorityBadge({ priority }: { priority: string }) {
  const variantMap: Record<string, BadgeProps['variant']> = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'default',
  };

  return <PDFBadge text={priority} variant={variantMap[priority] || 'default'} />;
}

// Section title - minPresenceAhead keeps title with following content
export function PDFSectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle} minPresenceAhead={100}>{children}</Text>;
}

// Subsection title
export function PDFSubsectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subsectionTitle}>{children}</Text>;
}

// Card component - wrap={false} prevents page breaks within cards
export function PDFCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card} wrap={false}>{children}</View>;
}

// Table components
interface TableColumn {
  key: string;
  header: string;
  width?: number;
}

interface TableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  renderCell?: (key: string, value: any, row: Record<string, any>) => React.ReactNode;
}

export function PDFTable({ columns, data, renderCell }: TableProps) {
  return (
    <View style={styles.table} wrap={false}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[
              styles.tableHeaderCell,
              col.width ? { flex: col.width } : {},
            ]}
          >
            {col.header}
          </Text>
        ))}
      </View>

      {/* Rows */}
      {data.map((row, index) => (
        <View
          key={index}
          style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          wrap={false}
        >
          {columns.map((col) => (
            <View
              key={col.key}
              style={[styles.tableCell, col.width ? { flex: col.width } : {}]}
            >
              {renderCell ? (
                renderCell(col.key, row[col.key], row)
              ) : (
                <Text style={styles.tableCell}>{String(row[col.key] || '-')}</Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
