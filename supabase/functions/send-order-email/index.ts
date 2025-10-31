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

  try {
    const { type, customerName, customerEmail, details }: OrderEmailRequest = await req.json();

    console.log("=== EMAIL SENDING START ===");
    console.log("Request type:", type);
    console.log("Customer name:", customerName);
    console.log("Customer email:", customerEmail);

    // Verify environment variables
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPassword) {
      console.error("ERROR: Missing environment variables");
      console.error("GMAIL_USER present:", !!gmailUser);
      console.error("GMAIL_APP_PASSWORD present:", !!gmailPassword);
      throw new Error("Email configuration error: Missing credentials");
    }

    console.log("Gmail user:", gmailUser);
    console.log("Environment variables verified successfully");

    const isCustomOrder = type === "custom";
    const recipientEmail = Deno.env.get("STORE_EMAIL") || "catarinarebocho30@gmail.com";

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
                <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                  <strong>Proximo passo:</strong> Entre em contacto com o cliente para discutir o orcamento e disponibilidade.
                </p>
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
                <p style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 5px;">
                  <strong>Nota:</strong> O cliente foi informado para aguardar novas indicacoes.
                </p>
              `}
            </div>
            <div class="footer">
              <p>ReBoho Art - Email automatico do sistema</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("Configuring SMTP client...");
    console.log("SMTP server: smtp.gmail.com:465");

    // Configure SMTP client with Gmail
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

    console.log("SMTP client configured successfully");

    // Send email to shop owner
    console.log("Sending email to store owner:", recipientEmail);
    console.log("From:", gmailUser);
    console.log("Subject:", subject);

    try {
      await client.send({
        from: gmailUser,
        to: recipientEmail,
        subject: subject,
        content: "auto",
        html: emailHtml,
      });
      console.log("✓ Email sent successfully to store owner:", recipientEmail);
    } catch (error) {
      console.error("✗ Failed to send email to store owner");
      console.error("Error details:", error);
      throw new Error(`Failed to send email to store: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            .highlight { background: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .info-block { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #D4A574; }
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
              <div class="info-block">
                <p><strong>Resumo do Pedido:</strong></p>
                ${details}
              </div>
              <div class="highlight">
                <p><strong>Proximos passos:</strong></p>
                <p>Vamos analisar o teu pedido e entraremos em contacto contigo em breve com:</p>
                <ul>
                  <li>Orcamento detalhado</li>
                  <li>Prazo de execucao</li>
                  <li>Sugestoes criativas</li>
                </ul>
              </div>
              <p>Aguarda as nossas indicacoes. Qualquer duvida, nao hesites em contactar-nos!</p>
              <p style="margin-top: 30px;">Com carinho,<br><strong>ReBoho Art</strong></p>
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
            .highlight { background: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
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
              <div class="highlight">
                <p><strong>Proximos passos:</strong></p>
                <p>Iremos entrar em contacto contigo brevemente com:</p>
                <ul>
                  <li>Confirmacao de disponibilidade</li>
                  <li>Informacoes de pagamento</li>
                  <li>Detalhes de envio</li>
                </ul>
              </div>
              <p>Aguarda as nossas indicacoes. Qualquer duvida, nao hesites em contactar-nos!</p>
              <p style="margin-top: 30px;">Com carinho,<br><strong>ReBoho Art</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("Sending confirmation email to customer:", customerEmail);
    console.log("Subject:", customerSubject);

    try {
      await client.send({
        from: gmailUser,
        to: customerEmail,
        subject: customerSubject,
        content: "auto",
        html: customerEmailHtml,
      });
      console.log("✓ Email sent successfully to customer:", customerEmail);
    } catch (error) {
      console.error("✗ Failed to send email to customer");
      console.error("Error details:", error);
      // Don't throw here - store owner already received the order
      console.warn("Warning: Customer confirmation email failed, but order was received by store");
    }

    console.log("Closing SMTP connection...");
    try {
      await client.close();
      console.log("✓ SMTP connection closed");
    } catch (error) {
      console.error("Warning: Error closing SMTP connection:", error);
      // Non-critical error, continue
    }

    console.log("=== EMAIL SENDING COMPLETED SUCCESSFULLY ===");

    return new Response(JSON.stringify({
      success: true,
      message: "Emails sent successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("=== EMAIL SENDING FAILED ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error details:", error);

    const message = error instanceof Error ? error.message : "Unknown error occurred";

    console.error("Final error message:", message);

    return new Response(
      JSON.stringify({
        success: false,
        error: message
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
