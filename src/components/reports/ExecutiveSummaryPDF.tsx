// src/components/reports/ExecutiveSummaryPDF.tsx
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';
import {
  PDFLogo,
  PDFHeader,
  PDFFooter,
  PDFTitlePage,
  PDFContentPage,
  PDFStatBox,
  PDFStatsRow,
  PDFProgressBar,
  PDFSectionTitle,
  PDFSubsectionTitle,
  PDFCard,
  PDFTable,
  PDFStatusBadge,
  PDFPriorityBadge,
} from './PDFComponents';
import { styles, colors } from './PDFStyles';
import type { Capability, Milestone, QuickWin } from '@/types';

interface ExecutiveSummaryPDFProps {
  capabilities: Capability[];
  milestones: Milestone[];
  quickWins: QuickWin[];
  generatedDate?: Date;
}

interface Metrics {
  overallProgress: number;
  completedMilestones: number;
  totalMilestones: number;
  inProgressMilestones: number;
  blockedMilestones: number;
  criticalCapabilities: number;
  highCapabilities: number;
  totalCapabilities: number;
  maturityProgress: number;
  avgCurrentLevel: string;
  avgTargetLevel: string;
  quickWinProgress: number;
  completedQuickWins: number;
  totalQuickWins: number;
  healthScore: number;
  healthStatus: 'healthy' | 'at-risk' | 'critical';
}

function calculateMetrics(
  capabilities: Capability[],
  milestones: Milestone[],
  quickWins: QuickWin[]
): Metrics {
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;
  const blockedMilestones = milestones.filter(m => m.status === 'blocked').length;

  const overallProgress = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0;

  const criticalCapabilities = capabilities.filter(c => c.priority === 'CRITICAL').length;
  const highCapabilities = capabilities.filter(c => c.priority === 'HIGH').length;

  const avgCurrentLevel = capabilities.length > 0
    ? capabilities.reduce((acc, c) => acc + c.current_level, 0) / capabilities.length
    : 1;
  const avgTargetLevel = capabilities.length > 0
    ? capabilities.reduce((acc, c) => acc + c.target_level, 0) / capabilities.length
    : 1;
  const maturityProgress = avgTargetLevel > 1 && avgCurrentLevel >= 1
    ? Math.round(((avgCurrentLevel - 1) / (avgTargetLevel - 1)) * 100)
    : avgCurrentLevel >= avgTargetLevel ? 100 : 0;

  const completedQuickWins = quickWins.filter(qw => qw.status === 'completed').length;
  const quickWinProgress = quickWins.length > 0
    ? Math.round((completedQuickWins / quickWins.length) * 100)
    : 0;

  const blockedPenalty = blockedMilestones * 10;
  const progressBonus = overallProgress * 0.5;
  const criticalBonus = criticalCapabilities > 0 ? (completedMilestones / criticalCapabilities) * 10 : 0;
  const healthScore = Math.min(100, Math.max(0, 50 + progressBonus - blockedPenalty + criticalBonus));

  let healthStatus: 'healthy' | 'at-risk' | 'critical' = 'healthy';
  if (healthScore < 40 || blockedMilestones > 2) healthStatus = 'critical';
  else if (healthScore < 70 || blockedMilestones > 0) healthStatus = 'at-risk';

  return {
    overallProgress,
    completedMilestones,
    totalMilestones,
    inProgressMilestones,
    blockedMilestones,
    criticalCapabilities,
    highCapabilities,
    totalCapabilities: capabilities.length,
    maturityProgress,
    avgCurrentLevel: avgCurrentLevel.toFixed(1),
    avgTargetLevel: avgTargetLevel.toFixed(1),
    quickWinProgress,
    completedQuickWins,
    totalQuickWins: quickWins.length,
    healthScore: Math.round(healthScore),
    healthStatus,
  };
}

