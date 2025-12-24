import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntakeLinkRequest {
  email: string;
  name: string;
  intakeToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, intakeToken }: IntakeLinkRequest = await req.json();

    if (!email || !name || !intakeToken) {
      throw new Error("Missing required fields: email, name, or intakeToken");
    }

    // Get the site URL from environment or use a default
    const siteUrl = Deno.env.get("SITE_URL") || "https://growyourbrand.lovable.app";
    const intakeUrl = `${siteUrl}/intake?token=${intakeToken}`;

    console.log(`Sending intake link to ${email} with token ${intakeToken}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "GrowYourBrand <onboarding@resend.dev>",
        to: [email],
        subject: "🎉 You're approved! Complete your intake to get started",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to GrowYourBrand!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 18px; margin-bottom: 20px;">Hey ${name}! 👋</p>
              
              <p style="margin-bottom: 20px;">
                Great news — <strong>you've been approved for our free beta!</strong> We're excited to help you grow your brand across multiple platforms.
              </p>
              
              <p style="margin-bottom: 25px;">
                Click the button below to complete your intake form and get started:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${intakeUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Complete Your Intake →
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                This link is unique to you. Please don't share it with others.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px;">
                If you didn't request this or have any questions, just reply to this email.
              </p>
              
              <p style="margin-top: 20px;">
                — The GrowYourBrand Team
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending intake link email:", error);
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
