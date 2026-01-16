// supabase/functions/send-invitation/index.ts
// Edge function to send user invitation emails via Resend

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'SET Roadmap <notifications@setvpc.com>';
const APP_URL = Deno.env.get('APP_URL') || 'https://setvpc.com';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface InvitationPayload {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  inviterName?: string;
  message?: string;
}

const roleDescriptions: Record<string, string> = {
  admin: 'Full access to manage users, capabilities, milestones, and all settings',
  editor: 'Create and edit capabilities, milestones, quick wins, and add comments',
  viewer: 'View roadmap data, dashboards, and reports',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate secure token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Create invitation email HTML
function createInvitationEmail(data: {
  inviterName: string;
  role: string;
  token: string;
  expiresIn: string;
  message?: string;
}): string {
  const acceptUrl = `${APP_URL}/accept-invitation?token=${data.token}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited to SET VPC Roadmap</title>
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
                    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">You're Invited!</h1>
                    <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                      <strong>${data.inviterName}</strong> has invited you to join the SET VPC Roadmap platform.
                    </p>

                    ${data.message ? `
                      <div style="background-color: #f4f4f5; border-left: 4px solid #0d9488; padding: 16px; margin: 0 0 24px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #4a4a4a; font-style: italic;">"${data.message}"</p>
                      </div>
                    ` : ''}

                    <!-- Role Badge -->
                    <div style="background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
                      <p style="margin: 0 0 8px; font-size: 12px; color: #0d9488; text-transform: uppercase; font-weight: 600;">Your Role</p>
                      <p style="margin: 0 0 4px; font-size: 18px; color: #1a1a1a; font-weight: 600; text-transform: capitalize;">${data.role}</p>
                      <p style="margin: 0; font-size: 14px; color: #4a4a4a;">${roleDescriptions[data.role] || ''}</p>
                    </div>

                    <p style="margin: 0 0 24px; font-size: 14px; color: #71717a;">
                      This invitation will expire in ${data.expiresIn}.
                    </p>

                    <a href="${acceptUrl}"
                       style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Accept Invitation
                    </a>

                    <p style="margin: 24px 0 0; font-size: 12px; color: #71717a;">
                      Or copy and paste this link into your browser:<br>
                      <a href="${acceptUrl}" style="color: #0d9488; word-break: break-all;">${acceptUrl}</a>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f4f4f5; padding: 24px 32px; border-top: 1px solid #e4e4e7;">
                    <p style="margin: 0; font-size: 12px; color: #71717a;">
                      If you didn't expect this invitation, you can safely ignore this email.
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
  `;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Verify user is admin
    const { data: currentUser, error: profileError } = await supabaseClient
      .from('users')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (profileError || !currentUser || currentUser.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Only admins can send invitations' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Parse request body
    const payload: InvitationPayload = await req.json();
    const { email, role, message } = payload;

    if (!email || !role) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: email, role' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid role. Must be admin, editor, or viewer' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'A user with this email already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabaseClient
      .from('invitations')
      .select('id, email')
      .eq('email', email)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ success: false, error: 'An active invitation already exists for this email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Generate token and expiration (7 days)
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation in database
    const { data: invitation, error: insertError } = await supabaseClient
      .from('invitations')
      .insert({
        email,
        role,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating invitation:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create invitation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Send email if Resend is configured
    if (RESEND_API_KEY) {
      const emailHtml = createInvitationEmail({
        inviterName: currentUser.full_name || 'An administrator',
        role,
        token,
        expiresIn: '7 days',
        message,
      });

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: `You're invited to join SET VPC Roadmap`,
          html: emailHtml,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Resend API error:', result);
        // Don't fail the whole operation, just log the email error
        return new Response(
          JSON.stringify({
            success: true,
            invitation,
            emailSent: false,
            emailError: result.message || 'Failed to send email'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      console.log('Invitation email sent successfully:', result.id);
      return new Response(
        JSON.stringify({ success: true, invitation, emailSent: true, emailId: result.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Email not configured
    console.warn('RESEND_API_KEY not configured, invitation created but email not sent');
    return new Response(
      JSON.stringify({ success: true, invitation, emailSent: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error processing invitation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
