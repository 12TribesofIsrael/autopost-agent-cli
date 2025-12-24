import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BetaRequestData {
  name: string;
  email: string;
  businessType: string;
  platforms: string[];
  videosPerWeek: string;
  painPoint: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BetaRequestData = await req.json();
    console.log("Received beta request:", data);

    // Send notification email to you (the founder)
    const notificationRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Autopost Agent <onboarding@resend.dev>",
        to: ["delivered@resend.dev"], // Change this to your email once you verify domain
        subject: `🎉 New Beta Request from ${data.name}`,
        html: `
          <h1>New Beta Request!</h1>
          <p>Someone just signed up for the Autopost Agent beta.</p>
          
          <h2>Details:</h2>
          <ul>
            <li><strong>Name:</strong> ${data.name}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Business Type:</strong> ${data.businessType}</li>
            <li><strong>Platforms:</strong> ${data.platforms.join(", ")}</li>
            <li><strong>Videos per Week:</strong> ${data.videosPerWeek}</li>
            <li><strong>Pain Point:</strong> ${data.painPoint || "Not provided"}</li>
          </ul>
          
          <p>Reply to their email at: <a href="mailto:${data.email}">${data.email}</a></p>
        `,
      }),
    });

    const notificationData = await notificationRes.json();
    console.log("Notification email response:", notificationData);

    // Send confirmation email to the user
    const confirmationRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Autopost Agent <onboarding@resend.dev>",
        to: [data.email],
        subject: "Welcome to the Autopost Agent Beta! 🎬",
        html: `
          <h1>Thanks for joining the beta, ${data.name}!</h1>
          <p>I received your request and I'm excited to have you try out Autopost Agent.</p>
          
          <p>Here's what happens next:</p>
          <ol>
            <li>I'll review your info to make sure you're a good fit for the beta</li>
            <li>Within 24-48 hours, you'll hear back from me with your invite</li>
            <li>You can start uploading videos and I'll help you post everywhere!</li>
          </ol>
          
          <p>I'm a 13-year-old founder, so I'm keeping the beta small to make sure I can provide great support. Thanks for being patient!</p>
          
          <p>Talk soon,<br>The Autopost Agent Team</p>
        `,
      }),
    });

    const confirmationData = await confirmationRes.json();
    console.log("Confirmation email response:", confirmationData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: notificationData, 
        confirmation: confirmationData 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-beta-notification function:", error);
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