export function ExecutiveSummaryPDF({
  capabilities,
  milestones,
  quickWins,
  generatedDate = new Date(),
}: ExecutiveSummaryPDFProps) {
  const metrics = calculateMetrics(capabilities, milestones, quickWins);

  // Get blocked milestones details
  const blockedItems = milestones.filter(m => m.status === 'blocked');

  // Get critical capabilities with progress
  const criticalCaps = capabilities
    .filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH')
    .map(cap => {
      const capMilestones = milestones.filter(m => m.capability_id === cap.id);
      const completedCount = capMilestones.filter(m => m.status === 'completed').length;
      const progress = capMilestones.length > 0
        ? Math.round((completedCount / capMilestones.length) * 100)
        : 0;
      return {
        ...cap,
        milestoneCount: capMilestones.length,
        completedCount,
        progress,
      };
    })
    .slice(0, 10);

  // Get recent quick wins
  const recentQuickWins = [...quickWins]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const healthColor = {
    healthy: colors.status.success,
    'at-risk': colors.status.warning,
    critical: colors.status.error,
  }[metrics.healthStatus];

  return (
    <Document>
      {/* Title Page */}
      <PDFTitlePage
        title="Executive Summary"
        subtitle="SET VPC Roadmap Progress Report"
        date={format(generatedDate, 'MMMM d, yyyy')}
      />

      {/* Overview Page */}
      <PDFContentPage title="Executive Overview">
        {/* Health Banner */}
        <View style={[styles.card, { backgroundColor: healthColor + '15', borderColor: healthColor }]} wrap={false}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.textBold, { fontSize: 16, color: healthColor }]}>
                Program Health: {metrics.healthStatus.replace('-', ' ').toUpperCase()}
              </Text>
              <Text style={[styles.text, { marginTop: 4 }]}>
                Overall health score: {metrics.healthScore}/100
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.statValue, { color: healthColor }]}>{metrics.overallProgress}%</Text>
              <Text style={styles.statLabel}>Overall Progress</Text>
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <PDFSectionTitle>Key Metrics</PDFSectionTitle>
        <PDFStatsRow>
          <PDFStatBox
            value={`${metrics.completedMilestones}/${metrics.totalMilestones}`}
            label="Milestones Completed"
          />
          <PDFStatBox
            value={`L${metrics.avgCurrentLevel}`}
            label="Avg Maturity Level"
          />
          <PDFStatBox
            value={`${metrics.completedQuickWins}/${metrics.totalQuickWins}`}
            label="Quick Wins Done"
          />
          <PDFStatBox
            value={metrics.blockedMilestones.toString()}
            label="Blocked Items"
            color={metrics.blockedMilestones > 0 ? colors.status.error : colors.status.success}
          />
        </PDFStatsRow>

        {/* Progress Summary */}
        <PDFSectionTitle>Progress Summary</PDFSectionTitle>
        <View style={styles.card} wrap={false}>
          <View style={[styles.rowBetween, { marginBottom: 15 }]}>
            <Text style={styles.cardTitle}>Milestone Completion</Text>
            <Text style={styles.textBold}>{metrics.overallProgress}%</Text>
          </View>
          <PDFProgressBar value={metrics.overallProgress} />

          <View style={[styles.rowBetween, { marginBottom: 15, marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Maturity Progress</Text>
            <Text style={styles.textBold}>{metrics.maturityProgress}%</Text>
          </View>
          <PDFProgressBar value={metrics.maturityProgress} color={colors.primary} />

          <View style={[styles.rowBetween, { marginBottom: 15, marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Quick Wins</Text>
            <Text style={styles.textBold}>{metrics.quickWinProgress}%</Text>
          </View>
          <PDFProgressBar value={metrics.quickWinProgress} color={colors.primaryDark} />
        </View>

        {/* Strategic Narrative - wrapped together with title to prevent page split */}
        <View wrap={false}>
          <PDFSectionTitle>Strategic Narrative</PDFSectionTitle>
          <View style={[styles.card, { backgroundColor: colors.gray[50] }]}>
            <Text style={styles.text}>
              The SET Roadmap initiative is currently{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {metrics.healthStatus === 'healthy' ? 'on track' :
                 metrics.healthStatus === 'at-risk' ? 'at moderate risk' : 'requiring immediate attention'}
              </Text>{' '}
              with an overall completion rate of{' '}
              <Text style={{ fontWeight: 'bold' }}>{metrics.overallProgress}%</Text>.
              We have successfully completed{' '}
              <Text style={{ fontWeight: 'bold' }}>{metrics.completedMilestones}</Text> of{' '}
              <Text style={{ fontWeight: 'bold' }}>{metrics.totalMilestones}</Text> planned milestones
              across{' '}
              <Text style={{ fontWeight: 'bold' }}>{metrics.totalCapabilities}</Text> operational capabilities.
            </Text>
            <Text style={[styles.text, { marginTop: 10 }]}>
              {metrics.blockedMilestones > 0
                ? `${metrics.blockedMilestones} milestone(s) are currently blocked and require leadership attention. These blockers may impact our projected timeline if not resolved within the next sprint cycle.`
                : 'No milestones are currently blocked, allowing the team to maintain momentum on the planned timeline.'
              }
            </Text>
            <Text style={[styles.text, { marginTop: 10 }]}>
              Current maturity has progressed to Level {metrics.avgCurrentLevel} on average,
              with a target of Level {metrics.avgTargetLevel}.
              Quick wins are tracking at {metrics.quickWinProgress}% completion,
              providing early value while larger initiatives are in development.
            </Text>
          </View>
        </View>
      </PDFContentPage>

      {/* Critical Items Page */}
      <PDFContentPage title="Critical Items">
        {/* Blocked Items */}
        {blockedItems.length > 0 && (
          <>
            <PDFSectionTitle>Blocked Milestones</PDFSectionTitle>
            <PDFTable
              columns={[
                { key: 'name', header: 'Milestone', width: 2 },
                { key: 'capability', header: 'Capability', width: 1.5 },
                { key: 'status', header: 'Status', width: 1 },
              ]}
              data={blockedItems.map(m => {
                const cap = capabilities.find(c => c.id === m.capability_id);
                return {
                  name: m.name,
                  capability: cap?.name || 'Unknown',
                  status: m.status,
                };
              })}
              renderCell={(key, value) => {
                if (key === 'status') {
                  return <PDFStatusBadge status={value} />;
                }
                return <Text style={styles.tableCell}>{value}</Text>;
              }}
            />
          </>
        )}

        {/* Critical Capabilities */}
        <PDFSectionTitle>Critical & High Priority Capabilities</PDFSectionTitle>
        <PDFTable
          columns={[
            { key: 'name', header: 'Capability', width: 2 },
            { key: 'priority', header: 'Priority', width: 1 },
            { key: 'progress', header: 'Progress', width: 1 },
            { key: 'maturity', header: 'Maturity', width: 1 },
          ]}
          data={criticalCaps.map(cap => ({
            name: cap.name,
            priority: cap.priority,
            progress: `${cap.progress}%`,
            maturity: `L${cap.current_level} → L${cap.target_level}`,
          }))}
          renderCell={(key, value) => {
            if (key === 'priority') {
              return <PDFPriorityBadge priority={value.toLowerCase()} />;
            }
            return <Text style={styles.tableCell}>{value}</Text>;
          }}
        />

        {/* Recent Quick Wins */}
        {recentQuickWins.length > 0 && (
          <>
            <PDFSectionTitle>Recent Quick Wins</PDFSectionTitle>
            <PDFTable
              columns={[
                { key: 'name', header: 'Quick Win', width: 2 },
                { key: 'status', header: 'Status', width: 1 },
                { key: 'effort', header: 'Investment', width: 1 },
                { key: 'impact', header: 'ROI', width: 1 },
              ]}
              data={recentQuickWins.map(qw => ({
                name: qw.name,
                status: qw.status,
                effort: qw.investment || '-',
                impact: qw.roi || '-',
              }))}
              renderCell={(key, value) => {
                if (key === 'status') {
                  return <PDFStatusBadge status={value} />;
                }
                return <Text style={styles.tableCell}>{String(value)}</Text>;
              }}
            />
          </>
        )}
      </PDFContentPage>

      {/* Recommendations Page */}
      <PDFContentPage title="Recommendations">
        <PDFSectionTitle>Strategic Recommendations</PDFSectionTitle>

        <View style={[styles.card, { backgroundColor: colors.status.success + '10', borderColor: colors.status.success }]} wrap={false}>
          <Text style={[styles.cardTitle, { color: colors.status.success, marginBottom: 10 }]}>
            Recommended Actions
          </Text>

          <View style={{ marginBottom: 8 }}>
            <Text style={styles.text}>
              • Maintain current delivery commitments on schedule
            </Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.text}>
              • Keep resource utilization at sustainable levels
            </Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.text}>
              • Preserve quality standards and reduce burnout risk
            </Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.text}>
              • Allow time for stabilization before new initiatives
            </Text>
          </View>
          {metrics.blockedMilestones > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.text, { color: colors.status.error }]}>
                • URGENT: Resolve {metrics.blockedMilestones} blocked milestone(s) to maintain timeline
              </Text>
            </View>
          )}
        </View>

        <PDFSectionTitle>Report Information</PDFSectionTitle>
        <View style={styles.card} wrap={false}>
          <View style={[styles.row, { marginBottom: 8 }]}>
            <Text style={styles.textBold}>Generated: </Text>
            <Text style={styles.text}>
              {format(generatedDate, 'MMMM d, yyyy h:mm a')}
            </Text>
          </View>
          <View style={[styles.row, { marginBottom: 8 }]}>
            <Text style={styles.textBold}>Total Capabilities: </Text>
            <Text style={styles.text}>{capabilities.length}</Text>
          </View>
          <View style={[styles.row, { marginBottom: 8 }]}>
            <Text style={styles.textBold}>Total Milestones: </Text>
            <Text style={styles.text}>{milestones.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.textBold}>Total Quick Wins: </Text>
            <Text style={styles.text}>{quickWins.length}</Text>
          </View>
        </View>
      </PDFContentPage>
    </Document>
  );
}
