import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CredentialNotificationData {
  platform: string;
  username: string;
  userEmail?: string;
}

const platformDisplayNames: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  snapchat: 'Snapchat',
  pinterest: 'Pinterest',
  linkedin: 'LinkedIn',
  twitch: 'Twitch',
  podcast: 'Podcast (RSS)',
  googledrive: 'Google Drive',
  dropbox: 'Dropbox',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: CredentialNotificationData = await req.json();
    console.log("Received credential notification request:", data);

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const platformName = platformDisplayNames[data.platform] || data.platform;

    // Send notification email to the team
    const notificationRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "GrowYourBrand <noreply@bornmadebosses.com>",
        to: ["info@bornmadebosses.com"],
        subject: `🔐 New Credentials Submitted: ${platformName}`,
        html: `
          <h1>New Platform Credentials Submitted</h1>
          <p>A user has submitted credentials for account setup.</p>
          
          <h2>Details:</h2>
          <ul>
            <li><strong>Platform:</strong> ${platformName}</li>
            <li><strong>Username:</strong> ${data.username}</li>
            ${data.userEmail ? `<li><strong>User Email:</strong> ${data.userEmail}</li>` : ''}
            <li><strong>Submitted:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          <p>
            <a href="https://growyourbrand.lovable.app/admin/credentials" 
               style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px;">
              View All Credentials
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Login to the admin panel to view the full credentials and set up the account.
          </p>
        `,
      }),
    });

    const notificationData = await notificationRes.json();
    console.log("Notification email response:", notificationData);

    if (!notificationRes.ok) {
      console.error("Failed to send email:", notificationData);
      return new Response(
        JSON.stringify({ error: "Failed to send notification email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: notificationData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-credentials-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
