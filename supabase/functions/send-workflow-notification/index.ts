import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WorkflowNotificationData {
  userEmail: string;
  userName?: string;
  sourcePlatform: string;
  destinations: string[];
  frequency: string;
  skippedSetup?: boolean;
}

const platformNames: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
  youtube: 'YouTube / Shorts',
  facebook: 'Facebook Reels',
  twitch: 'Twitch',
  snapchat: 'Snapchat',
  podcast: 'Podcast (RSS)',
  googledrive: 'Google Drive',
  dropbox: 'Dropbox',
  pinterest: 'Pinterest',
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== Workflow notification function invoked ===");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log("Raw request body:", rawBody);
    
    const data: WorkflowNotificationData = JSON.parse(rawBody);
    console.log("Parsed workflow data:", JSON.stringify(data, null, 2));

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    console.log("RESEND_API_KEY found, length:", apiKey.length);

    const sourceName = platformNames[data.sourcePlatform] || data.sourcePlatform;
    const destinationNames = data.destinations.map(d => platformNames[d] || d).join(', ');
    
    const subject = data.skippedSetup 
      ? `🔧 Workflow Setup Needed - ${data.userEmail}`
      : `🔄 New Workflow to Build - ${sourceName} → Multiple`;

    const emailContent = data.skippedSetup
      ? `
        <h2>User Skipped Workflow Setup</h2>
        <p>A user has completed onboarding but skipped the workflow setup step. They need you to set up their workflow manually.</p>
        
        <h3>User Details</h3>
        <ul>
          <li><strong>Email:</strong> ${data.userEmail}</li>
          ${data.userName ? `<li><strong>Name:</strong> ${data.userName}</li>` : ''}
          <li><strong>Posting Frequency:</strong> ${data.frequency || 'Not specified'}</li>
        </ul>
        
        <h3>Action Required</h3>
        <p>Please check their submitted credentials at the admin panel and reach out to discuss their workflow preferences.</p>
      `
      : `
        <h2>New Workflow to Build in Repurpose.io</h2>
        <p>A user has completed their workflow setup and is ready for you to build their repurposing workflow.</p>
        
        <h3>User Details</h3>
        <ul>
          <li><strong>Email:</strong> ${data.userEmail}</li>
          ${data.userName ? `<li><strong>Name:</strong> ${data.userName}</li>` : ''}
        </ul>
        
        <h3>Workflow Configuration</h3>
        <ul>
          <li><strong>Source Platform:</strong> ${sourceName}</li>
          <li><strong>Destination Platforms:</strong> ${destinationNames}</li>
          <li><strong>Posting Frequency:</strong> ${data.frequency}</li>
        </ul>
        
        <h3>Next Steps</h3>
        <ol>
          <li>Log into Repurpose.io</li>
          <li>Set up the workflow: ${sourceName} → ${destinationNames}</li>
          <li>Use the credentials from the admin panel</li>
          <li>Notify the user when complete</li>
        </ol>
      `;

    console.log("Sending workflow notification email to info@bornmadebosses.com...");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "BMB Notifications <onboarding@resend.dev>",
        to: ["info@bornmadebosses.com"],
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              h2 { color: #2563eb; }
              h3 { color: #4b5563; margin-top: 20px; }
              ul, ol { padding-left: 20px; }
              li { margin: 8px 0; }
              strong { color: #1f2937; }
            </style>
          </head>
          <body>
            ${emailContent}
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This notification was sent from the BMB onboarding system.
            </p>
          </body>
          </html>
        `,
      }),
    });

    const emailResponse = await res.json();
    console.log("Resend API response status:", res.status);
    console.log("Email response:", JSON.stringify(emailResponse, null, 2));

    if (!res.ok) {
      console.error("Email sending failed:", emailResponse);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse }),
        { status: res.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully!");
    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-workflow-notification:", error.message || error);
    console.error("Stack trace:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
