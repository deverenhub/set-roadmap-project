// src/components/reports/PDFStyles.ts
import { StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (using default for now, can add custom fonts later)
// Font.register({
//   family: 'Inter',
//   src: '/fonts/Inter-Regular.ttf',
// });

// SET Brand Colors
export const colors = {
  primary: '#008C99',     // SET Teal
  primaryDark: '#006B75', // SET Teal 700
  dark: '#1D2C31',        // SET Dark
  red: '#EB1C2D',         // SET Red / Toyota Red
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

// Common styles shared across PDF reports
export const styles = StyleSheet.create({
  // Page layouts
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  pageTitlePage: {
    flexDirection: 'column',
    backgroundColor: colors.dark,
    padding: 0,
    fontFamily: 'Helvetica',
  },
  pageWithHeader: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 14,
    color: colors.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.gray[400],
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: colors.gray[100],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  footerText: {
    fontSize: 8,
    color: colors.gray[500],
  },
  pageNumber: {
    fontSize: 8,
    color: colors.gray[500],
  },

  // Title page
  titlePage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  titleLogo: {
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 36,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
  date: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
  },

  // Section headers
  sectionTitle: {
    fontSize: 18,
    color: colors.dark,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  subsectionTitle: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },

  // Text styles
  text: {
    fontSize: 10,
    color: colors.gray[700],
    lineHeight: 1.5,
  },
  textSmall: {
    fontSize: 8,
    color: colors.gray[500],
  },
  textBold: {
    fontSize: 10,
    color: colors.gray[800],
    fontWeight: 'bold',
  },
  textMuted: {
    fontSize: 10,
    color: colors.gray[500],
  },

  // Cards
  card: {
    backgroundColor: colors.gray[50],
    borderRadius: 6,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: colors.dark,
    fontWeight: 'bold',
  },

  // Stats/Metrics
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 9,
    color: colors.gray[500],
    textAlign: 'center',
  },

  // Tables
  table: {
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    color: colors.white,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.gray[50],
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: colors.gray[700],
  },

  // Progress bar
  progressContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  // Badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 8,
    fontWeight: 'bold',
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  badgeError: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  badgeInfo: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  badgeDefault: {
    backgroundColor: colors.gray[200],
    color: colors.gray[700],
  },

  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  col: {
    flexDirection: 'column',
  },
  flex1: {
    flex: 1,
  },
  mt10: {
    marginTop: 10,
  },
  mt20: {
    marginTop: 20,
  },
  mb10: {
    marginBottom: 10,
  },
  mb20: {
    marginBottom: 20,
  },
  gap5: {
    gap: 5,
  },
  gap10: {
    gap: 10,
  },
});

// Status color helper
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return colors.status.success;
    case 'in_progress':
    case 'active':
      return colors.status.info;
    case 'blocked':
      return colors.status.error;
    case 'at_risk':
      return colors.status.warning;
    default:
      return colors.gray[500];
  }
}

// Priority color helper
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return colors.status.error;
    case 'high':
      return colors.status.warning;
    case 'medium':
      return colors.status.info;
    case 'low':
      return colors.gray[500];
    default:
      return colors.gray[500];
  }
}
