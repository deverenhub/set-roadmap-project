// supabase/functions/send-email/index.ts
// Edge function to send email notifications via Resend

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'SET Roadmap <notifications@setvpc.com>';
const APP_URL = Deno.env.get('APP_URL') || 'https://setvpc.com';

interface EmailPayload {
  to: string;
  subject: string;
  type: 'mention' | 'blocked' | 'status_change' | 'comment' | 'system';
  data: {
    recipientName?: string;
    actorName?: string;
    entityName?: string;
    entityType?: string;
    entityId?: string;
    message?: string;
    oldStatus?: string;
    newStatus?: string;
  };
}

// Email templates
const templates = {
  mention: (data: EmailPayload['data']) => ({
    subject: `${data.actorName || 'Someone'} mentioned you in ${data.entityName || 'a discussion'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You were mentioned</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1a3a3a; padding: 24px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <span style="color: #0d9488; font-size: 24px; font-weight: bold;">SET</span>
                            <span style="color: #ffffff; font-size: 18px; margin-left: 8px;">VPC Roadmap</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">You were mentioned</h1>
                      <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                        <strong>${data.actorName || 'Someone'}</strong> mentioned you in a comment on
                        <strong>${data.entityName || 'an item'}</strong>.
                      </p>
                      ${data.message ? `
                        <div style="background-color: #f4f4f5; border-left: 4px solid #0d9488; padding: 16px; margin: 0 0 24px; border-radius: 4px;">
                          <p style="margin: 0; font-size: 14px; color: #4a4a4a; font-style: italic;">"${data.message}"</p>
                        </div>
                      ` : ''}
                      <a href="${APP_URL}/${data.entityType === 'milestone' ? 'timeline' : data.entityType === 'quick_win' ? 'quick-wins' : 'capabilities'}?id=${data.entityId}"
                         style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                        View Comment
                      </a>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f4f4f5; padding: 24px 32px; border-top: 1px solid #e4e4e7;">
                      <p style="margin: 0; font-size: 12px; color: #71717a;">
                        You're receiving this email because you were mentioned in the SET VPC Roadmap application.
                        <br><br>
                        Southeast Toyota Distributors, LLC | Confidential
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  blocked: (data: EmailPayload['data']) => ({
    subject: `Alert: ${data.entityName || 'A milestone'} has been blocked`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Milestone Blocked</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1a3a3a; padding: 24px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <span style="color: #0d9488; font-size: 24px; font-weight: bold;">SET</span>
                            <span style="color: #ffffff; font-size: 18px; margin-left: 8px;">VPC Roadmap</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Alert Banner -->
                  <tr>
                    <td style="background-color: #fef2f2; padding: 16px 32px; border-bottom: 1px solid #fecaca;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: #dc2626; font-size: 14px; font-weight: 500;">
                            ⚠️ ACTION REQUIRED
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 16px; font-size: 24px; color: #dc2626;">Milestone Blocked</h1>
                      <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                        <strong>${data.entityName || 'A milestone'}</strong> has been marked as blocked and requires attention.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 6px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #71717a; font-size: 12px;">Previous Status</span><br>
                                  <span style="color: #1a1a1a; font-size: 14px; font-weight: 500;">${data.oldStatus?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
                                </td>
                                <td style="padding: 8px 0;">
                                  <span style="color: #71717a; font-size: 12px;">Current Status</span><br>
                                  <span style="color: #dc2626; font-size: 14px; font-weight: 500;">BLOCKED</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <a href="${APP_URL}/timeline?milestone=${data.entityId}"
                         style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                        View Milestone
                      </a>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f4f4f5; padding: 24px 32px; border-top: 1px solid #e4e4e7;">
                      <p style="margin: 0; font-size: 12px; color: #71717a;">
                        You're receiving this email because you're an admin or editor on the SET VPC Roadmap.
                        <br><br>
                        Southeast Toyota Distributors, LLC | Confidential
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  status_change: (data: EmailPayload['data']) => ({
    subject: `${data.entityName || 'An item'} status changed to ${data.newStatus?.replace('_', ' ')}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1a3a3a; padding: 24px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <span style="color: #0d9488; font-size: 24px; font-weight: bold;">SET</span>
                            <span style="color: #ffffff; font-size: 18px; margin-left: 8px;">VPC Roadmap</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">Status Update</h1>
                      <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                        <strong>${data.entityName || 'An item'}</strong> status has been updated.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 6px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #71717a; font-size: 12px;">Previous Status</span><br>
                                  <span style="color: #1a1a1a; font-size: 14px; font-weight: 500;">${data.oldStatus?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
                                </td>
                                <td style="padding: 8px 0;">
                                  <span style="color: #71717a; font-size: 12px;">New Status</span><br>
                                  <span style="color: #0d9488; font-size: 14px; font-weight: 500;">${data.newStatus?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <a href="${APP_URL}/${data.entityType === 'milestone' ? 'timeline' : data.entityType === 'quick_win' ? 'quick-wins' : 'capabilities'}?id=${data.entityId}"
                         style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                        View Details
                      </a>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f4f4f5; padding: 24px 32px; border-top: 1px solid #e4e4e7;">
                      <p style="margin: 0; font-size: 12px; color: #71717a;">
                        You're receiving this email because you have notifications enabled for status changes.
                        <br><br>
                        Southeast Toyota Distributors, LLC | Confidential
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  comment: (data: EmailPayload['data']) => ({
    subject: `New comment on ${data.entityName || 'an item'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Comment</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1a3a3a; padding: 24px 32px;">
                      <span style="color: #0d9488; font-size: 24px; font-weight: bold;">SET</span>
                      <span style="color: #ffffff; font-size: 18px; margin-left: 8px;">VPC Roadmap</span>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">New Comment</h1>
                      <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                        <strong>${data.actorName || 'Someone'}</strong> commented on <strong>${data.entityName || 'an item'}</strong>.
                      </p>
                      ${data.message ? `
                        <div style="background-color: #f4f4f5; border-left: 4px solid #0d9488; padding: 16px; margin: 0 0 24px; border-radius: 4px;">
                          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">"${data.message}"</p>
                        </div>
                      ` : ''}
                      <a href="${APP_URL}/${data.entityType === 'milestone' ? 'timeline' : data.entityType === 'quick_win' ? 'quick-wins' : 'capabilities'}?id=${data.entityId}"
                         style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                        View Comment
                      </a>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f4f4f5; padding: 24px 32px; border-top: 1px solid #e4e4e7;">
                      <p style="margin: 0; font-size: 12px; color: #71717a;">
                        Southeast Toyota Distributors, LLC | Confidential
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  system: (data: EmailPayload['data']) => ({
    subject: data.message || 'System Notification',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>System Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #1a3a3a; padding: 24px 32px;">
                      <span style="color: #0d9488; font-size: 24px; font-weight: bold;">SET</span>
                      <span style="color: #ffffff; font-size: 18px; margin-left: 8px;">VPC Roadmap</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">System Notification</h1>
                      <p style="margin: 0; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                        ${data.message || 'You have a new notification from SET VPC Roadmap.'}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f4f4f5; padding: 24px 32px; border-top: 1px solid #e4e4e7;">
                      <p style="margin: 0; font-size: 12px; color: #71717a;">
                        Southeast Toyota Distributors, LLC | Confidential
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),
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
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const payload: EmailPayload = await req.json();
    const { to, type, data } = payload;

    if (!to || !type) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get template
    const template = templates[type];
    if (!template) {
      return new Response(
        JSON.stringify({ success: false, error: `Unknown email type: ${type}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const emailContent = template(data);

    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: payload.subject || emailContent.subject,
        html: emailContent.html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return new Response(
        JSON.stringify({ success: false, error: result.message || 'Failed to send email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    console.log('Email sent successfully:', result.id);
    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
