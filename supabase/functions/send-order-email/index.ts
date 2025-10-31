import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    const subject = isCustomOrder
      ? "Novo Pedido de Orcamento - Peca Personalizada"
      : "Nova Encomenda ReBoho";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .info-block { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #D4A574; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            h1 { margin: 0; font-size: 24px; }
            h2 { color: #D4A574; font-size: 18px; margin-top: 0; }
            .label { font-weight: bold; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${subject}</h1>
            </div>
            <div class="content">
              ${isCustomOrder ? `
                <h2>Detalhes do Pedido de Orcamento</h2>
                <div class="info-block">
                  <p><span class="label">Cliente:</span> ${customerName}</p>
                  <p><span class="label">Email:</span> ${customerEmail}</p>
                </div>
                <h2>Descricao da Peca</h2>
                <div class="info-block">
                  ${details}
                </div>
              ` : `
                <h2>Detalhes da Encomenda</h2>
                <div class="info-block">
                  <p><span class="label">Cliente:</span> ${customerName}</p>
                  <p><span class="label">Email:</span> ${customerEmail}</p>
                </div>
                <h2>Produtos</h2>
                <div class="info-block">
                  ${details}
                </div>
              `}
            </div>
            <div class="footer">
              <p>ReBoho Art - Email automatico do sistema</p>
            </div>
          </div>
        </body>
      </html>
    `;

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
    const customerSubject = isCustomOrder
      ? "Pedido de Orcamento Recebido - ReBoho Art"
      : "Encomenda Recebida - ReBoho Art";

    const customerEmailHtml = isCustomOrder ? `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            h1 { margin: 0; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Pedido de Orcamento Recebido!</h1>
            </div>
            <div class="content">
              <p>Ola ${customerName},</p>
              <p>Recebemos o teu pedido de orcamento para uma peca personalizada!</p>
              <p>Vamos analisar o teu pedido e entraremos em contacto contigo em breve.</p>
              <p>Com carinho,<br><strong>ReBoho Art</strong></p>
            </div>
          </div>
        </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            h1 { margin: 0; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Obrigada pela tua encomenda!</h1>
            </div>
            <div class="content">
              <p>Ola ${customerName},</p>
              <p>Recebemos a tua encomenda com sucesso!</p>
              <p>Iremos entrar em contacto contigo brevemente com informacoes de pagamento e envio.</p>
              <p>Com carinho,<br><strong>ReBoho Art</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

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
