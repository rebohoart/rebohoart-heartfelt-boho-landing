import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

interface EmailTemplate {
  id: string;
  template_type: string;
  subject: string;
  html_content: string;
}

// Helper function to replace template variables
const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const debugLog: string[] = [];
  const log = (message: string) => {
    console.log(message);
    debugLog.push(message);
  };

  try {
    const { type, customerName, customerEmail, details }: OrderEmailRequest = await req.json();

    log("=== EMAIL SENDING START ===");
    log(`Request type: ${type}`);
    log(`Customer name: ${customerName}`);
    log(`Customer email: ${customerEmail}`);

    // Verify environment variables
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    const storeEmail = Deno.env.get("STORE_EMAIL") || "catarinarebocho30@gmail.com";

    log("=== ENVIRONMENT VARIABLES CHECK ===");
    log(`GMAIL_USER present: ${!!gmailUser}`);
    log(`GMAIL_USER value: ${gmailUser || 'NOT SET'}`);
    log(`GMAIL_APP_PASSWORD present: ${!!gmailPassword}`);
    log(`GMAIL_APP_PASSWORD length: ${gmailPassword?.length || 0} chars`);
    log(`STORE_EMAIL: ${storeEmail}`);

    if (!gmailUser || !gmailPassword) {
      const error = "Missing environment variables";
      log(`ERROR: ${error}`);
      throw new Error(error);
    }

    // Validate Gmail credentials format
    if (!gmailUser.includes('@gmail.com')) {
      log('WARNING: GMAIL_USER does not look like a Gmail address');
    }
    if (gmailPassword.length !== 16) {
      log(`WARNING: GMAIL_APP_PASSWORD length is ${gmailPassword.length}, expected 16`);
    }

    const isCustomOrder = type === "custom";

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    log("=== FETCHING EMAIL TEMPLATES FROM DATABASE ===");

    // Fetch store email template (ordered by updated_at to ensure latest version)
    // Note: Using array access instead of .single() to avoid caching issues
    const storeTemplateType = isCustomOrder ? 'custom_order_store' : 'cart_order_store';
    const { data: storeTemplates, error: storeTemplateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', storeTemplateType)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (storeTemplateError || !storeTemplates || storeTemplates.length === 0) {
      const errorMsg = storeTemplateError?.message || 'No template found';
      log(`Error fetching store template: ${errorMsg}`);
      throw new Error(`Failed to fetch store email template: ${errorMsg}`);
    }

    const storeTemplate = storeTemplates[0];
    log(`Store template fetched: ${storeTemplateType} (updated_at: ${storeTemplate.updated_at})`);
    log(`Store template ID: ${storeTemplate.id}`);

    // Fetch customer email template (ordered by updated_at to ensure latest version)
    // Note: Using array access instead of .single() to avoid caching issues
    const customerTemplateType = isCustomOrder ? 'custom_order_customer' : 'cart_order_customer';
    const { data: customerTemplates, error: customerTemplateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', customerTemplateType)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (customerTemplateError || !customerTemplates || customerTemplates.length === 0) {
      const errorMsg = customerTemplateError?.message || 'No template found';
      log(`Error fetching customer template: ${errorMsg}`);
      throw new Error(`Failed to fetch customer email template: ${errorMsg}`);
    }

    const customerTemplate = customerTemplates[0];
    log(`Customer template fetched: ${customerTemplateType} (updated_at: ${customerTemplate.updated_at})`);
    log(`Customer template ID: ${customerTemplate.id}`);

    // Prepare template variables
    const templateVariables = {
      customerName,
      customerEmail,
      details,
      subject: storeTemplate.subject,
    };

    // Replace variables in store email template
    const subject = storeTemplate.subject;
    const emailHtml = replaceTemplateVariables(storeTemplate.html_content, templateVariables);

    log("=== SMTP CLIENT CONFIGURATION ===");
    log("Hostname: smtp.gmail.com");
    log("Port: 465");
    log("TLS: true");
    log(`Auth username: ${gmailUser}`);

    // Configure SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailPassword,
        },
      },
    });

    log("SMTP client created successfully");

    // Send email to shop owner
    log("=== SENDING EMAIL TO STORE ===");
    log(`From: ${gmailUser}`);
    log(`To: ${storeEmail}`);
    log(`Subject: ${subject}`);

    let storeEmailSuccess = false;
    let storeEmailError = null;

    try {
      await client.send({
        from: gmailUser,
        to: storeEmail,
        subject: subject,
        content: "auto",
        html: emailHtml,
      });
      log(`✓ Email sent successfully to store: ${storeEmail}`);
      storeEmailSuccess = true;
    } catch (error) {
      log("✗ Failed to send email to store");
      log(`Error type: ${error?.constructor?.name}`);
      log(`Error message: ${error instanceof Error ? error.message : String(error)}`);
      log(`Error details: ${JSON.stringify(error, null, 2)}`);
      storeEmailError = error;
      // Store email is critical, so we throw
      throw new Error(`Failed to send store email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Send confirmation email to customer
    const customerSubject = customerTemplate.subject;
    const customerEmailHtml = replaceTemplateVariables(customerTemplate.html_content, {
      customerName,
      customerEmail,
      details,
      subject: customerTemplate.subject,
    });

    log("=== SENDING EMAIL TO CUSTOMER ===");
    log(`From: ${gmailUser}`);
    log(`To: ${customerEmail}`);
    log(`Subject: ${customerSubject}`);

    let customerEmailSuccess = false;
    let customerEmailError = null;

    try {
      await client.send({
        from: gmailUser,
        to: customerEmail,
        subject: customerSubject,
        content: "auto",
        html: customerEmailHtml,
      });
      log(`✓ Email sent successfully to customer: ${customerEmail}`);
      customerEmailSuccess = true;
    } catch (error) {
      log("✗ Failed to send email to customer");
      log(`Error type: ${error?.constructor?.name}`);
      log(`Error message: ${error instanceof Error ? error.message : String(error)}`);
      log(`Error details: ${JSON.stringify(error, null, 2)}`);
      customerEmailError = error;
      // Customer email is not critical, log but continue
    }

    log("=== CLOSING SMTP CONNECTION ===");
    try {
      await client.close();
      log("✓ SMTP connection closed");
    } catch (error) {
      log(`Warning: Error closing SMTP connection: ${error}`);
    }

    log("=== EMAIL SENDING COMPLETED ===");

    // Return detailed response
    return new Response(JSON.stringify({
      success: true,
      message: "Email processing completed",
      details: {
        storeEmail: {
          sent: storeEmailSuccess,
          recipient: storeEmail,
          error: storeEmailError ? String(storeEmailError) : null
        },
        customerEmail: {
          sent: customerEmailSuccess,
          recipient: customerEmail,
          error: customerEmailError ? String(customerEmailError) : null
        }
      },
      debug: debugLog
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    log("=== EMAIL SENDING FAILED ===");
    log(`Error type: ${error?.constructor?.name}`);
    log(`Error message: ${error instanceof Error ? error.message : String(error)}`);

    const message = error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        debug: debugLog
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
