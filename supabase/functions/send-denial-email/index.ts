import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DenialEmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: DenialEmailRequest = await req.json();

    if (!email || !name) {
      throw new Error("Missing required fields: email or name");
    }

    console.log(`Sending denial email to ${email}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "GrowYourBrand <onboarding@resend.dev>",
        to: [email],
        subject: "Update on your GrowYourBrand beta request",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #374151; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">GrowYourBrand</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 18px; margin-bottom: 20px;">Hey ${name},</p>
              
              <p style="margin-bottom: 20px;">
                Thank you for your interest in GrowYourBrand! We really appreciate you taking the time to sign up for our beta program.
              </p>
              
              <p style="margin-bottom: 20px;">
                Unfortunately, we're <strong>not taking any more clients at this time</strong>. We want to make sure we give our current beta users the best experience possible before expanding.
              </p>
              
              <p style="margin-bottom: 20px;">
                We'll keep your information on file and reach out if a spot opens up in the future.
              </p>
              
              <p style="margin-bottom: 20px;">
                Thanks again for your understanding!
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px;">
                If you have any questions, feel free to reply to this email.
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
    console.log("Denial email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending denial email:", error);
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
