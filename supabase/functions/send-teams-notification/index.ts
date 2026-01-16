// supabase/functions/send-teams-notification/index.ts
// Edge function to send notifications to Microsoft Teams via Incoming Webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const APP_URL = Deno.env.get('APP_URL') || 'https://setvpc.com';
const TEAMS_WEBHOOK_URL = Deno.env.get('TEAMS_WEBHOOK_URL');

interface TeamsNotificationPayload {
  webhookUrl?: string; // Optional override
  type: 'mention' | 'blocked' | 'status_change' | 'comment' | 'activity' | 'system';
  data: {
    recipientName?: string;
    actorName?: string;
    entityName?: string;
    entityType?: string;
    entityId?: string;
    message?: string;
    oldStatus?: string;
    newStatus?: string;
    tableName?: string;
    action?: string;
  };
}

// Adaptive Card templates for Teams
const createAdaptiveCard = (payload: TeamsNotificationPayload) => {
  const { type, data } = payload;

  // Color themes based on notification type
  const colors = {
    mention: 'accent', // Blue
    blocked: 'attention', // Red
    status_change: 'good', // Green
    comment: 'accent',
    activity: 'default',
    system: 'default',
  };

  // Get entity URL
  const getEntityUrl = () => {
    const entityType = data.entityType || 'capabilities';
    const routes: Record<string, string> = {
      milestone: 'timeline',
      milestones: 'timeline',
      quick_win: 'quick-wins',
      quick_wins: 'quick-wins',
      capability: 'capabilities',
      capabilities: 'capabilities',
      technology_option: 'technology-options',
      technology_options: 'technology-options',
    };
    return `${APP_URL}/${routes[entityType] || 'capabilities'}${data.entityId ? `?id=${data.entityId}` : ''}`;
  };

  // Generate card content based on type
  const generateContent = () => {
    switch (type) {
      case 'mention':
        return {
          title: 'You were mentioned',
          subtitle: `${data.actorName || 'Someone'} mentioned you`,
          body: `You were mentioned in a comment on **${data.entityName || 'an item'}**.`,
          quote: data.message,
          buttonText: 'View Comment',
          color: colors.mention,
        };

      case 'blocked':
        return {
          title: 'Milestone Blocked',
          subtitle: 'Action Required',
          body: `**${data.entityName || 'A milestone'}** has been marked as blocked and requires attention.`,
          facts: [
            { title: 'Previous Status', value: data.oldStatus?.replace('_', ' ').toUpperCase() || 'N/A' },
            { title: 'Current Status', value: 'BLOCKED' },
          ],
          buttonText: 'View Milestone',
          color: colors.blocked,
        };

      case 'status_change':
        return {
          title: 'Status Updated',
          subtitle: data.entityName || 'Item updated',
          body: `**${data.entityName || 'An item'}** status has been updated.`,
          facts: [
            { title: 'Previous Status', value: data.oldStatus?.replace('_', ' ').toUpperCase() || 'N/A' },
            { title: 'New Status', value: data.newStatus?.replace('_', ' ').toUpperCase() || 'N/A' },
          ],
          buttonText: 'View Details',
          color: colors.status_change,
        };

      case 'comment':
        return {
          title: 'New Comment',
          subtitle: `${data.actorName || 'Someone'} commented`,
          body: `${data.actorName || 'Someone'} commented on **${data.entityName || 'an item'}**.`,
          quote: data.message,
          buttonText: 'View Comment',
          color: colors.comment,
        };

      case 'activity':
        const actionVerbs: Record<string, string> = {
          INSERT: 'created',
          UPDATE: 'updated',
          DELETE: 'deleted',
        };
        return {
          title: 'Activity Update',
          subtitle: `${data.tableName?.replace('_', ' ')} ${actionVerbs[data.action || 'UPDATE'] || 'modified'}`,
          body: `**${data.actorName || 'Someone'}** ${actionVerbs[data.action || 'UPDATE'] || 'modified'} ${data.tableName?.replace('_', ' ')}: **${data.entityName || 'item'}**.`,
          buttonText: 'View Activity Log',
          color: colors.activity,
        };

      case 'system':
      default:
        return {
          title: 'SET VPC Roadmap',
          subtitle: 'System Notification',
          body: data.message || 'You have a new notification.',
          buttonText: 'Open Dashboard',
          color: colors.system,
        };
    }
  };

  const content = generateContent();

  // Build Adaptive Card
  const card = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          msteams: {
            width: 'Full',
          },
          body: [
            // Header with logo
            {
              type: 'ColumnSet',
              columns: [
                {
                  type: 'Column',
                  width: 'auto',
                  items: [
                    {
                      type: 'TextBlock',
                      text: 'SET',
                      size: 'Large',
                      weight: 'Bolder',
                      color: content.color,
                    },
                  ],
                },
                {
                  type: 'Column',
                  width: 'stretch',
                  items: [
                    {
                      type: 'TextBlock',
                      text: 'VPC Roadmap',
                      size: 'Medium',
                      weight: 'Bolder',
                      spacing: 'None',
                    },
                    {
                      type: 'TextBlock',
                      text: content.subtitle,
                      size: 'Small',
                      isSubtle: true,
                      spacing: 'None',
                    },
                  ],
                  verticalContentAlignment: 'Center',
                },
              ],
            },
            // Separator
            {
              type: 'TextBlock',
              text: ' ',
              separator: true,
            },
            // Title
            {
              type: 'TextBlock',
              text: content.title,
              size: 'Large',
              weight: 'Bolder',
              wrap: true,
              color: content.color === 'attention' ? 'Attention' : 'Default',
            },
            // Body
            {
              type: 'TextBlock',
              text: content.body,
              wrap: true,
              spacing: 'Small',
            },
            // Quote if exists
            ...(content.quote
              ? [
                  {
                    type: 'Container',
                    style: 'emphasis',
                    items: [
                      {
                        type: 'TextBlock',
                        text: `"${content.quote}"`,
                        wrap: true,
                        isSubtle: true,
                        fontType: 'Default',
                        size: 'Small',
                      },
                    ],
                    spacing: 'Medium',
                  },
                ]
              : []),
            // Facts if exist
            ...(content.facts
              ? [
                  {
                    type: 'FactSet',
                    facts: content.facts,
                    spacing: 'Medium',
                  },
                ]
              : []),
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: content.buttonText,
              url: type === 'activity' ? `${APP_URL}/activity-log` : getEntityUrl(),
            },
          ],
        },
      },
    ],
  };

  return card;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: TeamsNotificationPayload = await req.json();
    const webhookUrl = payload.webhookUrl || TEAMS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('TEAMS_WEBHOOK_URL not configured, skipping notification');
      return new Response(
        JSON.stringify({ success: false, error: 'Teams webhook not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const { type, data } = payload;

    if (!type) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required field: type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create adaptive card
    const card = createAdaptiveCard(payload);

    // Send to Teams webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Teams webhook error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Teams webhook failed: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    console.log('Teams notification sent successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error sending Teams notification:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
