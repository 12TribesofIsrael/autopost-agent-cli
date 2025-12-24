import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW = 60 * 1000; // per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn("TURNSTILE_SECRET_KEY not set, skipping verification");
    return true;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await response.json();
    console.log("Turnstile verification result:", data);
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

interface BetaRequestData {
  name: string;
  email: string;
  businessType: string;
  serviceTier?: string;
  sourcePlatform?: string;
  platforms: string[];
  videosPerWeek: string;
  painPoint: string;
  turnstileToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data: BetaRequestData = await req.json();
    console.log("Received beta request from:", data.email);

    // Verify Turnstile CAPTCHA
    if (data.turnstileToken) {
      const isValid = await verifyTurnstile(data.turnstileToken, clientIp);
      if (!isValid) {
        console.warn("Turnstile verification failed for:", data.email);
        return new Response(
          JSON.stringify({ error: "CAPTCHA verification failed. Please try again." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Basic input validation
    if (!data.name || !data.email || !data.businessType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send notification email to you (the founder)
    const notificationRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "GrowYourBrand <onboarding@resend.dev>",
        to: ["delivered@resend.dev"], // Change this to your email once you verify domain
        subject: `🎉 New Beta Request from ${data.name}`,
        html: `
          <h1>New Beta Request!</h1>
          <p>Someone just signed up for the GrowYourBrand beta.</p>
          
          <h2>Details:</h2>
          <ul>
            <li><strong>Name:</strong> ${data.name}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Business Type:</strong> ${data.businessType}</li>
            <li><strong>Service Tier:</strong> ${data.serviceTier || "Not specified"}</li>
            <li><strong>Source Platform:</strong> ${data.sourcePlatform || "N/A"}</li>
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
        from: "GrowYourBrand <onboarding@resend.dev>",
        to: [data.email],
        subject: "Welcome to GrowYourBrand Beta! 🎬",
        html: `
          <h1>Thanks for joining the beta, ${data.name}!</h1>
          <p>We received your request and are excited to have you try out GrowYourBrand.</p>
          
          <p>Here's what happens next:</p>
          <ol>
            <li>We'll review your info to make sure you're a good fit for the beta</li>
            <li>Within 24-48 hours, you'll hear back from us with your invite</li>
            <li>You can start uploading videos and we'll help you post everywhere!</li>
          </ol>
          
          <p>We're keeping the beta small to ensure great support. Thanks for your patience!</p>
          
          <p>Talk soon,<br>The GrowYourBrand Team</p>
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
