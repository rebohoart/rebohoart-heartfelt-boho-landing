import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    console.log("Sending email:", { type, customerName, customerEmail });

    const isCustomOrder = type === "custom";
    // Store email is always the same for all order types
    const recipientEmail = "catarinarebocho30@gmail.com";
    
    const subject = isCustomOrder 
      ? "Novo Pedido de Orçamento - Peça Personalizada" 
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
                <h2>📋 Detalhes do Pedido de Orçamento</h2>
                <div class="info-block">
                  <p><span class="label">Cliente:</span> ${customerName}</p>
                  <p><span class="label">Email:</span> ${customerEmail}</p>
                </div>
                <h2>💡 Descrição da Peça</h2>
                <div class="info-block">
                  ${details}
                </div>
                <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                  ⏰ <strong>Próximo passo:</strong> Entre em contacto com o cliente para discutir o orçamento e disponibilidade.
                </p>
              ` : `
                <h2>🛍️ Detalhes da Encomenda</h2>
                <div class="info-block">
                  <p><span class="label">Cliente:</span> ${customerName}</p>
                  <p><span class="label">Email:</span> ${customerEmail}</p>
                </div>
                <h2>📦 Produtos</h2>
                <div class="info-block">
                  ${details}
                </div>
                <p style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 5px;">
                  ℹ️ <strong>Nota:</strong> O cliente foi informado para aguardar novas indicações.
                </p>
              `}
            </div>
            <div class="footer">
              <p>ReBoho Art • Email automático do sistema</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to shop owner
    const emailResponse = await resend.emails.send({
      from: "ReBoho Art <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to customer (for both cart orders and custom quote requests)
    const customerSubject = isCustomOrder
      ? "Pedido de Orçamento Recebido - ReBoho Art"
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
              <h1>✨ Pedido de Orçamento Recebido!</h1>
            </div>
            <div class="content">
              <p>Olá ${customerName},</p>
              <p>Recebemos o teu pedido de orçamento para uma peça personalizada! 🎨</p>
              <div class="info-block">
                <p><strong>📋 Resumo do Pedido:</strong></p>
                ${details}
              </div>
              <div class="highlight">
                <p><strong>📬 Próximos passos:</strong></p>
                <p>Vamos analisar o teu pedido e entraremos em contacto contigo em breve com:</p>
                <ul>
                  <li>Orçamento detalhado</li>
                  <li>Prazo de execução</li>
                  <li>Sugestões criativas</li>
                </ul>
              </div>
              <p>Aguarda as nossas indicações. Qualquer dúvida, não hesites em contactar-nos!</p>
              <p style="margin-top: 30px;">Com carinho,<br><strong>ReBoho Art</strong> 🌿</p>
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
              <h1>✨ Obrigada pela tua encomenda!</h1>
            </div>
            <div class="content">
              <p>Olá ${customerName},</p>
              <p>Recebemos a tua encomenda com sucesso! 🎉</p>
              <div class="highlight">
                <p><strong>📬 Próximos passos:</strong></p>
                <p>Iremos entrar em contacto contigo brevemente com:</p>
                <ul>
                  <li>Confirmação de disponibilidade</li>
                  <li>Informações de pagamento</li>
                  <li>Detalhes de envio</li>
                </ul>
              </div>
              <p>Aguarda as nossas indicações. Qualquer dúvida, não hesites em contactar-nos!</p>
              <p style="margin-top: 30px;">Com carinho,<br><strong>ReBoho Art</strong> 🌿</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: "ReBoho Art <onboarding@resend.dev>",
      to: [customerEmail],
      subject: customerSubject,
      html: customerEmailHtml,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
