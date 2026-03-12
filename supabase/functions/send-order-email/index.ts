import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  type: "custom" | "cart";
  customerName: string;
  customerEmail: string;
  details: string;
}

// ── Validação de input ────────────────────────────────────────────────────────
const validateInput = (body: OrderEmailRequest): string | null => {
  if (!body.type || !["custom", "cart"].includes(body.type)) {
    return "Invalid type. Must be 'custom' or 'cart'.";
  }
  if (!body.customerName || typeof body.customerName !== "string" || body.customerName.trim().length < 2) {
    return "customerName is required and must have at least 2 characters.";
  }
  if (!body.customerEmail || typeof body.customerEmail !== "string") {
    return "customerEmail is required.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.customerEmail)) {
    return "customerEmail is not a valid email address.";
  }
  if (!body.details || typeof body.details !== "string" || body.details.trim().length === 0) {
    return "details is required.";
  }
  if (body.customerName.length > 200) return "customerName too long.";
  if (body.customerEmail.length > 255) return "customerEmail too long.";
  if (body.details.length > 100000) return "details too long.";
  return null;
};

// ── Template helpers ─────────────────────────────────────────────────────────
const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
};

const cleanHtmlForEmail = (html: string): string =>
  html.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();

// ── Handler ───────────────────────────────────────────────────────────────────
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: OrderEmailRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ── Validate input ──────────────────────────────────────────────────────
    const validationError = validateInput(body);
    if (validationError) {
      return new Response(
        JSON.stringify({ success: false, error: validationError }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { type, customerName, customerEmail, details } = body;

    // ── Environment variables ───────────────────────────────────────────────
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    const storeEmail = Deno.env.get("STORE_EMAIL") || "catarinarebocho30@gmail.com";

    if (!gmailUser || !gmailPassword) {
      console.error("Missing required environment variables: GMAIL_USER or GMAIL_APP_PASSWORD");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ── Fetch templates from DB ─────────────────────────────────────────────
    const isCustomOrder = type === "custom";
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const storeTemplateType = isCustomOrder ? "custom_order_store" : "cart_order_store";
    const customerTemplateType = isCustomOrder ? "custom_order_customer" : "cart_order_customer";

    const [{ data: storeTemplates, error: storeErr }, { data: customerTemplates, error: customerErr }] =
      await Promise.all([
        supabaseClient.from("email_templates").select("*").eq("template_type", storeTemplateType).order("updated_at", { ascending: false }).limit(1),
        supabaseClient.from("email_templates").select("*").eq("template_type", customerTemplateType).order("updated_at", { ascending: false }).limit(1),
      ]);

    if (storeErr || !storeTemplates?.length) {
      console.error("Failed to fetch store template:", storeErr?.message);
      throw new Error("Failed to fetch store email template.");
    }
    if (customerErr || !customerTemplates?.length) {
      console.error("Failed to fetch customer template:", customerErr?.message);
      throw new Error("Failed to fetch customer email template.");
    }

    const storeTemplate = storeTemplates[0];
    const customerTemplate = customerTemplates[0];

    const templateVars = { customerName, customerEmail, details, subject: storeTemplate.subject };

    const storeEmailHtml = cleanHtmlForEmail(replaceTemplateVariables(storeTemplate.html_content, templateVars));
    const customerEmailHtml = cleanHtmlForEmail(replaceTemplateVariables(customerTemplate.html_content, { ...templateVars, subject: customerTemplate.subject }));

    // ── SMTP ────────────────────────────────────────────────────────────────
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: { username: gmailUser, password: gmailPassword },
      },
      debug: { log: false, allowUnsecure: false, encodeLB: true, noStartTLS: false },
    });

    // Send to store (critical)
    await client.send({
      from: gmailUser,
      to: storeEmail,
      subject: storeTemplate.subject,
      content: "text/html",
      html: storeEmailHtml,
    });

    // Send to customer (non-critical)
    let customerEmailSent = false;
    let customerEmailError: string | null = null;
    try {
      await client.send({
        from: gmailUser,
        to: customerEmail,
        subject: customerTemplate.subject,
        content: "text/html",
        html: customerEmailHtml,
      });
      customerEmailSent = true;
    } catch (err) {
      console.error("Failed to send customer email:", err instanceof Error ? err.message : String(err));
      customerEmailError = "Failed to send confirmation email to customer.";
    }

    try {
      await client.close();
    } catch {
      // ignore close errors
    }

    return new Response(
      JSON.stringify({
        success: true,
        details: {
          storeEmail: { sent: true, recipient: storeEmail },
          customerEmail: { sent: customerEmailSent, recipient: customerEmail, error: customerEmailError },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Email handler error:", message);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send email. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);